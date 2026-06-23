import SwiftUI

/// The adaptive Q&A runner UI (Study / Practice / Daily Review).
struct SessionView: View {
    @Environment(LocaleStore.self) private var loc
    @Environment(\.dismiss) private var dismiss
    @State private var runner: SessionRunner
    @State private var confetti = false

    /// Called when the user finishes and wants a brand-new session of the same kind.
    var onRestart: (() -> Void)?

    init(session: PracticeSessionOut, revealFeedback: Bool = true, onRestart: (() -> Void)? = nil) {
        _runner = State(initialValue: SessionRunner(session: session, revealFeedback: revealFeedback))
        self.onRestart = onRestart
    }

    private var r: PracticeStrings.Runner { loc.t.practice.runner }

    var body: some View {
        NavigationStack {
            ZStack {
                Palette.background.ignoresSafeArea()
                content
                ConfettiView(fire: $confetti)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button { dismiss() } label: { Image(systemName: "xmark") }
                        .tint(Palette.mutedForeground)
                }
                ToolbarItem(placement: .principal) { progressHeader }
                ToolbarItem(placement: .topBarTrailing) {
                    if runner.stage == .question || runner.stage == .feedback {
                        Button(loc.t.practice.runner.finish) { Task { await runner.finish() } }
                            .font(.subheadline.weight(.medium))
                    }
                }
            }
        }
        .interactiveDismissDisabled()
        .task { await runner.loadNext() }
    }

    // MARK: - Stage content

    @ViewBuilder private var content: some View {
        switch runner.stage {
        case .loading, .finishing:
            ProgressView().controlSize(.large)
        case .error(let msg):
            VStack(spacing: Metric.gap) {
                Image(systemName: "wifi.exclamationmark").font(.largeTitle).foregroundStyle(Palette.destructive)
                Text(msg).foregroundStyle(Palette.mutedForeground).multilineTextAlignment(.center)
                SecondaryButton(title: loc.t.common.actions.retry) { Task { await runner.loadNext() } }
                    .frame(maxWidth: 220)
            }.padding()
        case .finished:
            if let summary = runner.summary {
                SessionSummaryView(
                    summary: summary,
                    onDone: { dismiss() },
                    onRestart: onRestart.map { restart in { dismiss(); restart() } }
                )
            }
        case .question, .feedback:
            questionScreen
        }
    }

    private var progressHeader: some View {
        VStack(spacing: 3) {
            Text(r.progress(max(runner.delivered + (runner.stage == .feedback ? 0 : 1), 1), runner.target))
                .font(.caption.weight(.semibold))
                .foregroundStyle(Palette.foreground)
            ProgressView(value: runner.progress)
                .tint(Palette.primary)
                .frame(width: 140)
        }
    }

    private var questionScreen: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: Metric.pad) {
                    statRail
                    if let item = runner.current {
                        Text(item.content)
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(Palette.foreground)
                            .fixedSize(horizontal: false, vertical: true)

                        ForEach(item.options) { option in
                            OptionRow(
                                option: option,
                                state: optionState(option),
                                action: {
                                    guard runner.stage == .question else { return }
                                    Haptics.select()
                                    withAnimation(.snappy) { runner.selectedOptionId = option.id }
                                }
                            )
                        }

                        if runner.stage == .feedback, let result = runner.result {
                            FeedbackCard(result: result)
                                .transition(.move(edge: .bottom).combined(with: .opacity))
                        }
                    }
                }
                .padding(Metric.pad)
            }
            actionBar
        }
        .animation(.snappy, value: runner.stage)
    }

    // MARK: - Stat rail (ability θ, streak, accuracy)

    private var statRail: some View {
        HStack(spacing: 8) {
            if let theta = runner.theta {
                Pill(text: "θ \(String(format: "%.2f", theta))", icon: "gauge.medium")
            }
            if runner.streak >= 2 {
                Pill(text: r.panel.streak(runner.streak), icon: "flame.fill", color: Palette.chart4)
            }
            Spacer()
            Pill(text: "\(Int(runner.accuracy * 100))%", color: Palette.studySuccess)
        }
    }

    // MARK: - Action bar (pinned)

    private var actionBar: some View {
        VStack(spacing: 0) {
            Divider().overlay(Palette.border)
            Group {
                if runner.stage == .question {
                    HStack(spacing: 12) {
                        Button(r.skip) { Task { await runner.skip() } }
                            .font(.body.weight(.medium))
                            .foregroundStyle(Palette.mutedForeground)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Palette.secondary, in: RoundedRectangle(cornerRadius: Metric.radiusMd))
                        PrimaryButton(title: r.submit, enabled: runner.selectedOptionId != nil) {
                            Task { await runner.submit() }
                        }
                    }
                } else {
                    PrimaryButton(title: runner.isLastQuestion ? r.finish : r.next) {
                        Task { await runner.proceed() }
                    }
                }
            }
            .padding(Metric.pad)
            .background(.ultraThinMaterial)
        }
    }

    private func optionState(_ option: NextOptionOut) -> OptionRow.State {
        if runner.stage == .feedback, let result = runner.result {
            if option.id == result.correctOptionId { return .correct }
            if option.id == runner.selectedOptionId { return .wrong }
            return .dimmed
        }
        return runner.selectedOptionId == option.id ? .selected : .idle
    }
}

// MARK: - Option row

struct OptionRow: View {
    enum State { case idle, selected, correct, wrong, dimmed }
    let option: NextOptionOut
    let state: State
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                ZStack {
                    Circle().fill(badgeFill).frame(width: 28, height: 28)
                    Group {
                        switch state {
                        case .correct: Image(systemName: "checkmark")
                        case .wrong:   Image(systemName: "xmark")
                        default:       Text(option.key.uppercased())
                        }
                    }
                    .font(.footnote.bold())
                    .foregroundStyle(badgeText)
                }
                Text(option.content)
                    .font(.body)
                    .foregroundStyle(Palette.foreground)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(14)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: Metric.radiusLg, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Metric.radiusLg, style: .continuous)
                    .stroke(border, lineWidth: state == .idle ? 1 : 2)
            )
            .opacity(state == .dimmed ? 0.5 : 1)
        }
        .buttonStyle(.plain)
        .animation(.snappy, value: state)
    }

    private var accent: Color {
        switch state {
        case .correct: return Palette.studySuccess
        case .wrong:   return Palette.studyDanger
        case .selected: return Palette.primary
        default:       return Palette.border
        }
    }
    private var background: Color {
        switch state {
        case .correct: return Palette.studySuccess.opacity(0.12)
        case .wrong:   return Palette.studyDanger.opacity(0.12)
        case .selected: return Palette.primary.opacity(0.10)
        default:       return Palette.card
        }
    }
    private var border: Color { state == .idle || state == .dimmed ? Palette.border : accent }
    private var badgeFill: Color {
        switch state {
        case .idle, .dimmed: return Palette.secondary
        default: return accent
        }
    }
    private var badgeText: Color {
        switch state {
        case .idle, .dimmed: return Palette.foreground
        default: return Palette.primaryForeground
        }
    }
}

// MARK: - Feedback card

struct FeedbackCard: View {
    @Environment(LocaleStore.self) private var loc
    let result: AnswerResultOut

    private var r: PracticeStrings.Runner { loc.t.practice.runner }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: result.isCorrect ? "checkmark.seal.fill" : "xmark.octagon.fill")
                Text(result.isCorrect ? r.correct : r.incorrect).font(.headline)
                Spacer()
                let delta = result.thetaAfter - result.thetaBefore
                Label(String(format: "%+.2f", delta), systemImage: delta >= 0 ? "arrow.up.right" : "arrow.down.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(delta >= 0 ? Palette.studySuccess : Palette.studyDanger)
            }
            .foregroundStyle(result.isCorrect ? Palette.studySuccess : Palette.studyDanger)

            if let explanation = result.explanation, !explanation.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text(r.explanation).font(.caption.weight(.semibold)).foregroundStyle(Palette.mutedForeground)
                    Text(explanation).font(.subheadline).foregroundStyle(Palette.foreground)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            HStack(spacing: 6) {
                Image(systemName: "calendar").font(.caption2)
                Text(r.schedule.label + ": " + scheduleText())
                    .font(.caption)
            }
            .foregroundStyle(Palette.mutedForeground)
        }
        .padding(Metric.pad)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background((result.isCorrect ? Palette.studySuccess : Palette.studyDanger).opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: Metric.radiusLg, style: .continuous))
    }

    private func scheduleText() -> String {
        guard let due = result.card.dueAt else { return r.schedule.soon }
        let secs = due.timeIntervalSinceNow
        if secs <= 0 { return r.schedule.soon }
        let mins = Int(secs / 60), hours = Int(secs / 3600), days = Int(secs / 86400)
        if days >= 1 { return r.schedule.inDays(days) }
        if hours >= 1 { return r.schedule.inHours(hours) }
        if mins >= 1 { return r.schedule.inMinutes(mins) }
        return r.schedule.soon
    }
}

import SwiftUI

struct ExamView: View {
    @Environment(LocaleStore.self) private var loc
    @State private var runner = ExamRunner()
    @State private var showSheet = false
    @State private var showReview = false
    @State private var showExitConfirm = false

    private var x: PracticeStrings.Exam { loc.t.practice.exam }

    var body: some View {
        Group {
            switch runner.phase {
            case .setup:      setup
            case .loading, .submitting: ProgressView().controlSize(.large)
            case .ready:      ready
            case .exam:       examRunner
            case .results:    results
            }
        }
        .navigationTitle(x.pageTitle)
        .navigationBarTitleDisplayMode(.inline)
        .listRowBackground(Palette.card)
        .synapseScreen()
        .screenContentTop()
        .toolbar(runner.phase == .exam ? .hidden : .visible, for: .navigationBar)
    }

    // MARK: setup
    private var setup: some View {
        Form {
            Section {
                Picker(x.setup.examLabel, selection: $runner.examType) {
                    ForEach(ItemLabels.examTypes, id: \.self) { Text(ItemLabels.examType[$0] ?? $0).tag($0) }
                }
                Picker(x.setup.partLabel, selection: $runner.examPart) {
                    Text(x.setup.anyPart).tag(String?.none)
                    Text(x.setup.basic).tag(String?.some("basic_sciences"))
                    Text(x.setup.clinical).tag(String?.some("clinical_sciences"))
                }
            } header: { Text(x.setup.title) } footer: { Text(x.setup.scopeHint) }

            Section {
                Toggle(x.setup.feedbackLabel, isOn: $runner.feedbackMode)
            } footer: { Text(x.setup.feedbackHint) }

            Section {
                Button { Task { await runner.start() } } label: {
                    Text(x.setup.start).fontWeight(.semibold)
                }
                .disabled(!runner.canStart)
            } footer: {
                if runner.error == "empty" { Text(x.setup.empty).foregroundStyle(Palette.destructive) }
                else if let error = runner.error { Text(error).foregroundStyle(Palette.destructive) }
            }
        }
    }

    // MARK: ready
    private var ready: some View {
        VStack(spacing: Metric.padLg) {
            Spacer()
            Image(systemName: "doc.text.fill").font(.system(size: 56)).foregroundStyle(Palette.primary)
            Text(x.ready.eyebrow).font(.headline).foregroundStyle(Palette.primary)
            Text(x.ready.questions(runner.items.count)).font(.largeTitle.bold()).foregroundStyle(Palette.foreground)
            VStack(alignment: .leading, spacing: 10) {
                rule(x.ready.rule1)
                rule(x.ready.rule2)
                rule(runner.feedbackMode ? x.ready.feedbackOn : x.ready.feedbackOff)
                rule(x.ready.noTimeLimit)
            }
            .padding(Metric.pad)
            .background(Palette.card, in: RoundedRectangle(cornerRadius: Metric.radiusLg))
            Spacer()
            PrimaryButton(title: x.ready.begin) { runner.begin() }
        }
        .padding(Metric.pad)
    }
    private func rule(_ t: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "checkmark.circle.fill").foregroundStyle(Palette.primary).font(.caption)
            Text(t).font(.subheadline).foregroundStyle(Palette.foreground)
            Spacer(minLength: 0)
        }
    }

    // MARK: exam runner
    private var examRunner: some View {
        VStack(spacing: 0) {
            examHeader
            if let error = runner.error {
                ErrorBanner(message: error)
                    .padding(.horizontal, Metric.pad)
                    .padding(.top, 8)
            }
            ScrollView {
                if let it = runner.item {
                    VStack(alignment: .leading, spacing: Metric.pad) {
                        Text(it.content).font(.title3.weight(.semibold)).foregroundStyle(Palette.foreground)
                            .fixedSize(horizontal: false, vertical: true)
                        ForEach(it.options) { opt in
                            examOption(it, opt)
                        }
                        if let res = runner.results[it.itemId], let exp = res.explanation, !exp.isEmpty {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(x.feedback.explanation).font(.caption.weight(.semibold)).foregroundStyle(Palette.mutedForeground)
                                Text(exp).font(.subheadline).foregroundStyle(Palette.foreground)
                            }
                            .padding(Metric.pad)
                            .background(Palette.secondary, in: RoundedRectangle(cornerRadius: Metric.radiusMd))
                        }
                    }
                    .padding(Metric.pad)
                }
            }
            examNav
        }
        .confirmationDialog(x.runner.exitConfirm, isPresented: $showExitConfirm, titleVisibility: .visible) {
            Button(x.runner.exit, role: .destructive) { runner.reset() }
            Button(loc.t.common.actions.cancel, role: .cancel) {}
        }
        .sheet(isPresented: $showSheet) { answerSheet }
        .sheet(isPresented: $showReview) { reviewSheet }
    }

    private var examHeader: some View {
        HStack {
            Button { showExitConfirm = true } label: { Image(systemName: "xmark") }
                .tint(Palette.mutedForeground)
            Spacer()
            TimelineView(.periodic(from: .now, by: 1)) { _ in
                Label(fmtTime(Int(Date().timeIntervalSince(runner.startedAt))), systemImage: "clock")
                    .font(.subheadline.monospacedDigit()).foregroundStyle(Palette.mutedForeground)
            }
            Spacer()
            Button { showSheet = true } label: {
                Label("\(runner.answeredCount)/\(runner.items.count)", systemImage: "square.grid.3x3")
                    .font(.subheadline.weight(.medium))
            }
        }
        .padding(.horizontal, Metric.pad).padding(.vertical, 10)
        .background(.ultraThinMaterial)
    }

    private func examOption(_ it: ExamItemOut, _ opt: NextOptionOut) -> some View {
        let selected = (runner.answers[it.itemId] ?? nil) == opt.id
        let res = runner.results[it.itemId]
        var state: OptionRow.State = selected ? .selected : .idle
        if let res {
            if opt.id == res.correctOptionId { state = .correct }
            else if selected { state = .wrong }
            else { state = .dimmed }
        }
        return OptionRow(option: opt, state: state) {
            Task { await runner.choose(it, opt.id) }
        }
    }

    private var examNav: some View {
        HStack(spacing: 12) {
            Button { runner.prevQ() } label: { Image(systemName: "chevron.left") }
                .disabled(runner.current == 0)
            Button {
                runner.toggleFlag(runner.item?.itemId ?? "")
            } label: {
                Image(systemName: runner.flagged.contains(runner.item?.itemId ?? "") ? "flag.fill" : "flag")
                    .foregroundStyle(runner.flagged.contains(runner.item?.itemId ?? "") ? Palette.studyWarning : Palette.mutedForeground)
            }
            Spacer()
            if runner.current == runner.items.count - 1 {
                Button(x.review.submitNow) { showReview = true }
                    .font(.body.weight(.semibold)).foregroundStyle(Palette.primary)
                    .disabled(!runner.canSubmit)
            } else {
                Button { runner.nextQ() } label: { Label(x.runner.next, systemImage: "chevron.right") }
                    .font(.body.weight(.semibold))
            }
        }
        .padding(Metric.pad)
        .background(.ultraThinMaterial)
    }

    // MARK: answer sheet
    private var answerSheet: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 5), spacing: 10) {
                    ForEach(Array(runner.items.enumerated()), id: \.offset) { idx, it in
                        let answered = (runner.answers[it.itemId] ?? nil) != nil
                        let flag = runner.flagged.contains(it.itemId)
                        Button {
                            runner.go(to: idx); showSheet = false
                        } label: {
                            Text("\(idx + 1)")
                                .font(.subheadline.weight(.semibold)).frame(maxWidth: .infinity, minHeight: 44)
                                .foregroundStyle(answered ? Palette.primaryForeground : Palette.foreground)
                                .background(answered ? Palette.primary : Palette.secondary,
                                            in: RoundedRectangle(cornerRadius: Metric.radiusMd))
                                .overlay(alignment: .topTrailing) {
                                    if flag { Image(systemName: "flag.fill").font(.caption2).foregroundStyle(Palette.studyWarning).padding(3) }
                                }
                        }
                    }
                }
                .padding(Metric.pad)
            }
            .navigationTitle(x.runner.palette)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button(loc.t.common.actions.close) { showSheet = false } } }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: review sheet
    private var reviewSheet: some View {
        NavigationStack {
            VStack(spacing: Metric.pad) {
                Text(x.review.subtitle).font(.subheadline).foregroundStyle(Palette.mutedForeground)
                HStack(spacing: 10) {
                    StatTile(icon: "checkmark", value: "\(runner.answeredCount)", label: x.review.answered, tint: Palette.studySuccess)
                    StatTile(icon: "circle", value: "\(runner.items.count - runner.answeredCount)", label: x.review.blank, tint: Palette.studyWarning)
                    StatTile(icon: "flag.fill", value: "\(runner.flagged.count)", label: x.review.flagged, tint: Palette.chart4)
                }
                Spacer()
                PrimaryButton(title: x.review.submitNow, enabled: runner.canSubmit) {
                    showReview = false
                    Task { await runner.submitExam() }
                }
                SecondaryButton(title: x.review.keepWorking) { showReview = false }
            }
            .padding(Metric.pad)
            .navigationTitle(x.review.title)
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium])
    }

    // MARK: results
    private var results: some View {
        ScrollView {
            if let sum = runner.summary {
                VStack(spacing: Metric.pad) {
                    Text(x.results.title).font(.title2.bold()).foregroundStyle(Palette.foreground).padding(.top)
                    HStack(spacing: 10) {
                        StatTile(icon: "checkmark.circle.fill", value: "\(sum.itemsCorrect)", label: x.results.correct, tint: Palette.studySuccess)
                        StatTile(icon: "xmark.circle.fill", value: "\(sum.itemsWrong)", label: x.results.wrong, tint: Palette.studyDanger)
                        StatTile(icon: "circle", value: "\(sum.itemsSkipped)", label: x.results.skipped, tint: Palette.studyWarning)
                    }
                    AppCard {
                        VStack(spacing: 0) {
                            if let s = sum.scorePercent { resultRow(x.results.score, "\(Int(s))%") }
                            if let n = sum.netScore { Divider().overlay(Palette.border); resultRow(x.results.netScore, String(format: "%.1f", n)) }
                            if let ts = sum.thetaStart, let te = sum.thetaEnd { Divider().overlay(Palette.border); resultRow(x.results.ability, String(format: "%+.2f", te - ts)) }
                            if let secs = sum.timeSpentSeconds { Divider().overlay(Palette.border); resultRow(x.results.timeTaken, fmtTime(secs)) }
                        }
                    }
                    PrimaryButton(title: x.results.newExam) { runner.reset() }
                }
                .padding(Metric.pad)
            }
        }
    }
    private func resultRow(_ l: String, _ v: String) -> some View {
        HStack { Text(l).foregroundStyle(Palette.mutedForeground); Spacer(); Text(v).font(.body.weight(.semibold)).foregroundStyle(Palette.foreground) }
            .padding(.horizontal, Metric.pad).padding(.vertical, 12)
    }

    private func fmtTime(_ total: Int) -> String {
        let h = total / 3600, m = (total % 3600) / 60, s = total % 60
        let mm = String(format: "%02d", m), ss = String(format: "%02d", s)
        return h > 0 ? "\(h):\(mm):\(ss)" : "\(mm):\(ss)"
    }
}

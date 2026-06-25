import SwiftUI

struct SessionSummaryView: View {
    @Environment(LocaleStore.self) private var loc
    let summary: SessionSummaryOut
    var onDone: () -> Void
    var onRestart: (() -> Void)?

    @State private var confetti = false
    @State private var appeared = false

    private var s: PracticeStrings.Summary { loc.t.practice.summary }
    private var accuracy: Double {
        summary.itemsDelivered > 0 ? Double(summary.itemsCorrect) / Double(summary.itemsDelivered) : 0
    }

    var body: some View {
        ZStack {
            Palette.background.ignoresSafeArea()
            ScrollView {
                VStack(spacing: Metric.padLg) {
                    Text(s.title)
                        .font(.vTitle2.bold())
                        .foregroundStyle(Palette.foreground)
                        .padding(.top, Metric.padLg)

                    ProgressRing(progress: appeared ? accuracy : 0, size: 168, lineWidth: 16,
                                 tint: ringColor) {
                        VStack(spacing: 2) {
                            Text("\(Int(accuracy * 100))%")
                                .font(.system(size: 40, weight: .bold, design: .rounded))
                                .foregroundStyle(Palette.foreground)
                                .contentTransition(.numericText())
                            Text(s.accuracy).font(.vCaption).foregroundStyle(Palette.mutedForeground)
                        }
                    }

                    HStack(spacing: 10) {
                        StatTile(icon: "checkmark.circle.fill", value: "\(summary.itemsCorrect)",
                                 label: s.correct, tint: Palette.studySuccess)
                        StatTile(icon: "xmark.circle.fill", value: "\(summary.itemsWrong)",
                                 label: s.wrong, tint: Palette.studyDanger)
                        StatTile(icon: "arrow.uturn.right.circle.fill", value: "\(summary.itemsSkipped)",
                                 label: s.skipped, tint: Palette.studyWarning)
                    }

                    VStack(spacing: 0) {
                        if let score = summary.scorePercent {
                            summaryRow(s.scorePercent, "\(Int(score))%")
                        }
                        if let net = summary.netScore {
                            Divider().overlay(Palette.border)
                            summaryRow(s.netScore, String(format: "%.1f", net))
                        }
                        if let ts = summary.thetaStart, let te = summary.thetaEnd {
                            Divider().overlay(Palette.border)
                            summaryRow(s.abilityChange, String(format: "%+.0f", (te - ts) / 6 * 100))
                        }
                        if let secs = summary.timeSpentSeconds {
                            Divider().overlay(Palette.border)
                            summaryRow(s.time, timeText(secs))
                        }
                    }
                    .background(Palette.card)
                    .clipShape(RoundedRectangle(cornerRadius: Metric.radiusLg, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: Metric.radiusLg).stroke(Palette.border))

                    VStack(spacing: 10) {
                        if let onRestart {
                            PrimaryButton(title: s.restart) { onRestart() }
                        }
                        SecondaryButton(title: s.done) { onDone() }
                    }
                    .padding(.top, 4)
                }
                .padding(Metric.pad)
            }
            ConfettiView(fire: $confetti)
        }
        .navigationBarBackButtonHidden()
        .onAppear {
            withAnimation(.spring(duration: 0.7)) { appeared = true }
            if accuracy >= 0.6 { confetti = true }
        }
    }

    private func summaryRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label).foregroundStyle(Palette.mutedForeground)
            Spacer()
            Text(value).font(.vBody.weight(.semibold)).foregroundStyle(Palette.foreground)
        }
        .padding(.horizontal, Metric.pad)
        .padding(.vertical, 12)
    }

    private var ringColor: Color {
        accuracy >= 0.7 ? Palette.studySuccess : (accuracy >= 0.4 ? Palette.studyWarning : Palette.studyDanger)
    }

    private func timeText(_ secs: Int) -> String {
        let m = secs / 60, s = secs % 60
        return m > 0 ? "\(m)m \(s)s" : "\(s)s"
    }
}

import SwiftUI

struct ProgressScreen: View {
    @Environment(LocaleStore.self) private var loc

    @State private var data: ProgressOut?
    @State private var loading = true

    private var p: ProgressStrings { loc.t.progress }

    var body: some View {
        ScrollView {
            if let d = data, d.totalResponses > 0 {
                VStack(spacing: Metric.section) {
                    snapshot(d)
                    statsRow(d)
                    if !d.topics.isEmpty { topicsCard(d) }
                    if !d.recentSessions.isEmpty { sessionsCard(d) }
                }
                .padding(.horizontal, Metric.screen)
                .padding(.bottom, Metric.padLg)
            } else if loading {
                ProgressSkeleton()
            } else {
                ContentUnavailableView(p.empty, systemImage: "chart.bar.xaxis").padding(.top, 60)
            }
        }
        .navigationTitle(p.pageTitle)
        .navigationBarTitleDisplayMode(.inline)
        .synapseScreen()
        .screenContentTop()
        .refreshable { await load() }
        .task { await load() }
    }

    private func snapshot(_ d: ProgressOut) -> some View {
        AppCard {
            VStack(alignment: .leading, spacing: 8) {
                Text(p.summary.title).font(.headline).foregroundStyle(Palette.foreground)
                Text(insight(d.accuracy ?? 0))
                    .font(.subheadline).foregroundStyle(Palette.mutedForeground)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private func statsRow(_ d: ProgressOut) -> some View {
        HStack(spacing: 10) {
            StatTile(icon: "gauge.medium", value: String(format: "%.1f", d.globalTheta ?? 0), label: p.stats.ability)
            StatTile(icon: "checkmark.circle", value: "\(d.totalResponses)", label: p.stats.answered)
            StatTile(icon: "target", value: d.accuracy != nil ? "\(Int(d.accuracy! * 100))%" : "—",
                     label: p.stats.accuracy, tint: Palette.studySuccess)
        }
    }

    private func topicsCard(_ d: ProgressOut) -> some View {
        AppCard {
            VStack(alignment: .leading, spacing: 12) {
                Text(p.topics.title).font(.headline).foregroundStyle(Palette.foreground)
                ForEach(d.topics) { topic in
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text(topic.topicName).font(.subheadline).foregroundStyle(Palette.foreground).lineLimit(1)
                            Spacer()
                            Pill(text: p.mastery[topic.masteryLevel] ?? topic.masteryLevel, color: masteryColor(topic.masteryLevel))
                        }
                        HStack(spacing: 8) {
                            ProgressView(value: topic.accuracyRate ?? 0).tint(masteryColor(topic.masteryLevel))
                            Text("\(topic.correctResponses)/\(topic.totalResponses)")
                                .font(.caption2.monospacedDigit()).foregroundStyle(Palette.mutedForeground)
                        }
                    }
                }
            }
        }
    }

    private func sessionsCard(_ d: ProgressOut) -> some View {
        AppCard {
            VStack(alignment: .leading, spacing: 10) {
                Text(p.sessions.title).font(.headline).foregroundStyle(Palette.foreground)
                ForEach(d.recentSessions) { sess in
                    HStack {
                        Image(systemName: "clock.arrow.circlepath").foregroundStyle(Palette.mutedForeground)
                        Text(p.sessionType[sess.sessionType] ?? sess.sessionType)
                            .font(.subheadline).foregroundStyle(Palette.foreground)
                        Spacer()
                        if let score = sess.scorePercent {
                            Text("\(Int(score))%").font(.subheadline.weight(.semibold))
                                .foregroundStyle(score >= 60 ? Palette.studySuccess : Palette.studyWarning)
                        }
                    }
                }
            }
        }
    }

    private func masteryColor(_ level: String) -> Color {
        switch level {
        case "mastered": return Palette.masteryMaster
        case "proficient": return Palette.masteryProf
        case "developing": return Palette.masteryDev
        case "needs_review": return Palette.masteryReview
        default: return Palette.masteryNone
        }
    }

    private func insight(_ acc: Double) -> String {
        acc >= 0.75 ? p.insight.high : (acc >= 0.5 ? p.insight.mid : p.insight.low)
    }

    private func load() async {
        loading = true; defer { loading = false }
        data = try? await ProgressAPI.progress()
    }
}

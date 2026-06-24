import SwiftUI

struct StudyView: View {
    @Environment(LocaleStore.self) private var loc

    @State private var categories: [CategoryCardOut] = []
    @State private var loading = true
    @State private var error: String?
    @State private var startingId: String?
    @State private var session: PracticeSessionOut?
    @State private var lastStart: (mode: String, topicId: String)?

    private var s: StudyStrings { loc.t.study }

    var body: some View {
        ScrollView {
            if loading && categories.isEmpty {
                StudySkeleton()
            } else {
                LazyVStack(spacing: Metric.gap) {
                    NavigationLink(value: AppDestination.daily) {
                        DailyReviewCard()
                    }
                    .buttonStyle(.plain)

                    if let error {
                        ErrorBanner(message: error)
                    }

                    ForEach(categories) { cat in
                        CategoryCard(
                            category: cat,
                            starting: startingId == cat.topicId,
                            action: { Task { await start(cat) } }
                        )
                    }

                    if categories.isEmpty {
                        ContentUnavailableView(s.empty, systemImage: "tray")
                            .padding(.top, 40)
                    }
                }
                .padding(.horizontal, Metric.screen)
                .padding(.bottom, Metric.padLg)
            }
        }
        .navigationTitle(s.pageTitle)
        .navigationBarTitleDisplayMode(.inline)
        .ronoScreen()
        .screenContentTop()
        .refreshable { await load() }
        .task { await load() }
        .fullScreenCover(item: $session) { sess in
            SessionView(session: sess, onRestart: { Task { await restart() } })
                .environment(loc)
        }
        .navigationDestination(for: AppDestination.self) { dest in
            DestinationView(destination: dest)
        }
    }

    private func load() async {
        loading = true; defer { loading = false }
        do { categories = try await ProgressAPI.categories().categories }
        catch let e as APIError { self.error = e.detail }
        catch { self.error = s.error }
    }

    private func start(_ cat: CategoryCardOut) async {
        guard startingId == nil else { return }
        startingId = cat.topicId; defer { startingId = nil }
        let mode = cat.recommendedMode ?? "adaptive_practice"
        do {
            let sess = try await PracticeAPI.start(.init(
                sessionType: mode, topicId: cat.topicId, itemsTarget: 10
            ))
            lastStart = (mode, cat.topicId)
            Haptics.tap()
            session = sess
        } catch let e as APIError {
            error = e.detail
            Haptics.error()
        } catch {
            self.error = s.error
            Haptics.error()
        }
    }

    private func restart() async {
        guard let last = lastStart else { return }
        if let sess = try? await PracticeAPI.start(.init(
            sessionType: last.mode, topicId: last.topicId, itemsTarget: 10
        )) {
            session = sess
        }
    }
}

// MARK: - Daily review entry card

struct DailyReviewCard: View {
    @Environment(LocaleStore.self) private var loc
    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: Metric.radiusMd, style: .continuous)
                    .fill(Palette.primary.opacity(0.15))
                    .frame(width: 48, height: 48)
                Image(systemName: "calendar.badge.clock")
                    .font(.title3).foregroundStyle(Palette.primary)
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(loc.t.study.daily.cardTitle)
                    .font(.headline).foregroundStyle(Palette.foreground)
                Text(loc.t.study.daily.cardSubtitle)
                    .font(.caption).foregroundStyle(Palette.mutedForeground)
                    .lineLimit(2)
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right").foregroundStyle(Palette.mutedForeground)
        }
        .padding(Metric.pad)
        .background(
            LinearGradient(colors: [Palette.primary.opacity(0.10), Palette.card],
                           startPoint: .leading, endPoint: .trailing)
        )
        .clipShape(RoundedRectangle(cornerRadius: Metric.radiusLg, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Metric.radiusLg).stroke(Palette.primary.opacity(0.3)))
    }
}

// MARK: - Category card

struct CategoryCard: View {
    @Environment(LocaleStore.self) private var loc
    let category: CategoryCardOut
    let starting: Bool
    let action: () -> Void

    private var s: StudyStrings { loc.t.study }
    private var coverage: Double {
        category.totalQuestions > 0 ? Double(category.answered) / Double(category.totalQuestions) : 0
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(category.topicName)
                    .font(.headline).foregroundStyle(Palette.foreground)
                    .lineLimit(2)
                Spacer()
                masteryPill
            }

            // Stats
            HStack(spacing: 16) {
                stat(s.stats.new, "\(category.newCount)", Palette.primary)
                stat(s.stats.due, "\(category.dueCount)", Palette.studyWarning)
                stat(s.stats.total, "\(category.totalQuestions)", Palette.mutedForeground)
                if let acc = category.accuracyRate {
                    stat(s.stats.accuracy, "\(Int(acc * 100))%", Palette.studySuccess)
                }
            }

            // Coverage bar
            ProgressView(value: coverage).tint(Palette.primary)

            Button(action: { Haptics.tap(); action() }) {
                HStack {
                    if starting { ProgressView().tint(Palette.primaryForeground) }
                    Text(actionTitle).font(.subheadline.weight(.semibold))
                }
                .frame(maxWidth: .infinity).padding(.vertical, 11)
                .foregroundStyle(canStart ? Palette.primaryForeground : Palette.mutedForeground)
                .background(canStart ? Palette.primary : Palette.secondary,
                            in: RoundedRectangle(cornerRadius: Metric.radiusMd, style: .continuous))
            }
            .disabled(!canStart || starting)
        }
        .padding(Metric.pad)
        .background(Palette.card)
        .clipShape(RoundedRectangle(cornerRadius: Metric.radiusLg, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Metric.radiusLg).stroke(Palette.border))
    }

    private var masteryPill: some View {
        let label = s.mastery[category.masteryLevel] ?? category.masteryLevel
        return Pill(text: label, color: masteryColor)
    }

    private var masteryColor: Color {
        switch category.mastery {
        case .mastered: return Palette.masteryMaster
        case .proficient: return Palette.masteryProf
        case .developing: return Palette.masteryDev
        case .needsReview: return Palette.masteryReview
        default: return Palette.masteryNone
        }
    }

    private var canStart: Bool {
        category.newCount > 0 || category.dueCount > 0 || category.answered > 0
    }

    private var actionTitle: String {
        if category.dueCount > 0 { return s.action.review(category.dueCount) }
        switch category.journey {
        case .notStarted: return s.action.start
        case .mastered: return s.action.caughtUp
        default: return s.action.continueLearning
        }
    }

    private func stat(_ label: String, _ value: String, _ color: Color) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.subheadline.bold()).foregroundStyle(color)
            Text(label).font(.caption2).foregroundStyle(Palette.mutedForeground)
        }
    }
}

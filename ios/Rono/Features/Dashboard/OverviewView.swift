import SwiftUI
import Charts

/// Role-based home. Students get their personal dashboard; staff get a content
/// snapshot (expanded in Phase 3 with analytics).
struct OverviewView: View {
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc

    var body: some View {
        if auth.role?.isStaff == true {
            StaffOverviewView()
        } else {
            StudentDashboardView()
        }
    }
}

struct StudentDashboardView: View {
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc
    @Environment(TabRouter.self) private var router

    @State private var data: StudentDashboardOut?
    @State private var loading = true
    @State private var error: String?

    private var h: HomeStrings { loc.t.home }

    var body: some View {
        ScrollView {
            if let d = data {
                VStack(spacing: Metric.gap) {
                    if let error {
                        ErrorBanner(message: error)
                    }
                    abilityCard(d)
                    destinations(d)
                }
                .padding(.horizontal, Metric.screen)
                .padding(.bottom, Metric.padLg)
            } else if loading {
                DashboardSkeleton()
            } else {
                VStack(spacing: Metric.gap) {
                    if let error {
                        ErrorBanner(message: error)
                    }
                    emptyState
                }
                .padding(.horizontal, Metric.screen)
            }
        }
        .ronoScreen()
        .screenContentTop()
        .navigationTitle(navTitle)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if let d = data, d.streakDays > 0 {
                ToolbarItem(placement: .topBarTrailing) { StreakBadge(days: d.streakDays) }
            }
        }
        .navigationDestination(for: AppDestination.self) { DestinationView(destination: $0) }
        .refreshable { await load() }
        .task { await load() }
    }

    private var navTitle: String {
        let name = auth.user?.preferredName
            ?? auth.user?.fullName?.split(separator: " ").first.map(String.init)
            ?? h.greeting.fallbackName
        return "\(greeting), \(name)"
    }

    /// Ability level → ring color, mirroring the web mastery scale
    /// (amber → blue → teal → green) so all clients read one progression.
    private func levelColor(_ level: String) -> Color {
        switch level {
        case "beginner":   return Palette.masteryReview
        case "developing": return Palette.masteryDev
        case "proficient": return Palette.masteryProf
        case "advanced":   return Palette.masteryMaster
        default:           return Palette.primary
        }
    }

    // MARK: ability hero — compact ring + level, then full-width stats row
    private func abilityCard(_ d: StudentDashboardOut) -> some View {
        let levelLabel = h.levels[d.ability.level] ?? d.ability.level
        let norm = ((d.ability.theta ?? 0) + 3) / 6  // map θ∈[-3,3] → 0..1
        let color = levelColor(d.ability.level)
        return AppCard(padding: Metric.pad) {
            VStack(spacing: Metric.pad) {
                HStack(spacing: Metric.pad) {
                    ProgressRing(progress: max(0.06, min(norm, 1)), size: 92, lineWidth: 9, tint: color) {
                        VStack(spacing: 0) {
                            Text("θ").font(.system(size: 10, weight: .semibold))
                                .foregroundStyle(Palette.mutedForeground)
                            Text(String(format: "%.1f", d.ability.theta ?? 0))
                                .font(.system(size: 18, weight: .bold, design: .rounded))
                                .foregroundStyle(Palette.foreground)
                        }
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        Text(h.stats.ability).eyebrowStyle()
                        Text(levelLabel)
                            .font(.system(.title2, design: .default).weight(.bold))
                            .foregroundStyle(Palette.foreground)
                            .lineLimit(1).minimumScaleFactor(0.7)
                    }
                    Spacer(minLength: 0)
                }
                Divider().overlay(Palette.border)
                HStack(spacing: 0) {
                    heroStat(d.accuracy != nil ? "\(Int(d.accuracy! * 100))%" : "—", h.stats.accuracy)
                    heroStat("\(d.answered)", h.stats.answered)
                    heroStat("\(d.streakDays)", h.stats.streak)
                }
            }
        }
    }

    private func heroStat(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(Palette.foreground)
                .lineLimit(1).minimumScaleFactor(0.7)
            Text(label)
                .font(.caption).foregroundStyle(Palette.mutedForeground).lineLimit(1)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: the two clear destinations the user asked for.
    // Tapping switches the bottom tab (not a pushed screen), matching the web.
    private func destinations(_ d: StudentDashboardOut) -> some View {
        VStack(spacing: Metric.gap) {
            DestinationCard(
                icon: "calendar",
                title: h.actions.dailyStudy,
                subtitle: d.dueNow > 0 ? "\(d.dueNow) \(h.due.dueNow)" : h.due.caughtUp,
                badge: d.dueNow > 0 ? d.dueNow : nil,
                primary: true
            ) { Haptics.tap(); router.select(.daily) }
            DestinationCard(
                icon: "chart.line.uptrend.xyaxis",
                title: h.actions.progressTitle,
                subtitle: h.actions.progressSub,
                badge: nil,
                primary: false
            ) { Haptics.tap(); router.select(.progress) }
        }
    }

    private var emptyState: some View {
        VStack(spacing: Metric.gap) {
            Image(systemName: "sparkles").font(.largeTitle).foregroundStyle(Palette.primary)
            Text(h.empty.title).font(.title3.bold()).foregroundStyle(Palette.foreground)
            Text(h.empty.body).font(.subheadline).foregroundStyle(Palette.mutedForeground)
                .multilineTextAlignment(.center)
        }
        .padding(40)
    }

    private var greeting: String {
        let hr = Calendar.current.component(.hour, from: Date())
        if hr < 12 { return h.greeting.morning }
        if hr < 18 { return h.greeting.afternoon }
        return h.greeting.evening
    }

    private func load() async {
        loading = true; defer { loading = false }
        do {
            data = try await ProgressAPI.dashboard()
            error = nil
        }
        catch let e as APIError { self.error = e.detail }
        catch { self.error = h.loading }
    }
}

/// A big, unmistakable home destination button. `primary` paints the brand
/// surface (Daily Study — the everyday action); the other stays a calm card
/// (Progress). Mirrors the web `DestinationCard`.
private struct DestinationCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let badge: Int?
    let primary: Bool
    let action: () -> Void
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        Button(action: action) {
            HStack(spacing: Metric.gap) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(primary ? Color.white.opacity(0.16) : Palette.primary.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(primary ? Palette.primaryForeground : Palette.primary)
                }
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(title).font(.headline)
                            .foregroundStyle(primary ? Palette.primaryForeground : Palette.foreground)
                        if let badge {
                            Text("\(badge)")
                                .font(.caption.bold())
                                .foregroundStyle(primary ? Palette.primaryForeground : Palette.primary)
                                .padding(.horizontal, 7).padding(.vertical, 2)
                                .background(primary ? Color.white.opacity(0.22)
                                                    : Palette.primary.opacity(0.14), in: Capsule())
                        }
                    }
                    Text(subtitle).font(.subheadline)
                        .foregroundStyle(primary ? Palette.primaryForeground.opacity(0.85)
                                                 : Palette.mutedForeground)
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(primary ? Palette.primaryForeground.opacity(0.8)
                                             : Palette.mutedForeground)
            }
            .padding(Metric.pad)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: Metric.card, style: .continuous)
                    .fill(primary ? Palette.primary : Palette.card)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Metric.card, style: .continuous)
                    .strokeBorder(primary ? Color.clear : Palette.border.opacity(0.6), lineWidth: 0.75)
            )
            .shadow(color: primary ? Palette.primary.opacity(0.28)
                                   : .black.opacity(scheme == .dark ? 0.28 : 0.06),
                    radius: primary ? 12 : 14, x: 0, y: 6)
        }
        .buttonStyle(PressableStyle())
    }
}

/// Lightweight staff home until Phase 3 wires full analytics.
struct StaffOverviewView: View {
    @Environment(LocaleStore.self) private var loc
    @State private var overview: AnalyticsOverview?

    var body: some View {
        ScrollView {
            if let o = overview {
                VStack(spacing: Metric.pad) {
                    HStack(spacing: 10) {
                        StatTile(icon: "book.fill", value: "\(o.totalItems)", label: loc.t.nav.items.questions)
                        StatTile(icon: "checkmark.seal", value: "\(o.activeItems)", label: "Active", tint: Palette.studySuccess)
                    }
                    HStack(spacing: 10) {
                        StatTile(icon: "person.2.fill", value: "\(o.totalUsers)", label: loc.t.nav.items.users)
                        StatTile(icon: "tray.full", value: "\(o.totalResponses)", label: "Responses", tint: Palette.chart3)
                    }
                }
                .padding(.horizontal, Metric.screen)
                .padding(.bottom, Metric.padLg)
            } else {
                StaffOverviewSkeleton()
            }
        }
        .ronoScreen()
        .screenContentTop()
        .navigationTitle(loc.t.nav.items.overview)
        .navigationBarTitleDisplayMode(.inline)
        .task { overview = try? await AnalyticsAPI.overview() }
    }
}

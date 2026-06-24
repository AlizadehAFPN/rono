import SwiftUI

/// Authenticated root: role-based bottom tab bar + a "More" tab for overflow
/// surfaces. Mirrors the web's mobile bottom nav + hamburger sheet.
struct AppShell: View {
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc

    @State private var router = TabRouter()

    private var tabs: [AppDestination] { Nav.tabs(for: auth.role) }

    var body: some View {
        @Bindable var router = router
        TabView(selection: $router.selection) {
            ForEach(tabs) { dest in
                NavigationStack {
                    DestinationView(destination: dest)
                }
                .tabItem { Label(dest.title(loc.t), systemImage: dest.systemImage) }
                .tag(dest.rawValue)
            }

            NavigationStack {
                MoreView()
            }
            .tabItem { Label(loc.t.nav.more, systemImage: "ellipsis.circle") }
            .tag("more")
        }
        .environment(router)
    }
}

/// Resolves a destination to its screen. Real screens land per phase; the rest
/// render an intentional placeholder so the whole nav is walkable today.
struct DestinationView: View {
    let destination: AppDestination

    var body: some View {
        switch destination {
        case .overview:    OverviewView()
        case .study:       StudyView()
        case .daily:       DailyReviewView()
        case .practice:    ExamView()
        case .progress:    ProgressScreen()
        case .profile:     ProfileView()
        case .settings:    SettingsView()
        default:           FeaturePlaceholder(destination: destination)
        }
    }
}

/// Placeholder for surfaces not yet implemented in the current phase.
struct FeaturePlaceholder: View {
    @Environment(LocaleStore.self) private var loc
    let destination: AppDestination

    var body: some View {
        VStack(spacing: Metric.gap) {
            Image(systemName: destination.systemImage)
                .font(.system(size: 44))
                .foregroundStyle(Palette.primary)
            Text(destination.title(loc.t))
                .font(.title3.bold())
                .foregroundStyle(Palette.foreground)
            Text(loc.locale == .tr ? "Yakında" : "Coming soon")
                .font(.subheadline)
                .foregroundStyle(Palette.mutedForeground)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .ronoScreen()
        .navigationTitle(destination.title(loc.t))
        .navigationBarTitleDisplayMode(.inline)
    }
}

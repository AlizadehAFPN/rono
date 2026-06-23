import SwiftUI
import Kingfisher

struct MoreView: View {
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc
    @State private var env = AppConfig.environment

    private var more: [AppDestination] { Nav.more(for: auth.role) }
    private func group(_ items: [AppDestination]) -> [AppDestination] {
        more.filter { items.contains($0) }
    }

    var body: some View {
        List {
            Section { UserHeaderRow() }

            sectionIfNeeded(loc.t.nav.learning, group([.study, .daily, .practice, .progress]))
            sectionIfNeeded(loc.t.nav.administration, group([.users, .institution]))
            sectionIfNeeded(loc.t.nav.account, group([.profile, .settings]))

            #if DEBUG
                // Developer: backend environment switch
                Section(loc.t.nav.developer) {
                    Picker(loc.t.nav.backend, selection: $env) {
                        ForEach(APIEnvironment.allCases, id: \.self) { e in
                            Text(e.label).tag(e)
                        }
                    }
                    .onChange(of: env) { _, newValue in
                        AppConfig.environment = newValue
                    }
                }
            #endif

            Section {
                Button(role: .destructive) {
                    Task { await auth.logout() }
                } label: {
                    Label(loc.t.nav.signOut, systemImage: "rectangle.portrait.and.arrow.right")
                }
            }
        }
        .navigationTitle(loc.t.nav.more)
        .navigationBarTitleDisplayMode(.inline)
        .listRowBackground(Palette.card)
        .synapseScreen()
        .screenContentTop()
        .navigationDestination(for: AppDestination.self) { dest in
            DestinationView(destination: dest)
        }
    }

    @ViewBuilder
    private func sectionIfNeeded(_ title: String, _ items: [AppDestination]) -> some View {
        if !items.isEmpty {
            Section(title) {
                ForEach(items) { dest in
                    NavigationLink(value: dest) {
                        Label(dest.title(loc.t), systemImage: dest.systemImage)
                    }
                }
            }
        }
    }
}

/// Avatar + name + role row, links to Profile.
struct UserHeaderRow: View {
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc

    var body: some View {
        NavigationLink(value: AppDestination.profile) {
            HStack(spacing: 12) {
                AvatarView(url: auth.user?.avatarUrl, initials: auth.user?.initials ?? "?", size: 48)
                VStack(alignment: .leading, spacing: 3) {
                    Text(auth.user?.displayName ?? "")
                        .font(.headline)
                        .foregroundStyle(Palette.foreground)
                    if let role = auth.role {
                        Text(loc.t.roleLabel(role.rawValue))
                            .font(.caption)
                            .foregroundStyle(Palette.mutedForeground)
                    }
                }
            }
            .padding(.vertical, 4)
        }
    }
}

/// Avatar that loads a remote photo (Kingfisher) or falls back to initials.
struct AvatarView: View {
    let url: String?
    let initials: String
    var size: CGFloat = 40

    var body: some View {
        Group {
            if let url, let u = URL(string: url) {
                KFImage(u)
                    .resizable()
                    .placeholder { fallback }
                    .scaledToFill()
            } else {
                fallback
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }

    private var fallback: some View {
        ZStack {
            Circle().fill(Palette.secondary)
            Text(initials)
                .font(.system(size: size * 0.38, weight: .semibold))
                .foregroundStyle(Palette.foreground)
        }
    }
}

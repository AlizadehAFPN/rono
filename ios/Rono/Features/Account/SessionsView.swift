import SwiftUI

struct SessionsView: View {
    @Environment(LocaleStore.self) private var loc

    @State private var sessions: [DeviceSession] = []
    @State private var loading = true
    @State private var error: String?

    private var s: SettingsStrings.Sessions { loc.t.settings.sessions }

    var body: some View {
        List {
            if let error {
                Section { Text(error).foregroundStyle(Palette.destructive) }
            }
            Section {
                ForEach(sessions) { session in
                    row(session)
                        .swipeActions(edge: .trailing) {
                            if !session.isCurrent {
                                Button(role: .destructive) {
                                    Task { await revoke(session.id) }
                                } label: { Label(s.revoke, systemImage: "xmark") }
                            }
                        }
                }
            } footer: {
                Text(s.description)
            }

            if sessions.contains(where: { !$0.isCurrent }) {
                Section {
                    Button(role: .destructive) {
                        Task { await revokeOthers() }
                    } label: {
                        Label(s.revokeOthers, systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
        }
        .navigationTitle(s.title)
        .navigationBarTitleDisplayMode(.inline)
        .listRowBackground(Palette.card)
        .ronoScreen()
        .overlay {
            if loading { ProgressView(s.loading) }
            else if sessions.isEmpty && error == nil {
                ContentUnavailableView(s.empty, systemImage: "laptopcomputer")
            }
        }
        .task { await load() }
    }

    private func row(_ session: DeviceSession) -> some View {
        HStack(spacing: 12) {
            Image(systemName: deviceIcon(session.userAgent))
                .font(.title3)
                .foregroundStyle(session.isCurrent ? Palette.primary : Palette.mutedForeground)
                .frame(width: 28)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(deviceName(session.userAgent))
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Palette.foreground)
                    if session.isCurrent {
                        Text(s.current)
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(Palette.primary)
                            .padding(.horizontal, 6).padding(.vertical, 2)
                            .background(Palette.primary.opacity(0.15), in: Capsule())
                    }
                }
                Text("\(s.signedIn): \(session.createdAt.formatted(.relative(presentation: .named)))")
                    .font(.caption)
                    .foregroundStyle(Palette.mutedForeground)
                if let ip = session.ipAddress {
                    Text(ip).font(.caption2).foregroundStyle(Palette.mutedForeground)
                }
            }
            Spacer()
        }
        .padding(.vertical, 2)
    }

    private func deviceName(_ ua: String?) -> String {
        guard let ua else { return s.unknownDevice }
        if ua.contains("iPhone") { return "iPhone" }
        if ua.contains("iPad") { return "iPad" }
        if ua.contains("Macintosh") || ua.contains("Mac OS") { return "Mac" }
        if ua.contains("Android") { return "Android" }
        if ua.contains("Windows") { return "Windows" }
        return s.unknownDevice
    }

    private func deviceIcon(_ ua: String?) -> String {
        let name = deviceName(ua)
        switch name {
        case "iPhone", "Android": return "iphone"
        case "iPad": return "ipad"
        case "Mac", "Windows": return "laptopcomputer"
        default: return "globe"
        }
    }

    private func load() async {
        loading = true; defer { loading = false }
        do { sessions = try await AuthAPI.sessions() }
        catch { self.error = s.failed }
    }

    private func revoke(_ id: String) async {
        do {
            try await AuthAPI.revokeSession(id)
            Haptics.success()
            sessions.removeAll { $0.id == id }
        } catch { self.error = s.failed; Haptics.error() }
    }

    private func revokeOthers() async {
        do {
            try await AuthAPI.revokeOtherSessions()
            Haptics.success()
            sessions.removeAll { !$0.isCurrent }
        } catch { self.error = s.failed; Haptics.error() }
    }
}

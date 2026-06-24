import SwiftUI
import Observation

/// Owns authentication state and drives top-level routing
/// (loading → onboarding → unauthenticated → authenticated).
@Observable
@MainActor
final class AuthStore {
    enum Phase: Equatable {
        case loading
        case onboarding
        case unauthenticated
        case authenticated
    }

    private static let onboardedKey = "rono.onboarded"

    private(set) var phase: Phase = .loading
    private(set) var user: UserOut?
    private(set) var memberships: [MembershipOut] = []
    private(set) var role: Role?

    var hasOnboarded: Bool { UserDefaults.standard.bool(forKey: Self.onboardedKey) }

    /// Restore any persisted session and resolve the initial phase.
    func bootstrap() async {
        CookieJar.restore()
        await APIClient.shared.setExpireHandler { [weak self] in
            await self?.handleExpired()
        }

        if CookieJar.hasSession() {
            do {
                let me = try await AuthAPI.me()
                enterAuthenticated(me)
                return
            } catch {
                // Session couldn't be revived — fall through to login/onboarding.
                CookieJar.clear()
            }
        }
        phase = hasOnboarded ? .unauthenticated : .onboarding
    }

    func completeOnboarding() {
        UserDefaults.standard.set(true, forKey: Self.onboardedKey)
        if phase == .onboarding { phase = .unauthenticated }
    }

    // MARK: - Auth actions

    func login(email: String, password: String) async throws {
        let me = try await AuthAPI.login(.init(email: email, password: password))
        enterAuthenticated(me)
    }

    func signup(email: String, password: String, fullName: String) async throws {
        let me = try await AuthAPI.signup(.init(email: email, password: password, fullName: fullName))
        enterAuthenticated(me)
    }

    func register(_ body: RegisterRequest) async throws {
        let me = try await AuthAPI.register(body)
        enterAuthenticated(me)
    }

    func logout() async {
        try? await AuthAPI.logout()
        clearSession()
    }

    /// Refresh the cached profile (after profile edits / avatar changes).
    func refreshMe() async {
        if let me = try? await AuthAPI.me() { apply(me) }
    }

    /// Adopt an updated profile returned by an endpoint (e.g. PATCH /auth/me).
    func adopt(_ me: MeResponse) { apply(me) }

    // MARK: - Internal

    private func enterAuthenticated(_ me: MeResponse) {
        apply(me)
        CookieJar.persist()
        phase = .authenticated
        // Keep the server's notion of "today" aligned with this device's local
        // day, so Daily Review boundaries (new-card cap, streak) are correct.
        Task { await syncDeviceTimezone() }
    }

    /// Best-effort: report the device timezone if it differs from the stored one.
    private func syncDeviceTimezone() async {
        let device = TimeZone.current.identifier
        guard let user, user.timezone != device else { return }
        if let me = try? await AuthAPI.updateProfile(.init(timezone: device)) {
            apply(me)
        }
    }

    private func apply(_ me: MeResponse) {
        user = me.user
        memberships = me.memberships
        role = me.primaryRole
    }

    private func handleExpired() {
        clearSession()
    }

    private func clearSession() {
        CookieJar.clear()
        user = nil
        memberships = []
        role = nil
        phase = .unauthenticated
    }
}

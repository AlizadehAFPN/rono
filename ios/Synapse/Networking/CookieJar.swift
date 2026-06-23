import Foundation

/// Persists the API auth cookies (httpOnly `access_token` / `refresh_token`) to
/// the Keychain so a logged-in session survives app relaunches — the native
/// equivalent of the browser keeping httpOnly cookies. `URLSession` stores and
/// resends them automatically during a run (httpOnly/SameSite are browser-only
/// concepts and don't constrain native requests); we only need to bridge them
/// across cold starts.
enum CookieJar {
    private static let key = "synapse.cookies.v1"

    /// A persistable snapshot of the fields needed to faithfully reconstruct an
    /// auth cookie across launches. Codable + `JSONEncoder` replaces the legacy
    /// `NSKeyedArchiver` blob (which required `requiringSecureCoding: false`).
    private struct StoredCookie: Codable {
        let name: String
        let value: String
        let domain: String
        let path: String
        let expiresDate: Date?
        let isSecure: Bool
        let version: Int

        init(_ c: HTTPCookie) {
            name = c.name; value = c.value; domain = c.domain; path = c.path
            expiresDate = c.expiresDate; isSecure = c.isSecure; version = c.version
        }

        var httpCookie: HTTPCookie? {
            var props: [HTTPCookiePropertyKey: Any] = [
                .name: name, .value: value, .domain: domain, .path: path,
                .version: String(version),
            ]
            if let expiresDate { props[.expires] = expiresDate }
            if isSecure { props[.secure] = "TRUE" }
            return HTTPCookie(properties: props)
        }
    }

    /// Cookies belonging to our API host (covers both prod and dev).
    private static func apiCookies() -> [HTTPCookie] {
        let host = AppConfig.environment.baseURL.host
        let all = HTTPCookieStorage.shared.cookies ?? []
        guard let host else { return all }
        return all.filter { host.hasSuffix($0.domain) || $0.domain.hasSuffix(host) || $0.domain == host }
    }

    /// Snapshot current API cookies into the Keychain.
    static func persist() {
        let stored = apiCookies().map(StoredCookie.init)
        guard let data = try? JSONEncoder().encode(stored) else { return }
        Keychain.set(data, for: key)
    }

    /// Restore previously-persisted cookies into the shared storage on launch.
    static func restore() {
        guard let data = Keychain.get(key),
              let stored = try? JSONDecoder().decode([StoredCookie].self, from: data)
        else { return }

        for entry in stored {
            if let cookie = entry.httpCookie {
                HTTPCookieStorage.shared.setCookie(cookie)
            }
        }
    }

    /// Whether we currently hold an auth cookie (used to decide initial routing).
    static func hasSession() -> Bool {
        apiCookies().contains { $0.name == "access_token" || $0.name == "refresh_token" }
    }

    /// Drop all API cookies (logout) from both the live store and the Keychain.
    static func clear() {
        for cookie in apiCookies() {
            HTTPCookieStorage.shared.deleteCookie(cookie)
        }
        Keychain.delete(key)
    }
}

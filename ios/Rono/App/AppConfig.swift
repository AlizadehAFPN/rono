import Foundation

/// Backend environment. Default is production; a developer toggle in
/// Settings/More can switch to a local backend for development.
enum APIEnvironment: String, CaseIterable, Codable, Sendable {
    case production
    case development

    var baseURL: URL {
        switch self {
        case .production:
            // The API is served from the web origin (Next.js proxies /api/* to the
            // backend); the api.* subdomain is not publicly resolvable.
            return URL(string: "https://rono.getjanus.dev")!
        case .development:
            // Simulator reaches the host machine via localhost. On a physical
            // device, override this with the Mac's LAN IP.
            return URL(string: "http://localhost:8000")!
        }
    }

    var label: String {
        switch self {
        case .production:  return "Production"
        case .development: return "Development"
        }
    }
}

/// Global, persisted app configuration.
enum AppConfig {
    static let apiPrefix = "/api/v1"

    private static let envKey = "rono.api.environment"

    /// Currently selected backend environment (persisted).
    static var environment: APIEnvironment {
        get {
            if let raw = UserDefaults.standard.string(forKey: envKey),
               let env = APIEnvironment(rawValue: raw) {
                return env
            }
            return .production
        }
        set {
            UserDefaults.standard.set(newValue.rawValue, forKey: envKey)
        }
    }

    /// Fully-qualified API base, e.g. https://api.rono.getjanus.dev/api/v1
    static var apiBaseURL: URL {
        environment.baseURL.appendingPathComponent(apiPrefix)
    }
}

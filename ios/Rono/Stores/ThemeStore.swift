import SwiftUI
import Observation

/// App theme preference, mirroring `frontend/lib/stores/theme.ts`
/// (light / dark / system, default **dark**, persisted).
enum AppTheme: String, CaseIterable, Codable, Sendable {
    case light
    case dark
    case system

    /// SwiftUI color scheme to force, or nil to follow the system.
    var colorScheme: ColorScheme? {
        switch self {
        case .light:  return .light
        case .dark:   return .dark
        case .system: return nil
        }
    }
}

@Observable
@MainActor
final class ThemeStore {
    private static let key = "rono-theme"

    var theme: AppTheme {
        didSet { UserDefaults.standard.set(theme.rawValue, forKey: Self.key) }
    }

    init() {
        if let raw = UserDefaults.standard.string(forKey: Self.key),
           let t = AppTheme(rawValue: raw) {
            theme = t
        } else {
            theme = .dark // default, matching the web app
        }
    }
}

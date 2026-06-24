import SwiftUI
import Observation

/// Supported UI languages (mirrors `frontend/lib/i18n/config.ts`): Turkish
/// (default) + English.
enum AppLocale: String, CaseIterable, Codable, Sendable {
    case tr
    case en

    var native: String { self == .tr ? "Türkçe" : "English" }
    var short: String { self == .tr ? "TR" : "EN" }
}

/// Current language, persisted under the same key the web uses (`rono-lang`).
@Observable
@MainActor
final class LocaleStore {
    private static let key = "rono-lang"

    var locale: AppLocale {
        didSet { UserDefaults.standard.set(locale.rawValue, forKey: Self.key) }
    }

    /// The active string table.
    var t: Strings { locale == .tr ? .tr : .en }

    init() {
        if let raw = UserDefaults.standard.string(forKey: Self.key),
           let l = AppLocale(rawValue: raw) {
            locale = l
        } else {
            locale = .tr // default, matching the web app
        }
    }
}

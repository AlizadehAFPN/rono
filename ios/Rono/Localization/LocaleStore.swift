import SwiftUI
import Observation

/// Supported UI languages (mirrors `frontend/lib/i18n/config.ts`): Persian
/// (default, RTL) + English.
enum AppLocale: String, CaseIterable, Codable, Sendable {
    case fa
    case en

    var native: String { self == .fa ? "فارسی" : "English" }
    var short: String { self == .fa ? "FA" : "EN" }

    /// Persian is right-to-left; English is left-to-right.
    var layoutDirection: LayoutDirection { self == .fa ? .rightToLeft : .leftToRight }
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
    var t: Strings { locale == .fa ? .fa : .en }

    init() {
        if let raw = UserDefaults.standard.string(forKey: Self.key),
           let l = AppLocale(rawValue: raw) {
            locale = l
        } else {
            locale = .fa // default, matching the web app (Persian, RTL)
        }
    }
}

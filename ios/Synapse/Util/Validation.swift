import Foundation

/// Client-side validation mirroring the web's zod schemas
/// (`frontend/app/(auth)/*`). Server remains the source of truth.
enum Validation {
    static func isValidEmail(_ s: String) -> Bool {
        let pattern = #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#
        return s.range(of: pattern, options: .regularExpression) != nil
    }

    static func hasUpper(_ s: String) -> Bool { s.range(of: "[A-Z]", options: .regularExpression) != nil }
    static func hasLower(_ s: String) -> Bool { s.range(of: "[a-z]", options: .regularExpression) != nil }
    static func hasDigit(_ s: String) -> Bool { s.range(of: "[0-9]", options: .regularExpression) != nil }

    static func isValidSlug(_ s: String) -> Bool {
        s.range(of: #"^[a-z0-9-]+$"#, options: .regularExpression) != nil
    }

    /// Derive a URL slug from an institution name (lowercase, hyphenated).
    static func slugify(_ s: String) -> String {
        let lowered = s.lowercased()
        let mapped = lowered.map { ch -> Character in
            (ch.isLetter || ch.isNumber) ? ch : "-"
        }
        var out = String(mapped)
        while out.contains("--") { out = out.replacingOccurrences(of: "--", with: "-") }
        return out.trimmingCharacters(in: CharacterSet(charactersIn: "-"))
    }
}

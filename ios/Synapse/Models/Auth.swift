import Foundation

// MARK: - Roles (mirrors frontend/lib/types/auth.ts)

enum Role: String, Codable, CaseIterable, Sendable {
    case student
    case contentAuthor = "content_author"
    case instructor
    case coordinator
    case institutionAdmin = "institution_admin"
    case systemAdmin = "system_admin"

    /// Privilege order, low → high.
    private static let order: [Role] = [
        .student, .contentAuthor, .instructor, .coordinator, .institutionAdmin, .systemAdmin,
    ]

    /// True when `self` is at least as privileged as `minimum` (mirrors `roleGte`).
    func gte(_ minimum: Role) -> Bool {
        guard let a = Role.order.firstIndex(of: self),
              let b = Role.order.firstIndex(of: minimum) else { return false }
        return a >= b
    }

    var isStaff: Bool { gte(.instructor) }
    var isAdmin: Bool { gte(.institutionAdmin) }
}

// MARK: - Profile

struct UserOut: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let email: String
    let fullName: String?
    let preferredName: String?
    let avatarUrl: String?
    let locale: String
    let timezone: String
    let isActive: Bool
    let emailVerifiedAt: Date?
    let mfaEnabled: Bool
    let lastLoginAt: Date?
    let createdAt: Date

    /// Best display name, mirroring the web sidebar fallback chain.
    var displayName: String { preferredName ?? fullName ?? email }
    var initials: String {
        let base = fullName ?? email
        let parts = base.split(separator: " ").prefix(2).compactMap { $0.first }
        return parts.isEmpty ? "?" : String(parts).uppercased()
    }
}

struct MembershipOut: Codable, Sendable, Hashable {
    let institutionId: String
    let role: String
    let status: String

    var roleValue: Role? { Role(rawValue: role) }
}

struct MeResponse: Codable, Sendable {
    let user: UserOut
    let memberships: [MembershipOut]

    /// The primary (first active) membership's role, if any.
    var primaryRole: Role? {
        memberships.first(where: { $0.status == "active" })?.roleValue
            ?? memberships.first?.roleValue
    }
}

/// Active login session (device) — auth.py `SessionOut`.
struct DeviceSession: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let ipAddress: String?
    let userAgent: String?
    let createdAt: Date
    let expiresAt: Date
    let isCurrent: Bool
}

// MARK: - Requests

struct LoginRequest: Encodable, Sendable {
    let email: String
    let password: String
}

struct SignupRequest: Encodable, Sendable {
    let email: String
    let password: String
    let fullName: String
}

struct RegisterRequest: Encodable, Sendable {
    let email: String
    let password: String
    let fullName: String
    let institutionName: String
    let institutionSlug: String
}

struct ProfileUpdateRequest: Encodable, Sendable {
    var fullName: String?
    var preferredName: String?
    var avatarUrl: String?
    var locale: String?
    var timezone: String?
}

struct ChangePasswordRequest: Encodable, Sendable {
    let currentPassword: String
    let newPassword: String
}

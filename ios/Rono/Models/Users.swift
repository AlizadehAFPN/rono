import Foundation

struct UserListItem: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let email: String
    let fullName: String?
    let role: String
    let status: String
    let isActive: Bool
    let lastLoginAt: Date?
    let createdAt: Date

    var roleValue: Role? { Role(rawValue: role) }
}

struct PaginatedUsers: Codable, Sendable, Hashable {
    let users: [UserListItem]
    let total: Int
    let limit: Int
    let offset: Int
}

struct UserCreate: Encodable, Sendable {
    var email: String
    var fullName: String?
    var password: String
    var role: String
}

struct UserUpdate: Encodable, Sendable {
    var role: String?
    var status: String?
    var isActive: Bool?
}

/// Roles an admin can assign (mirror MANAGEABLE_ROLES).
enum UserManagement {
    static let manageableRoles = [
        "student", "content_author", "instructor", "coordinator", "institution_admin",
    ]
    static let statuses = ["active", "invited", "suspended"]
}

// MARK: - Institution

struct Institution: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let name: String
    let slug: String
    let domain: String?
    let subscriptionTier: String
    let isActive: Bool
}

struct InstitutionUpdate: Encodable, Sendable {
    var name: String?
    var domain: String?
}

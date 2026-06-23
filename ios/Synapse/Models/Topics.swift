import Foundation

struct TopicOut: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let institutionId: String?
    let parentId: String?
    let name: String
    let slug: String
    let path: String
    let level: Int
    let description: String?
    let isActive: Bool
    let displayOrder: Int
    let createdById: String?
    let createdAt: Date
    let updatedAt: Date
}

/// Recursive tree node (`GET /topics/tree`).
struct TopicTree: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let institutionId: String?
    let parentId: String?
    let name: String
    let slug: String
    let path: String
    let level: Int
    let description: String?
    let isActive: Bool
    let displayOrder: Int
    let createdById: String?
    let createdAt: Date
    let updatedAt: Date
    let children: [TopicTree]
}

struct TopicCreate: Encodable, Sendable {
    var name: String
    var slug: String
    var parentId: String?
    var description: String?
    var displayOrder: Int?
}

struct TopicUpdate: Encodable, Sendable {
    var name: String?
    var slug: String?
    var description: String?
    var displayOrder: Int?
    var isActive: Bool?
}

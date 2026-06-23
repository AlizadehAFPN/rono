import Foundation

struct OptionOut: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let key: String
    let content: String
    let isCorrect: Bool
    let explanation: String?
    let displayOrder: Int
}

struct ItemVersionOut: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let itemId: String
    let versionNumber: Int
    let content: String
    let explanation: String?
    let options: [OptionOut]
    let isPublished: Bool
    let changeSummary: String?
    let authoredById: String?
    let publishedAt: Date?
    let createdAt: Date
}

struct ItemOut: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let institutionId: String
    let itemType: String
    let examType: String?
    let examPart: String?
    let language: String
    let source: String?
    let sourceReference: String?
    let examYear: Int?
    let examSession: String?
    let status: String
    let calibrationStatus: String
    let irtA: Double?
    let irtB: Double?
    let irtASe: Double?
    let irtBSe: Double?
    let irtResponsesUsed: Int
    let currentVersion: ItemVersionOut?
    let createdById: String?
    let createdAt: Date
    let updatedAt: Date
}

struct ItemWithTopics: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let institutionId: String
    let itemType: String
    let examType: String?
    let examPart: String?
    let language: String
    let source: String?
    let sourceReference: String?
    let examYear: Int?
    let examSession: String?
    let status: String
    let calibrationStatus: String
    let irtA: Double?
    let irtB: Double?
    let irtASe: Double?
    let irtBSe: Double?
    let irtResponsesUsed: Int
    let currentVersion: ItemVersionOut?
    let createdById: String?
    let createdAt: Date
    let updatedAt: Date
    let topicIds: [String]
    let primaryTopicId: String?
}

struct PaginatedItems: Codable, Sendable, Hashable {
    let items: [ItemOut]
    let total: Int
    let limit: Int
    let offset: Int
}

// MARK: - Authoring requests

struct OptionCreate: Encodable, Sendable {
    var key: String
    var content: String
    var isCorrect: Bool
    var explanation: String?
    var displayOrder: Int?
}

struct ItemVersionCreate: Encodable, Sendable {
    var content: String
    var explanation: String?
    var options: [OptionCreate]
    var changeSummary: String?
}

struct ItemCreate: Encodable, Sendable {
    var itemType: String? = "single_best_answer"
    var examType: String?
    var examPart: String?
    var language: String? = "tr"
    var source: String?
    var sourceReference: String?
    var examYear: Int?
    var examSession: String?
    var topicIds: [String]?
    var primaryTopicId: String?
    var difficultyPreset: Int?
    var version: ItemVersionCreate
}

struct ItemUpdate: Encodable, Sendable {
    var status: String?
    var examType: String?
    var examPart: String?
    var language: String?
    var source: String?
    var sourceReference: String?
    var examYear: Int?
    var examSession: String?
    var topicIds: [String]?
    var primaryTopicId: String?
    var difficultyPreset: Int?
}

// MARK: - Label maps (mirror frontend/lib/types/items.ts)

enum ItemLabels {
    static let examType: [String: String] = [
        "usmle_step1": "USMLE Step 1",
        "usmle_step2": "USMLE Step 2",
        "usmle_step3": "USMLE Step 3",
        "tus": "TUS",
    ]
    static let examTypes = ["usmle_step1", "usmle_step2", "usmle_step3", "tus"]

    static let examPart: [String: String] = [
        "basic_sciences": "Basic Sciences",
        "clinical_sciences": "Clinical Sciences",
    ]
    static let examParts = ["basic_sciences", "clinical_sciences"]
    static let examSessions = ["spring", "fall"]

    static let status: [String: String] = [
        "draft": "Draft",
        "active": "Active",
        "retired": "Retired",
    ]
}

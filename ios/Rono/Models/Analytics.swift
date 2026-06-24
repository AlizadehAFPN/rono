import Foundation

struct AnalyticsOverview: Codable, Sendable, Hashable {
    let totalItems: Int
    let activeItems: Int
    let totalResponses: Int
    let overallAccuracy: Double?
    let totalUsers: Int
    let completedSessions: Int
}

struct ItemStat: Codable, Identifiable, Sendable, Hashable {
    let itemId: String
    let preview: String
    let examType: String?
    let examPart: String?
    let irtB: Double?
    let calibrationStatus: String
    let responseCount: Int
    let accuracy: Double?

    var id: String { itemId }
}

struct ItemStatsResponse: Codable, Sendable, Hashable {
    let items: [ItemStat]
}

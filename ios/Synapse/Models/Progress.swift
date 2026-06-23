import Foundation

struct TopicMastery: Codable, Identifiable, Sendable, Hashable {
    let topicId: String
    let topicName: String
    let masteryLevel: String
    let theta: Double?
    let totalResponses: Int
    let correctResponses: Int
    let accuracyRate: Double?

    var id: String { topicId }
}

struct SessionBrief: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let sessionType: String
    let status: String
    let itemsDelivered: Int
    let itemsCorrect: Int
    let scorePercent: Double?
    let netScore: Double?
    let startedAt: Date
    let completedAt: Date?
}

struct ProgressOut: Codable, Sendable, Hashable {
    let globalTheta: Double?
    let globalThetaSe: Double?
    let totalResponses: Int
    let totalCorrect: Int
    let accuracy: Double?
    let topics: [TopicMastery]
    let recentSessions: [SessionBrief]
}

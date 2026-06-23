import Foundation

struct AbilityOut: Codable, Sendable, Hashable {
    let theta: Double?
    let thetaSe: Double?
    let level: String   // beginner | developing | proficient | advanced
}

struct ActivityPoint: Codable, Sendable, Hashable, Identifiable {
    let date: String    // YYYY-MM-DD
    let count: Int
    var id: String { date }
}

struct ThetaPoint: Codable, Sendable, Hashable, Identifiable {
    let at: Date
    let theta: Double
    var id: Date { at }
}

struct SubjectRef: Codable, Sendable, Hashable {
    let topicId: String
    let topicName: String
    let accuracyRate: Double?
}

struct StudentDashboardOut: Codable, Sendable, Hashable {
    let ability: AbilityOut
    let answered: Int
    let correct: Int
    let accuracy: Double?
    let sessions: Int
    let libraryTotal: Int
    let librarySeen: Int
    let libraryNew: Int
    let dueNow: Int
    let cardsLearning: Int
    let cardsReview: Int
    let topicsActive: Int
    let topicsMastered: Int
    let mastery: [String: Int]
    let streakDays: Int
    let activity: [ActivityPoint]
    let thetaTrend: [ThetaPoint]
    let strongest: SubjectRef?
    let focus: SubjectRef?
    let recentSessions: [SessionBrief]
}

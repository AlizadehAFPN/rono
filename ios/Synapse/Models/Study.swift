import Foundation

enum JourneyState: String, Codable, Sendable {
    case notStarted = "not_started"
    case learning
    case reviewing
    case mastered
}

enum MasteryLevel: String, Codable, Sendable {
    case notStarted = "not_started"
    case needsReview = "needs_review"
    case developing
    case proficient
    case mastered
}

struct CategoryCardOut: Codable, Identifiable, Sendable, Hashable {
    let topicId: String
    let topicName: String
    let level: Int
    let examType: String?
    let totalQuestions: Int
    let answered: Int
    let newCount: Int
    let dueCount: Int
    let masteryLevel: String
    let topicTheta: Double?
    let accuracyRate: Double?
    let journeyState: String
    let recommendedMode: String?   // adaptive_practice | review | null

    var id: String { topicId }
    var mastery: MasteryLevel? { MasteryLevel(rawValue: masteryLevel) }
    var journey: JourneyState? { JourneyState(rawValue: journeyState) }
}

struct StudyOverviewOut: Codable, Sendable, Hashable {
    let categories: [CategoryCardOut]
}

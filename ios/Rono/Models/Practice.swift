import Foundation

// MARK: - Session start

struct SessionStartRequest: Encodable, Sendable {
    var sessionType: String = "adaptive_practice"   // adaptive_practice | review | daily_review
    var examType: String?
    var examPart: String?
    var topicId: String?
    var topicIds: [String]?
    var itemsTarget: Int? = 10
    var limitType: String?          // "count" | "time"
    var timeLimitMinutes: Int?
    var selfRatedLevel: String?     // beginner | developing | proficient | advanced
    var deviceType: String? = "ios"
}

struct PracticeSessionOut: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let sessionType: String
    let status: String
    let examTypeScope: String?
    let examPartScope: String?
    let topicScope: String?
    let limitType: String?
    let timeLimitMinutes: Int?
    let itemsTarget: Int?
    let itemsDelivered: Int
    let itemsCorrect: Int
    let scorePercent: Double?
    let thetaStart: Double?
    let thetaEnd: Double?
    let startedAt: Date
    let completedAt: Date?
}

// MARK: - Next item (adaptive)

struct NextOptionOut: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let key: String
    let content: String
    let displayOrder: Int
}

struct NextItemOut: Codable, Sendable, Hashable {
    let sessionId: String
    let itemId: String
    let itemVersionId: String
    let content: String
    let options: [NextOptionOut]
    let primaryTopicId: String?
    let selectionTheta: Double
    let itemIrtA: Double
    let itemIrtB: Double
    let fisherInformation: Double
    let itemsDelivered: Int
    let itemsTarget: Int?
}

struct NoMoreItems: Codable, Sendable, Hashable {
    let sessionId: String
    let detail: String
    let itemsDelivered: Int
}

/// `GET /sessions/{id}/next` returns either a question or an exhausted-pool marker.
enum NextResult: Sendable {
    case item(NextItemOut)
    case noMore(NoMoreItems)
}

extension NextResult: Decodable {
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: AnyKey.self)
        // NextItemOut always carries item_id (→ itemId); NoMoreItems never does.
        if container.contains(AnyKey("itemId")) {
            self = .item(try NextItemOut(from: decoder))
        } else {
            self = .noMore(try NoMoreItems(from: decoder))
        }
    }

    private struct AnyKey: CodingKey {
        var stringValue: String
        var intValue: Int? { nil }
        init(_ s: String) { stringValue = s }
        init?(stringValue: String) { self.stringValue = stringValue }
        init?(intValue: Int) { nil }
    }
}

// MARK: - Exam paper (fixed set, up front)

struct ExamItemOut: Codable, Identifiable, Sendable, Hashable {
    let itemId: String
    let itemVersionId: String
    let content: String
    let options: [NextOptionOut]
    let primaryTopicId: String?

    var id: String { itemId }
}

struct ExamPaperOut: Codable, Sendable, Hashable {
    let sessionId: String
    let items: [ExamItemOut]
    let count: Int
}

// MARK: - Answer

struct AnswerSubmitRequest: Encodable, Sendable {
    let itemId: String
    var selectedOptionId: String?
    var responseTimeMs: Int?
    var wasSkipped: Bool = false
    var isTimedOut: Bool = false
}

struct BulkAnswerSubmitRequest: Encodable, Sendable {
    let answers: [AnswerSubmitRequest]
}

struct CardScheduleOut: Codable, Sendable, Hashable {
    let rating: Int
    let state: String
    let stability: Double
    let difficulty: Double
    let dueAt: Date?
    let scheduledIntervalDays: Double
    let reps: Int
    let lapses: Int
}

struct AnswerResultOut: Codable, Sendable, Hashable {
    let responseId: Int
    let itemId: String
    let isCorrect: Bool
    let wasSkipped: Bool
    let correctOptionId: String?
    let explanation: String?
    let thetaBefore: Double
    let thetaAfter: Double
    let thetaSeAfter: Double
    let topicThetaAfter: Double?
    let card: CardScheduleOut
    let itemsDelivered: Int
    let itemsCorrect: Int
}

struct BulkAnswerResultOut: Codable, Sendable, Hashable {
    let results: [AnswerResultOut]
}

// MARK: - Summary

struct SessionSummaryOut: Codable, Identifiable, Sendable, Hashable {
    let id: String
    let status: String
    let itemsDelivered: Int
    let itemsCorrect: Int
    let itemsSkipped: Int
    let itemsWrong: Int
    let scorePercent: Double?
    let netScore: Double?
    let penaltyPerWrong: Double?
    let thetaStart: Double?
    let thetaEnd: Double?
    let thetaDelta: Double?
    let startedAt: Date
    let completedAt: Date?
    let timeSpentSeconds: Int?
}

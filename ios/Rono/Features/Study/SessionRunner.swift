import SwiftUI
import Observation

/// Drives an adaptive session (Study / Practice / Daily Review): fetch next →
/// answer → feedback → repeat → finish. Mirrors the web study/session runner.
@Observable
@MainActor
final class SessionRunner {
    enum Stage: Equatable {
        case loading
        case question
        case feedback
        case finishing
        case finished
        case error(String)
    }

    let session: PracticeSessionOut
    /// Reveal the answer after each question (always true for adaptive; exam can disable).
    let revealFeedback: Bool

    private(set) var stage: Stage = .loading
    private(set) var current: NextItemOut?
    private(set) var result: AnswerResultOut?
    private(set) var summary: SessionSummaryOut?
    private(set) var isRequestInFlight = false

    var selectedOptionId: String?

    // Running session stats
    private(set) var delivered = 0
    private(set) var correct = 0
    private(set) var streak = 0
    private(set) var theta: Double?

    private var questionStart: Date?

    var target: Int? { session.itemsTarget }
    var accuracy: Double { delivered > 0 ? Double(correct) / Double(delivered) : 0 }
    var progress: Double {
        guard let t = target, t > 0 else { return 0 }
        return min(Double(delivered) / Double(t), 1)
    }

    init(session: PracticeSessionOut, revealFeedback: Bool = true) {
        self.session = session
        self.revealFeedback = revealFeedback
        self.theta = session.thetaStart
    }

    func loadNext() async {
        guard !isRequestInFlight else { return }
        isRequestInFlight = true
        defer { isRequestInFlight = false }
        stage = .loading
        do {
            let res = try await PracticeAPI.next(session.id)
            switch res {
            case .item(let item):
                current = item
                selectedOptionId = nil
                result = nil
                questionStart = Date()
                stage = .question
            case .noMore:
                await finish()
            }
        } catch let e as APIError {
            stage = .error(e.detail)
        } catch {
            stage = .error(error.localizedDescription)
        }
    }

    func submit() async {
        guard !isRequestInFlight, let item = current, let optionId = selectedOptionId, stage == .question else { return }
        isRequestInFlight = true
        defer { isRequestInFlight = false }
        let ms = questionStart.map { Int(Date().timeIntervalSince($0) * 1000) }
        do {
            let r = try await PracticeAPI.answer(session.id, .init(
                itemId: item.itemId, selectedOptionId: optionId, responseTimeMs: ms
            ))
            apply(r)
            stage = .feedback
            if r.isCorrect { Haptics.success() } else { Haptics.error() }
        } catch let e as APIError {
            stage = .error(e.detail)
        } catch {
            stage = .error(error.localizedDescription)
        }
    }

    func skip() async {
        guard !isRequestInFlight, let item = current, stage == .question else { return }
        isRequestInFlight = true
        let ms = questionStart.map { Int(Date().timeIntervalSince($0) * 1000) }
        do {
            let r = try await PracticeAPI.answer(session.id, .init(
                itemId: item.itemId, selectedOptionId: nil, responseTimeMs: ms, wasSkipped: true
            ))
            apply(r)
            // Skips don't show feedback — move straight on.
            isRequestInFlight = false
            await loadNext()
        } catch {
            isRequestInFlight = false
            stage = .error(error.localizedDescription)
        }
    }

    func proceed() async {
        // Count-budget sessions end once the target is reached.
        if let t = target, delivered >= t {
            await finish()
        } else {
            await loadNext()
        }
    }

    /// Whether the feedback "continue" action should finish rather than advance.
    var isLastQuestion: Bool {
        if let t = target { return delivered >= t }
        return false
    }

    func finish() async {
        guard !isRequestInFlight || stage == .loading else { return }
        isRequestInFlight = true
        defer { isRequestInFlight = false }
        stage = .finishing
        do {
            summary = try await PracticeAPI.finish(session.id)
            stage = .finished
            Haptics.success()
        } catch let e as APIError {
            stage = .error(e.detail)
        } catch {
            stage = .error(error.localizedDescription)
        }
    }

    private func apply(_ r: AnswerResultOut) {
        result = r
        delivered = r.itemsDelivered
        correct = r.itemsCorrect
        theta = r.thetaAfter
        if r.wasSkipped {
            streak = 0
        } else if r.isCorrect {
            streak += 1
        } else {
            streak = 0
        }
    }
}

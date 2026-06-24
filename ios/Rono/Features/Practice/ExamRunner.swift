import SwiftUI
import Observation

/// Drives the fixed-paper exam flow (mirrors the web practice/exam page):
/// setup → load paper → ready → exam → results. Two modes: instant feedback,
/// or real-exam (answer freely, grade at the end).
@Observable
@MainActor
final class ExamRunner {
    enum Phase: Equatable { case setup, loading, ready, exam, submitting, results }

    struct QResult: Sendable {
        let isCorrect: Bool
        let wasSkipped: Bool
        let correctOptionId: String?
        let explanation: String?
    }

    var phase: Phase = .setup

    // Setup config
    var examType = "tus"
    var examPart: String? = nil
    var feedbackMode = false

    private(set) var sessionId = ""
    private(set) var items: [ExamItemOut] = []
    var answers: [String: String?] = [:]
    private(set) var flagged: Set<String> = []
    private(set) var results: [String: QResult] = [:]
    var current = 0
    private(set) var summary: SessionSummaryOut?
    private(set) var startedAt = Date()
    private(set) var error: String?

    private var submittedIds: Set<String> = []

    var item: ExamItemOut? { items.indices.contains(current) ? items[current] : nil }
    var answeredCount: Int { items.filter { (answers[$0.itemId] ?? nil) != nil }.count }
    var canStart: Bool { phase == .setup }
    var canSubmit: Bool { phase == .exam }

    func start() async {
        guard canStart else { return }
        phase = .loading; error = nil
        do {
            let session = try await PracticeAPI.start(.init(
                sessionType: "exam", examType: examType, examPart: examPart, itemsTarget: nil
            ))
            sessionId = session.id
            let paper = try await PracticeAPI.examPaper(session.id)
            items = paper.items
            answers = [:]; flagged = []; results = [:]; submittedIds = []; current = 0
            phase = items.isEmpty ? .setup : .ready
            if items.isEmpty { error = "empty" }
        } catch let e as APIError {
            error = e.detail; phase = .setup
        } catch {
            self.error = error.localizedDescription; phase = .setup
        }
    }

    func begin() {
        startedAt = Date()
        phase = .exam
    }

    func choose(_ it: ExamItemOut, _ optionId: String) async {
        guard phase == .exam else { return }
        if results[it.itemId] != nil { return } // locked in feedback mode
        if feedbackMode {
            answers[it.itemId] = optionId
            do {
                let r = try await PracticeAPI.answer(sessionId, .init(itemId: it.itemId, selectedOptionId: optionId))
                submittedIds.insert(it.itemId)
                results[it.itemId] = QResult(isCorrect: r.isCorrect, wasSkipped: r.wasSkipped,
                                             correctOptionId: r.correctOptionId, explanation: r.explanation)
                r.isCorrect ? Haptics.success() : Haptics.error()
            } catch {
                self.error = error.localizedDescription
                Haptics.warning()
            }
        } else {
            // Toggle — tapping the chosen option again clears it (allow blank).
            Haptics.select()
            answers[it.itemId] = (answers[it.itemId] ?? nil) == optionId ? nil : optionId
        }
    }

    func toggleFlag(_ itemId: String) {
        guard !itemId.isEmpty else { return }
        Haptics.tap()
        if flagged.contains(itemId) { flagged.remove(itemId) } else { flagged.insert(itemId) }
    }

    func go(to index: Int) { current = max(0, min(items.count - 1, index)) }
    func nextQ() { go(to: current + 1) }
    func prevQ() { go(to: current - 1) }

    func submitExam() async {
        guard canSubmit else { return }
        phase = .submitting
        error = nil

        // Grade every not-yet-submitted answer in a single atomic round-trip.
        // (Feedback-mode answers were already graded live, so they're skipped.)
        let pending = items.filter { !submittedIds.contains($0.itemId) }
        if !pending.isEmpty {
            let payload = pending.map { it in
                let sel = answers[it.itemId] ?? nil
                return AnswerSubmitRequest(itemId: it.itemId, selectedOptionId: sel, wasSkipped: sel == nil)
            }
            do {
                let batch = try await PracticeAPI.bulkAnswer(sessionId, .init(answers: payload))
                var collected = results
                for r in batch.results {
                    submittedIds.insert(r.itemId)
                    collected[r.itemId] = QResult(isCorrect: r.isCorrect, wasSkipped: r.wasSkipped,
                                                  correctOptionId: r.correctOptionId, explanation: r.explanation)
                }
                results = collected
            } catch let e as APIError {
                // The batch is all-or-nothing server-side; nothing was committed.
                error = e.detail
                phase = .exam
                Haptics.error()
                return
            } catch {
                self.error = "Could not submit your answers. Please check your connection and try again."
                phase = .exam
                Haptics.error()
                return
            }
        }

        do {
            summary = try await PracticeAPI.finish(sessionId)
            phase = .results
            Haptics.success()
        } catch let e as APIError {
            error = e.detail; phase = .exam
        } catch {
            self.error = error.localizedDescription; phase = .exam
        }
    }

    func reset() {
        phase = .setup; items = []; answers = [:]; flagged = []; results = [:]
        submittedIds = []; current = 0; summary = nil; error = nil
    }
}

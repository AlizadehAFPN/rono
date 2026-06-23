import Foundation

struct PracticeStrings: Sendable {
    struct ExamSetup: Sendable {
        let title, subtitle, examLabel, partLabel, scopeHint, anyPart, basic, clinical,
            feedbackLabel, feedbackHint, start, starting, empty: String
    }
    struct ExamReady: Sendable {
        let eyebrow, rule1, rule2, feedbackOn, feedbackOff, noTimeLimit, begin: String
        let questions: @Sendable (Int) -> String
    }
    struct ExamRunner: Sendable {
        let flag, flagged, prev, next, clear, submit, submitting, exit, exitConfirm,
            kbd, palette, legendAnswered, legendUnanswered, legendFlagged, abandonWarning: String
        let question: @Sendable (Int, Int) -> String
        let answeredCount: @Sendable (Int, Int) -> String
    }
    struct ExamReview: Sendable {
        let title, subtitle, answered, blank, flagged, jumpHint, submitNow, keepWorking: String
    }
    struct Feedback: Sendable {
        let correct, incorrect, correctAnswer, explanation: String
    }
    struct ExamResults: Sendable {
        let title, correct, wrong, skipped, score, netScore, ability, timeTaken, review, newExam: String
    }
    struct Exam: Sendable {
        let pageTitle: String
        let setup: ExamSetup
        let ready: ExamReady
        let runner: ExamRunner
        let review: ExamReview
        let feedback: Feedback
        let results: ExamResults
    }
    struct Setup: Sendable {
        let title, subtitle, modeLabel, modePractice, modeReview, examLabel, partLabel,
            countLabel, anyExam, anyPart, basic, clinical, start, starting: String
    }
    struct Schedule: Sendable {
        let label, soon: String
        let inMinutes: @Sendable (Int) -> String
        let inHours: @Sendable (Int) -> String
        let inDays: @Sendable (Int) -> String
    }
    struct Panel: Sendable {
        let title, progress, accuracy, ability: String
        let streak: @Sendable (Int) -> String
    }
    struct Runner: Sendable {
        let submit, submitting, skip, next, finish, finishing, correct, incorrect,
            skipped, correctAnswer, explanation, ability, selectHint: String
        let progress: @Sendable (Int, Int?) -> String
        let panel: Panel
        let schedule: Schedule
    }
    struct Summary: Sendable {
        let title, accuracy, correct, wrong, skipped, delivered, scorePercent, netScore,
            noPenalty, abilityChange, time, restart, done: String
        let penaltyNote: @Sendable (Double) -> String
    }
    struct States: Sendable { let loading, error, noQuestions: String }

    let pageTitle: String
    let exam: Exam
    let setup: Setup
    let runner: Runner
    let summary: Summary
    let states: States

    static let en = PracticeStrings(
        pageTitle: "Practice",
        exam: Exam(
            pageTitle: "Exam",
            setup: .init(
                title: "Set up your exam",
                subtitle: "Answer a fixed set of questions like a real exam, then see your score.",
                examLabel: "Exam", partLabel: "Section",
                scopeHint: "Your paper includes every question in the chosen section.",
                anyPart: "All sections", basic: "Basic Sciences", clinical: "Clinical Sciences",
                feedbackLabel: "Reveal the answer after each question",
                feedbackHint: "Leave this off for a real exam — you only see results at the end.",
                start: "Set up exam", starting: "Preparing your paper…",
                empty: "No questions available for this selection."
            ),
            ready: .init(
                eyebrow: "Exam ready",
                rule1: "Move freely between questions — flag any to revisit before you finish.",
                rule2: "Answers are saved only when you submit. Leaving early discards the exam.",
                feedbackOn: "The answer is shown after each question.",
                feedbackOff: "You'll see your results only at the end.",
                noTimeLimit: "No time limit — the clock just tracks your pace.",
                begin: "Begin exam",
                questions: { "\($0) questions" }
            ),
            runner: .init(
                flag: "Flag", flagged: "Flagged", prev: "Previous", next: "Next",
                clear: "Clear answer", submit: "Submit", submitting: "Submitting…",
                exit: "Exit exam",
                exitConfirm: "Leave the exam? Nothing will be saved and you'll start over.",
                kbd: "", palette: "Answer sheet", legendAnswered: "Answered",
                legendUnanswered: "Unanswered", legendFlagged: "Flagged",
                abandonWarning: "Leaving now discards the exam — nothing is saved and you'll start over.",
                question: { "Question \($0) of \($1)" },
                answeredCount: { "\($0) / \($1)" }
            ),
            review: .init(
                title: "Review your exam",
                subtitle: "Check anything you flagged or left blank, then submit.",
                answered: "Answered", blank: "Blank", flagged: "Flagged",
                jumpHint: "Tap a number to jump back to that question.",
                submitNow: "Submit exam", keepWorking: "Keep working"
            ),
            feedback: .init(correct: "Correct", incorrect: "Incorrect",
                            correctAnswer: "Correct answer", explanation: "Explanation"),
            results: .init(
                title: "Exam results", correct: "Correct", wrong: "Wrong", skipped: "Blank",
                score: "Score", netScore: "Net score", ability: "Ability change",
                timeTaken: "Time taken", review: "Answer review", newExam: "New exam"
            )
        ),
        setup: .init(
            title: "Start a practice session",
            subtitle: "Answer adaptively-selected questions and get instant feedback.",
            modeLabel: "Mode", modePractice: "Practice", modeReview: "Review (due cards)",
            examLabel: "Exam", partLabel: "Section", countLabel: "Number of questions",
            anyExam: "All", anyPart: "All sections", basic: "Basic Sciences",
            clinical: "Clinical Sciences", start: "Start", starting: "Starting…"
        ),
        runner: .init(
            submit: "Submit answer", submitting: "Submitting…", skip: "Skip",
            next: "Next question", finish: "Finish", finishing: "Finishing…",
            correct: "Correct", incorrect: "Incorrect", skipped: "Skipped",
            correctAnswer: "Correct answer", explanation: "Explanation", ability: "Ability (θ)",
            selectHint: "Select an answer",
            progress: { n, total in total != nil ? "Question \(n) / \(total!)" : "Question \(n)" },
            panel: .init(title: "This session", progress: "Progress", accuracy: "Accuracy",
                         ability: "Ability (θ)", streak: { "\($0) in a row" }),
            schedule: .init(label: "Next review", soon: "shortly",
                            inMinutes: { "in \($0) min" }, inHours: { "in \($0) h" },
                            inDays: { "in \($0) day\($0 == 1 ? "" : "s")" })
        ),
        summary: .init(
            title: "Session complete", accuracy: "Accuracy", correct: "Correct", wrong: "Wrong",
            skipped: "Skipped", delivered: "Answered", scorePercent: "Score", netScore: "Net score",
            noPenalty: "no penalty", abilityChange: "Ability change", time: "Time",
            restart: "New session", done: "Done",
            penaltyNote: { "with \(Self.fmt($0)) penalty per wrong answer" }
        ),
        states: .init(loading: "Loading…", error: "Something went wrong.",
                      noQuestions: "No questions available for this selection.")
    )

    static let tr = PracticeStrings(
        pageTitle: "Alıştırma",
        exam: Exam(
            pageTitle: "Sınav",
            setup: .init(
                title: "Sınavını hazırla",
                subtitle: "Gerçek bir sınav gibi sabit sayıda soruyu yanıtla, sonra puanını gör.",
                examLabel: "Sınav", partLabel: "Bölüm",
                scopeHint: "Sınav kâğıdın, seçtiğin bölümdeki tüm soruları içerir.",
                anyPart: "Tüm bölümler", basic: "Temel Tıp Bilimleri", clinical: "Klinik Tıp Bilimleri",
                feedbackLabel: "Her sorudan sonra cevabı göster",
                feedbackHint: "Gerçek sınav için kapalı bırak — sonuçları yalnızca sonda görürsün.",
                start: "Sınavı hazırla", starting: "Soru kâğıdın hazırlanıyor…",
                empty: "Bu seçim için soru bulunmuyor."
            ),
            ready: .init(
                eyebrow: "Sınav hazır",
                rule1: "Sorular arasında serbestçe gez — bitirmeden önce dönmek için işaretle.",
                rule2: "Cevaplar yalnızca gönderince kaydedilir. Erken çıkış sınavı iptal eder.",
                feedbackOn: "Her sorudan sonra cevap gösterilir.",
                feedbackOff: "Sonuçlarını yalnızca sonda görürsün.",
                noTimeLimit: "Süre sınırı yok — saat yalnızca temponu izler.",
                begin: "Sınava başla",
                questions: { "\($0) soru" }
            ),
            runner: .init(
                flag: "İşaretle", flagged: "İşaretli", prev: "Önceki", next: "Sonraki",
                clear: "Cevabı temizle", submit: "Gönder", submitting: "Gönderiliyor…",
                exit: "Sınavdan çık",
                exitConfirm: "Sınavdan çıkılsın mı? Hiçbir şey kaydedilmez ve baştan başlarsın.",
                kbd: "", palette: "Cevap kâğıdı", legendAnswered: "Yanıtlanan",
                legendUnanswered: "Yanıtlanmayan", legendFlagged: "İşaretli",
                abandonWarning: "Şimdi çıkarsan sınav iptal olur — hiçbir şey kaydedilmez ve baştan başlarsın.",
                question: { "Soru \($0) / \($1)" },
                answeredCount: { "\($0) / \($1)" }
            ),
            review: .init(
                title: "Sınavını gözden geçir",
                subtitle: "İşaretlediğin veya boş bıraktığın soruları kontrol et, sonra gönder.",
                answered: "Yanıtlanan", blank: "Boş", flagged: "İşaretli",
                jumpHint: "Bir soruya dönmek için numarasına dokun.",
                submitNow: "Sınavı gönder", keepWorking: "Devam et"
            ),
            feedback: .init(correct: "Doğru", incorrect: "Yanlış",
                            correctAnswer: "Doğru cevap", explanation: "Açıklama"),
            results: .init(
                title: "Sınav sonuçları", correct: "Doğru", wrong: "Yanlış", skipped: "Boş",
                score: "Puan", netScore: "Net puan", ability: "Yetenek değişimi",
                timeTaken: "Süre", review: "Cevap incelemesi", newExam: "Yeni sınav"
            )
        ),
        setup: .init(
            title: "Alıştırma oturumu başlat",
            subtitle: "Uyarlanabilir seçilen soruları yanıtla ve anında geri bildirim al.",
            modeLabel: "Mod", modePractice: "Alıştırma", modeReview: "Tekrar (zamanı gelenler)",
            examLabel: "Sınav", partLabel: "Bölüm", countLabel: "Soru sayısı",
            anyExam: "Tümü", anyPart: "Tüm bölümler", basic: "Temel Tıp Bilimleri",
            clinical: "Klinik Tıp Bilimleri", start: "Başlat", starting: "Başlatılıyor…"
        ),
        runner: .init(
            submit: "Cevabı gönder", submitting: "Gönderiliyor…", skip: "Atla",
            next: "Sonraki soru", finish: "Bitir", finishing: "Bitiriliyor…",
            correct: "Doğru", incorrect: "Yanlış", skipped: "Atlandı",
            correctAnswer: "Doğru cevap", explanation: "Açıklama", ability: "Yetenek (θ)",
            selectHint: "Bir cevap seçin",
            progress: { n, total in total != nil ? "Soru \(n) / \(total!)" : "Soru \(n)" },
            panel: .init(title: "Bu oturum", progress: "İlerleme", accuracy: "Doğruluk",
                         ability: "Yetenek (θ)", streak: { "üst üste \($0)" }),
            schedule: .init(label: "Sonraki tekrar", soon: "yakında",
                            inMinutes: { "\($0) dk sonra" }, inHours: { "\($0) sa sonra" },
                            inDays: { "\($0) gün sonra" })
        ),
        summary: .init(
            title: "Oturum tamamlandı", accuracy: "Doğruluk", correct: "Doğru", wrong: "Yanlış",
            skipped: "Atlanan", delivered: "Yanıtlanan", scorePercent: "Puan", netScore: "Net puan",
            noPenalty: "ceza yok", abilityChange: "Yetenek değişimi", time: "Süre",
            restart: "Yeni oturum", done: "Bitti",
            penaltyNote: { "her yanlış için \(Self.fmt($0)) ceza ile" }
        ),
        states: .init(loading: "Yükleniyor…", error: "Bir şeyler ters gitti.",
                      noQuestions: "Bu seçim için soru bulunmuyor.")
    )

    private static func fmt(_ v: Double) -> String {
        v == v.rounded() ? String(Int(v)) : String(format: "%.2g", v)
    }
}

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

    static let fa = PracticeStrings(
        pageTitle: "تمرین",
        exam: Exam(
            pageTitle: "آزمون",
            setup: .init(
                title: "آزمونت رو بچین",
                subtitle: "مثل یه آزمون واقعی به تعداد مشخصی سؤال جواب بده، بعد نمره‌ات رو ببین.",
                examLabel: "آزمون", partLabel: "بخش",
                scopeHint: "برگه‌ات همه‌ی سؤال‌های بخشی که انتخاب کردی رو دارد.",
                anyPart: "همه‌ی بخش‌ها", basic: "دروس عمومی", clinical: "دروس تخصصی",
                feedbackLabel: "بعد از هر سؤال جواب رو نشانم بده",
                feedbackHint: "برای آزمون واقعی این رو خاموش بذار — نتیجه رو فقط آخرش می‌بینی.",
                start: "آزمون رو آماده کن", starting: "داریم برگه‌ات رو آماده می‌کنیم…",
                empty: "برای این انتخاب سؤالی موجود نیست."
            ),
            ready: .init(
                eyebrow: "آزمون آماده‌ست",
                rule1: "بین سؤال‌ها راحت جابه‌جا شو — هرکدوم رو خواستی علامت بزن تا قبل از پایان دوباره سراغش بری.",
                rule2: "جواب‌ها فقط وقتی ثبت می‌شن که آزمون رو بفرستی. زود بیرون بری آزمون پاک می‌شه.",
                feedbackOn: "بعد از هر سؤال جواب نشان داده می‌شه.",
                feedbackOff: "نتیجه‌ات رو فقط در پایان می‌بینی.",
                noTimeLimit: "محدودیت زمانی نداری — ساعت فقط سرعتت رو نشان می‌ده.",
                begin: "شروع آزمون",
                questions: { "\($0) سؤال" }
            ),
            runner: .init(
                flag: "علامت", flagged: "علامت‌خورده", prev: "قبلی", next: "بعدی",
                clear: "پاک کردن جواب", submit: "ثبت", submitting: "در حال ثبت…",
                exit: "خروج از آزمون",
                exitConfirm: "از آزمون بیرون بری؟ چیزی ذخیره نمی‌شه و از اول شروع می‌کنی.",
                kbd: "", palette: "پاسخ‌برگ", legendAnswered: "جواب‌داده",
                legendUnanswered: "بی‌جواب", legendFlagged: "علامت‌خورده",
                abandonWarning: "اگه الان بیرون بری آزمون پاک می‌شه — چیزی ذخیره نمی‌شه و از اول شروع می‌کنی.",
                question: { "سؤال \($0) از \($1)" },
                answeredCount: { "\($0) / \($1)" }
            ),
            review: .init(
                title: "آزمونت رو مرور کن",
                subtitle: "هرچی رو علامت زدی یا خالی گذاشتی چک کن، بعد بفرست.",
                answered: "جواب‌داده", blank: "خالی", flagged: "علامت‌خورده",
                jumpHint: "روی یه شماره بزن تا به همون سؤال برگردی.",
                submitNow: "فرستادن آزمون", keepWorking: "ادامه می‌دم"
            ),
            feedback: .init(correct: "درست", incorrect: "نادرست",
                            correctAnswer: "جواب درست", explanation: "توضیح"),
            results: .init(
                title: "نتیجه‌ی آزمون", correct: "درست", wrong: "غلط", skipped: "خالی",
                score: "نمره", netScore: "نمره‌ی خالص", ability: "تغییر میزان آمادگی",
                timeTaken: "زمان صرف‌شده", review: "مرور جواب‌ها", newExam: "آزمون جدید"
            )
        ),
        setup: .init(
            title: "یه تمرین شروع کن",
            subtitle: "به سؤال‌هایی که هوشمند برات انتخاب شده جواب بده و سریع بازخورد بگیر.",
            modeLabel: "حالت", modePractice: "تمرین", modeReview: "مرور (کارت‌های موعددار)",
            examLabel: "آزمون", partLabel: "بخش", countLabel: "تعداد سؤال‌ها",
            anyExam: "همه", anyPart: "همه‌ی بخش‌ها", basic: "دروس عمومی",
            clinical: "دروس تخصصی", start: "شروع", starting: "در حال شروع…"
        ),
        runner: .init(
            submit: "ثبت جواب", submitting: "در حال ثبت…", skip: "رد کن",
            next: "سؤال بعدی", finish: "تمام", finishing: "در حال اتمام…",
            correct: "درست", incorrect: "نادرست", skipped: "رد شده",
            correctAnswer: "جواب درست", explanation: "توضیح", ability: "میزان آمادگی",
            selectHint: "یه جواب انتخاب کن",
            progress: { n, total in total != nil ? "سؤال \(n) / \(total!)" : "سؤال \(n)" },
            panel: .init(title: "این تمرین", progress: "پیشرفت", accuracy: "دقت",
                         ability: "میزان آمادگی", streak: { "\($0) تا پشت سر هم" }),
            schedule: .init(label: "مرور بعدی", soon: "به‌زودی",
                            inMinutes: { "\($0) دقیقه دیگه" }, inHours: { "\($0) ساعت دیگه" },
                            inDays: { "\($0) روز دیگه" })
        ),
        summary: .init(
            title: "تمرین تمام شد", accuracy: "دقت", correct: "درست", wrong: "غلط",
            skipped: "رد شده", delivered: "جواب‌داده", scorePercent: "نمره", netScore: "نمره‌ی خالص",
            noPenalty: "بدون نمره‌ی منفی", abilityChange: "تغییر میزان آمادگی", time: "زمان",
            restart: "تمرین جدید", done: "تمام",
            penaltyNote: { "با \(Self.fmt($0)) نمره منفی برای هر جواب غلط" }
        ),
        states: .init(loading: "در حال بارگذاری…", error: "یه مشکلی پیش اومد.",
                      noQuestions: "برای این انتخاب سؤالی موجود نیست.")
    )

    private static func fmt(_ v: Double) -> String {
        v == v.rounded() ? String(Int(v)) : String(format: "%.2g", v)
    }
}

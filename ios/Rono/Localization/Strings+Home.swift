import Foundation

// MARK: - Student home dashboard

struct HomeStrings: Sendable {
    struct Greeting: Sendable { let morning, afternoon, evening, fallbackName: String }
    struct Stats: Sendable { let ability, accuracy, answered, streak: String }
    struct Due: Sendable { let title, dueNow, none, caughtUp, cta, learning, review: String }
    struct Library: Sendable { let title, seen, newLabel, coverage: String }
    struct Mastery: Sendable {
        let title, strongest, focus: String
        let levels: [String: String]
        let masteredOf: @Sendable (Int, Int) -> String
    }
    struct Activity: Sendable { let title, empty, questions: String }
    struct Trend: Sendable { let title, notEnough: String }
    struct Actions: Sendable { let title, study, exam, progress, dailyStudy, dailySub, progressTitle, progressSub: String }
    struct Sessions: Sendable { let title, empty: String; let types: [String: String] }
    struct Empty: Sendable { let title, body, cta: String }

    let title, subtitle, loading: String
    let greeting: Greeting
    let empty: Empty
    let levels: [String: String]
    let stats: Stats
    let due: Due
    let library: Library
    let mastery: Mastery
    let activity: Activity
    let trend: Trend
    let actions: Actions
    let sessions: Sessions

    static let en = HomeStrings(
        title: "Dashboard", subtitle: "Here's your learning at a glance.",
        loading: "Loading your dashboard…",
        greeting: .init(morning: "Good morning", afternoon: "Good afternoon",
                        evening: "Good evening", fallbackName: "there"),
        empty: .init(title: "Welcome to Rono",
                     body: "Study a category to start building your progress — it will show up here.",
                     cta: "Browse categories"),
        levels: ["beginner": "Beginner", "developing": "Developing",
                 "proficient": "Proficient", "advanced": "Advanced"],
        stats: .init(ability: "Ability", accuracy: "Accuracy", answered: "Answered", streak: "Day streak"),
        due: .init(title: "Review queue", dueNow: "due now",
                   none: "You're all caught up — nothing due right now.", caughtUp: "All caught up",
                   cta: "Start review", learning: "Learning", review: "In review"),
        library: .init(title: "Question bank", seen: "Seen", newLabel: "New", coverage: "Coverage"),
        mastery: .init(title: "Subject mastery", strongest: "Strongest", focus: "Focus area",
                       levels: ["not_started": "Not started", "needs_review": "Needs review",
                                "developing": "Developing", "proficient": "Proficient",
                                "mastered": "Mastered"],
                       masteredOf: { "\($0) of \($1) subjects mastered" }),
        activity: .init(title: "Last 14 days", empty: "No activity yet.", questions: "questions"),
        trend: .init(title: "Ability trend", notEnough: "Answer a few more questions to see your trend."),
        actions: .init(title: "Quick actions", study: "Continue studying",
                       exam: "Take an exam", progress: "Detailed progress",
                       dailyStudy: "Daily Study", dailySub: "Spaced-repetition review",
                       progressTitle: "Progress", progressSub: "Trends, mastery & history"),
        sessions: .init(title: "Recent sessions", empty: "No sessions yet.",
                        types: ["adaptive_practice": "Practice", "review": "Review", "exam": "Exam"])
    )

    static let fa = HomeStrings(
        title: "داشبورد", subtitle: "یک نگاه کلی به یادگیری‌ات.",
        loading: "در حال بارگذاری داشبورد…",
        greeting: .init(morning: "صبح بخیر", afternoon: "ظهر بخیر",
                        evening: "عصر بخیر", fallbackName: "دوست من"),
        empty: .init(title: "به رونو خوش اومدی",
                     body: "روی یک درس کار کن تا پیشرفتت شروع بشه — همین‌جا نشونت می‌دیم.",
                     cta: "دیدن درس‌ها"),
        levels: ["beginner": "تازه‌کار", "developing": "متوسط",
                 "proficient": "ماهر", "advanced": "پیشرفته"],
        stats: .init(ability: "آمادگی", accuracy: "دقت", answered: "پاسخ‌داده", streak: "روز پیاپی"),
        due: .init(title: "صف مرور", dueNow: "وقتشه",
                   none: "همه چی مرتبه — الان چیزی برای مرور نداری.", caughtUp: "همه چی مرتبه",
                   cta: "شروع مرور", learning: "در حال یادگیری", review: "در حال مرور"),
        library: .init(title: "بانک سؤال", seen: "دیده‌شده", newLabel: "جدید", coverage: "پوشش"),
        mastery: .init(title: "تسلط بر درس‌ها", strongest: "قوی‌ترین", focus: "نیاز به تمرکز",
                       levels: ["not_started": "شروع‌نشده", "needs_review": "نیاز به مرور",
                                "developing": "متوسط", "proficient": "ماهر",
                                "mastered": "مسلط"],
                       masteredOf: { "تسلط بر \($0) درس از \($1) درس" }),
        activity: .init(title: "۱۴ روز اخیر", empty: "هنوز فعالیتی نیست.", questions: "سؤال"),
        trend: .init(title: "روند آمادگی", notEnough: "چند سؤال دیگه جواب بده تا روندت رو ببینی."),
        actions: .init(title: "کارهای سریع", study: "ادامه مطالعه",
                       exam: "شرکت در آزمون", progress: "پیشرفت کامل",
                       dailyStudy: "مطالعه روزانه", dailySub: "مرور در فاصله‌های زمانی",
                       progressTitle: "پیشرفت", progressSub: "روندها، تسلط و تاریخچه"),
        sessions: .init(title: "جلسه‌های اخیر", empty: "هنوز جلسه‌ای نیست.",
                        types: ["adaptive_practice": "تمرین", "review": "مرور", "exam": "آزمون"])
    )
}

// MARK: - Progress

struct ProgressStrings: Sendable {
    struct Summary: Sendable {
        let title, strongest, focus, dueReview, mastered, cardsUnit, subjectsUnit, none: String
    }
    struct Insight: Sendable { let high, mid, low: String }
    struct Stats: Sendable { let ability, answered, correct, accuracy: String }
    struct Topics: Sendable { let title, empty, questions: String }
    struct Sessions: Sendable { let title, empty, score, net: String }

    let pageTitle, empty, loading: String
    let summary: Summary
    let abilityLevel: [String: String]
    let insight: Insight
    let stats: Stats
    let topics: Topics
    let sessions: Sessions
    let mastery: [String: String]
    let sessionType: [String: String]

    static let en = ProgressStrings(
        pageTitle: "Progress",
        empty: "No activity yet — take a practice session to see your progress.", loading: "Loading…",
        summary: .init(title: "Your snapshot", strongest: "Strongest subject", focus: "Focus area",
                       dueReview: "Due for review", mastered: "Subjects mastered",
                       cardsUnit: "cards", subjectsUnit: "subjects", none: "—"),
        abilityLevel: ["beginner": "Beginner", "developing": "Developing",
                       "proficient": "Proficient", "advanced": "Advanced"],
        insight: .init(high: "Excellent work — your accuracy is strong. Keep the momentum.",
                       mid: "Solid progress. A little review will push your scores higher.",
                       low: "Early days — keep practicing to build up your ability."),
        stats: .init(ability: "Ability (θ)", answered: "Answered", correct: "Correct", accuracy: "Accuracy"),
        topics: .init(title: "By subject", empty: "No subject activity yet.", questions: "questions"),
        sessions: .init(title: "Recent sessions", empty: "No sessions yet.", score: "Score", net: "Net"),
        mastery: ["not_started": "Not started", "needs_review": "Needs review",
                  "developing": "Developing", "proficient": "Proficient", "mastered": "Mastered"],
        sessionType: ["adaptive_practice": "Practice", "review": "Review", "exam": "Exam"]
    )

    static let fa = ProgressStrings(
        pageTitle: "پیشرفت",
        empty: "هنوز فعالیتی نیست — یک جلسه تمرین انجام بده تا پیشرفتت رو ببینی.", loading: "در حال بارگذاری…",
        summary: .init(title: "وضعیت تو", strongest: "قوی‌ترین درس", focus: "نیاز به تمرکز",
                       dueReview: "آماده مرور", mastered: "درس‌های مسلط‌شده",
                       cardsUnit: "کارت", subjectsUnit: "درس", none: "—"),
        abilityLevel: ["beginner": "تازه‌کار", "developing": "متوسط",
                       "proficient": "ماهر", "advanced": "پیشرفته"],
        insight: .init(high: "عالیه — دقتت خیلی خوبه. همین‌طور ادامه بده.",
                       mid: "پیشرفت خوبیه. کمی مرور امتیازهات رو بالاتر می‌بره.",
                       low: "تازه شروع کردی — با تمرین بیشتر آمادگی‌ات رو بساز."),
        stats: .init(ability: "آمادگی", answered: "پاسخ‌داده", correct: "درست", accuracy: "دقت"),
        topics: .init(title: "بر اساس درس", empty: "هنوز فعالیتی روی درس‌ها نیست.", questions: "سؤال"),
        sessions: .init(title: "جلسه‌های اخیر", empty: "هنوز جلسه‌ای نیست.", score: "امتیاز", net: "خالص"),
        mastery: ["not_started": "شروع‌نشده", "needs_review": "نیاز به مرور",
                  "developing": "متوسط", "proficient": "ماهر", "mastered": "مسلط"],
        sessionType: ["adaptive_practice": "تمرین", "review": "مرور", "exam": "آزمون"]
    )
}

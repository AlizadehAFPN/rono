import Foundation

struct StudyStrings: Sendable {
    struct Stats: Sendable { let new, due, total, answered, accuracy, progress: String }
    struct Action: Sendable {
        let start, continueLearning, caughtUp: String
        let review: @Sendable (Int) -> String
    }
    struct Daily: Sendable {
        let cardTitle, cardSubtitle, cardCta, formTitle, formSubtitle, collections,
            collectionsHint, all, budget, byTime, byCount, level, levelHint, levelSkip,
            start, starting, none, timeLeft, caughtUpTitle, caughtUpBody, backToStudy,
            selectAll, clear, length, optional, allNew: String
        let levels: [String: String]
        let dueToday: @Sendable (Int) -> String
        let dueElsewhere: @Sendable (Int) -> String
        let minutesOpt: @Sendable (Int) -> String
        let questionsOpt: @Sendable (Int) -> String
        let newAvailable: @Sendable (Int) -> String
        let dueCount: @Sendable (Int) -> String
        let newCount: @Sendable (Int) -> String
        let summaryCount: @Sendable (Int) -> String
        let summaryTime: @Sendable (Int) -> String
        let startsReviews: @Sendable (Int) -> String
    }

    let pageTitle, subtitle, empty, loading, error: String
    let stats: Stats
    let journey: [String: String]
    let mastery: [String: String]
    let action: Action
    let daily: Daily

    static let en = StudyStrings(
        pageTitle: "Study",
        subtitle: "Pick a category and keep moving along your learning journey.",
        empty: "No categories with questions are available yet.",
        loading: "Loading your categories…", error: "Could not load your categories.",
        stats: .init(new: "New", due: "Due", total: "Questions", answered: "Seen",
                     accuracy: "Accuracy", progress: "Coverage"),
        journey: ["not_started": "Not started", "learning": "Learning",
                  "reviewing": "Reviewing", "mastered": "Mastered"],
        mastery: ["not_started": "Not started", "needs_review": "Needs review",
                  "developing": "Developing", "proficient": "Proficient", "mastered": "Mastered"],
        action: .init(start: "Start learning", continueLearning: "Continue learning",
                      caughtUp: "All caught up", review: { "Review \($0) due" }),
        daily: .init(
            cardTitle: "Daily Review",
            cardSubtitle: "Today's due cards plus a little new — picked for you.",
            cardCta: "Start daily review", formTitle: "Daily Review",
            formSubtitle: "A focused adaptive session, tuned to what you need today.",
            collections: "Collections",
            collectionsHint: "Choose what to study today — everything is included by default.",
            all: "All collections", budget: "How much today?", byTime: "By time",
            byCount: "By questions", level: "How would you rate yourself?",
            levelHint: "Only used to set your starting difficulty before you've answered anything.",
            levelSkip: "Prefer not to say", start: "Start review", starting: "Starting…",
            none: "Pick at least one collection.", timeLeft: "left",
            caughtUpTitle: "All caught up for today",
            caughtUpBody: "Nothing is due right now. Come back later, or pick a category to get ahead.",
            backToStudy: "Back to Study", selectAll: "Select all", clear: "Clear",
            length: "Session length", optional: "optional", allNew: "new material today",
            levels: ["beginner": "Beginner", "developing": "Developing",
                     "proficient": "Proficient", "advanced": "Advanced"],
            dueToday: { "\($0) due today" },
            dueElsewhere: { "\($0) due card\($0 == 1 ? "" : "s") in collections you didn't pick will wait" },
            minutesOpt: { "\($0) min" }, questionsOpt: { "\($0) questions" },
            newAvailable: { "\($0) new available" }, dueCount: { "\($0) due" },
            newCount: { "\($0) new" }, summaryCount: { "≈ \($0) questions" },
            summaryTime: { "≈ \($0) min" },
            startsReviews: { "starts with \($0) due review\($0 == 1 ? "" : "s")" }
        )
    )

    static let fa = StudyStrings(
        pageTitle: "مرور",
        subtitle: "یک دسته انتخاب کن و توی مسیر یادگیری‌ات جلو برو.",
        empty: "هنوز هیچ دسته‌ای با سؤال موجود نیست.",
        loading: "در حال بارگذاری دسته‌هایت…", error: "نشد دسته‌هایت را بارگذاری کنیم.",
        stats: .init(new: "تازه", due: "موعد مرور", total: "سؤال", answered: "دیده‌شده",
                     accuracy: "دقت", progress: "پوشش"),
        journey: ["not_started": "شروع‌نشده", "learning": "در حال یادگیری",
                  "reviewing": "در حال مرور", "mastered": "مسلط"],
        mastery: ["not_started": "شروع‌نشده", "needs_review": "نیاز به مرور",
                  "developing": "در حال پیشرفت", "proficient": "خوب", "mastered": "مسلط"],
        action: .init(start: "شروع یادگیری", continueLearning: "ادامه یادگیری",
                      caughtUp: "همه‌چیز مرتب است", review: { "مرور \($0) سؤالِ موعددار" }),
        daily: .init(
            cardTitle: "مرور روزانه",
            cardSubtitle: "سؤال‌های موعددار امروز به‌علاوه‌ی کمی تازه — برای تو انتخاب شده.",
            cardCta: "شروع مرور روزانه", formTitle: "مرور روزانه",
            formSubtitle: "یک جلسه‌ی متمرکز و هوشمند، تنظیم‌شده با چیزی که امروز لازم داری.",
            collections: "مجموعه‌ها",
            collectionsHint: "انتخاب کن امروز چه چیزی را مرور کنی — به‌طور پیش‌فرض همه‌چیز هست.",
            all: "همه‌ی مجموعه‌ها", budget: "امروز چقدر؟", byTime: "بر اساس زمان",
            byCount: "بر اساس سؤال", level: "خودت را چطور ارزیابی می‌کنی؟",
            levelHint: "فقط برای تنظیم سطح شروع کارت، پیش از آن‌که به چیزی جواب بدهی استفاده می‌شود.",
            levelSkip: "ترجیح می‌دهم نگویم", start: "شروع مرور", starting: "در حال شروع…",
            none: "حداقل یک مجموعه انتخاب کن.", timeLeft: "مانده",
            caughtUpTitle: "برای امروز همه‌چیز مرتب است",
            caughtUpBody: "الان چیزی موعدش نرسیده. بعداً سر بزن، یا یک دسته انتخاب کن تا جلوتر بیفتی.",
            backToStudy: "بازگشت به مرور", selectAll: "انتخاب همه", clear: "پاک کردن",
            length: "طول جلسه", optional: "اختیاری", allNew: "مطلب تازه‌ی امروز",
            levels: ["beginner": "مبتدی", "developing": "در حال پیشرفت",
                     "proficient": "خوب", "advanced": "پیشرفته"],
            dueToday: { "\($0) سؤال برای امروز" },
            dueElsewhere: { "\($0) سؤالِ موعددار در مجموعه‌هایی که انتخاب نکردی منتظر می‌ماند" },
            minutesOpt: { "\($0) دقیقه" }, questionsOpt: { "\($0) سؤال" },
            newAvailable: { "\($0) تازه‌ی موجود" }, dueCount: { "\($0) موعددار" },
            newCount: { "\($0) تازه" }, summaryCount: { "≈ \($0) سؤال" },
            summaryTime: { "≈ \($0) دقیقه" },
            startsReviews: { "با \($0) سؤالِ موعددار شروع می‌شود" }
        )
    )
}

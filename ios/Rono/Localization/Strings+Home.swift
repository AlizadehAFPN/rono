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

    static let tr = HomeStrings(
        title: "Panel", subtitle: "Öğrenmene genel bir bakış.", loading: "Panelin yükleniyor…",
        greeting: .init(morning: "Günaydın", afternoon: "İyi günler",
                        evening: "İyi akşamlar", fallbackName: "merhaba"),
        empty: .init(title: "Rono'e hoş geldin",
                     body: "İlerlemeni oluşturmak için bir kategori çalış — burada görünecek.",
                     cta: "Kategorilere göz at"),
        levels: ["beginner": "Başlangıç", "developing": "Gelişiyor",
                 "proficient": "Yetkin", "advanced": "İleri"],
        stats: .init(ability: "Yetenek", accuracy: "Doğruluk", answered: "Yanıtlanan", streak: "Gün serisi"),
        due: .init(title: "Tekrar kuyruğu", dueNow: "zamanı geldi",
                   none: "Her şey tamam — şu an tekrar bekleyen yok.", caughtUp: "Her şey tamam",
                   cta: "Tekrara başla", learning: "Öğreniliyor", review: "Tekrarda"),
        library: .init(title: "Soru bankası", seen: "Görülen", newLabel: "Yeni", coverage: "Kapsam"),
        mastery: .init(title: "Ders uzmanlığı", strongest: "En güçlü", focus: "Odak alanı",
                       levels: ["not_started": "Başlanmadı", "needs_review": "Tekrar gerekli",
                                "developing": "Gelişiyor", "proficient": "Yetkin",
                                "mastered": "Uzman"],
                       masteredOf: { "\($1) dersten \($0) tanesinde uzman" }),
        activity: .init(title: "Son 14 gün", empty: "Henüz etkinlik yok.", questions: "soru"),
        trend: .init(title: "Yetenek eğilimi", notEnough: "Eğilimini görmek için birkaç soru daha yanıtla."),
        actions: .init(title: "Hızlı işlemler", study: "Çalışmaya devam et",
                       exam: "Sınava gir", progress: "Ayrıntılı ilerleme",
                       dailyStudy: "Günlük Çalışma", dailySub: "Aralıklı tekrar",
                       progressTitle: "İlerleme", progressSub: "Eğilimler, uzmanlık ve geçmiş"),
        sessions: .init(title: "Son oturumlar", empty: "Henüz oturum yok.",
                        types: ["adaptive_practice": "Alıştırma", "review": "Tekrar", "exam": "Sınav"])
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

    static let tr = ProgressStrings(
        pageTitle: "İlerleme",
        empty: "Henüz etkinlik yok — ilerlemeni görmek için bir alıştırma oturumu yap.", loading: "Yükleniyor…",
        summary: .init(title: "Durumun", strongest: "En güçlü ders", focus: "Odaklanılacak alan",
                       dueReview: "Tekrar zamanı", mastered: "Uzmanlaşılan dersler",
                       cardsUnit: "kart", subjectsUnit: "ders", none: "—"),
        abilityLevel: ["beginner": "Başlangıç", "developing": "Gelişiyor",
                       "proficient": "Yetkin", "advanced": "İleri"],
        insight: .init(high: "Harika gidiyorsun — doğruluğun yüksek. Bu tempoyu koru.",
                       mid: "İyi ilerleme. Biraz tekrar puanlarını daha da yükseltecek.",
                       low: "Henüz başlangıçtasın — yeteneğini geliştirmek için pratik yapmaya devam et."),
        stats: .init(ability: "Yetenek (θ)", answered: "Yanıtlanan", correct: "Doğru", accuracy: "Doğruluk"),
        topics: .init(title: "Derslere göre", empty: "Henüz ders etkinliği yok.", questions: "soru"),
        sessions: .init(title: "Son oturumlar", empty: "Henüz oturum yok.", score: "Puan", net: "Net"),
        mastery: ["not_started": "Başlanmadı", "needs_review": "Tekrar gerekli",
                  "developing": "Gelişiyor", "proficient": "Yetkin", "mastered": "Uzman"],
        sessionType: ["adaptive_practice": "Alıştırma", "review": "Tekrar", "exam": "Sınav"]
    )
}

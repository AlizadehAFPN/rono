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

    static let tr = StudyStrings(
        pageTitle: "Çalış",
        subtitle: "Bir kategori seç ve öğrenme yolculuğunda ilerlemeye devam et.",
        empty: "Henüz soru içeren bir kategori bulunmuyor.",
        loading: "Kategorilerin yükleniyor…", error: "Kategoriler yüklenemedi.",
        stats: .init(new: "Yeni", due: "Zamanı gelen", total: "Soru", answered: "Görülen",
                     accuracy: "Doğruluk", progress: "Kapsam"),
        journey: ["not_started": "Başlanmadı", "learning": "Öğreniliyor",
                  "reviewing": "Tekrar ediliyor", "mastered": "Ustalaşıldı"],
        mastery: ["not_started": "Başlanmadı", "needs_review": "Tekrar gerekli",
                  "developing": "Gelişiyor", "proficient": "Yetkin", "mastered": "Ustalaşıldı"],
        action: .init(start: "Öğrenmeye başla", continueLearning: "Öğrenmeye devam et",
                      caughtUp: "Hepsi tamam", review: { "\($0) tekrarı çöz" }),
        daily: .init(
            cardTitle: "Günlük Tekrar",
            cardSubtitle: "Bugün zamanı gelen kartlar ve biraz yeni — senin için seçildi.",
            cardCta: "Günlük tekrarı başlat", formTitle: "Günlük Tekrar",
            formSubtitle: "Bugün ihtiyacın olana göre ayarlanmış, odaklı bir uyarlanır oturum.",
            collections: "Koleksiyonlar",
            collectionsHint: "Bugün neyi çalışacağını seç — varsayılan olarak hepsi dahildir.",
            all: "Tüm koleksiyonlar", budget: "Bugün ne kadar?", byTime: "Süreye göre",
            byCount: "Soruya göre", level: "Kendini nasıl değerlendirirsin?",
            levelHint: "Yalnızca hiç cevap vermeden önce başlangıç zorluğunu ayarlamak için kullanılır.",
            levelSkip: "Belirtmek istemiyorum", start: "Tekrarı başlat", starting: "Başlatılıyor…",
            none: "En az bir koleksiyon seç.", timeLeft: "kaldı",
            caughtUpTitle: "Bugünlük her şey tamam",
            caughtUpBody: "Şu anda zamanı gelen bir şey yok. Daha sonra gel veya öne geçmek için bir kategori seç.",
            backToStudy: "Çalışmaya dön", selectAll: "Tümünü seç", clear: "Temizle",
            length: "Oturum uzunluğu", optional: "isteğe bağlı", allNew: "bugün yeni içerik",
            levels: ["beginner": "Başlangıç", "developing": "Gelişmekte",
                     "proficient": "Yetkin", "advanced": "İleri"],
            dueToday: { "bugün \($0) tekrar" },
            dueElsewhere: { "Seçmediğin koleksiyonlardaki \($0) tekrar kartı bekleyecek" },
            minutesOpt: { "\($0) dk" }, questionsOpt: { "\($0) soru" },
            newAvailable: { "\($0) yeni mevcut" }, dueCount: { "\($0) tekrar" },
            newCount: { "\($0) yeni" }, summaryCount: { "≈ \($0) soru" },
            summaryTime: { "≈ \($0) dk" },
            startsReviews: { "\($0) tekrarla başlar" }
        )
    )
}

// Student progress dashboard.

const en = {
  pageTitle: "Progress",
  summary: {
    title: "Your snapshot",
    strongest: "Strongest subject",
    focus: "Focus area",
    dueReview: "Due for review",
    mastered: "Subjects mastered",
    cardsUnit: "cards",
    subjectsUnit: "subjects",
    none: "—",
  },
  abilityLevel: {
    beginner: "Beginner",
    developing: "Developing",
    proficient: "Proficient",
    advanced: "Advanced",
  },
  insight: {
    high: "Excellent work — your accuracy is strong. Keep the momentum.",
    mid: "Solid progress. A little review will push your scores higher.",
    low: "Early days — keep practicing to build up your ability.",
  },
  stats: {
    ability: "Ability (θ)",
    answered: "Answered",
    correct: "Correct",
    accuracy: "Accuracy",
  },
  topics: {
    title: "By subject",
    empty: "No subject activity yet.",
    questions: "questions",
  },
  sessions: {
    title: "Recent sessions",
    empty: "No sessions yet.",
    score: "Score",
    net: "Net",
  },
  mastery: {
    not_started: "Not started",
    needs_review: "Needs review",
    developing: "Developing",
    proficient: "Proficient",
    mastered: "Mastered",
  },
  sessionType: {
    adaptive_practice: "Practice",
    review: "Review",
  },
  empty: "No activity yet — take a practice session to see your progress.",
  loading: "Loading…",
};

export type DashProgressDict = typeof en;

const tr: DashProgressDict = {
  pageTitle: "İlerleme",
  summary: {
    title: "Durumun",
    strongest: "En güçlü ders",
    focus: "Odaklanılacak alan",
    dueReview: "Tekrar zamanı",
    mastered: "Uzmanlaşılan dersler",
    cardsUnit: "kart",
    subjectsUnit: "ders",
    none: "—",
  },
  abilityLevel: {
    beginner: "Başlangıç",
    developing: "Gelişiyor",
    proficient: "Yetkin",
    advanced: "İleri",
  },
  insight: {
    high: "Harika gidiyorsun — doğruluğun yüksek. Bu tempoyu koru.",
    mid: "İyi ilerleme. Biraz tekrar puanlarını daha da yükseltecek.",
    low: "Henüz başlangıçtasın — yeteneğini geliştirmek için pratik yapmaya devam et.",
  },
  stats: {
    ability: "Yetenek (θ)",
    answered: "Yanıtlanan",
    correct: "Doğru",
    accuracy: "Doğruluk",
  },
  topics: {
    title: "Derslere göre",
    empty: "Henüz ders etkinliği yok.",
    questions: "soru",
  },
  sessions: {
    title: "Son oturumlar",
    empty: "Henüz oturum yok.",
    score: "Puan",
    net: "Net",
  },
  mastery: {
    not_started: "Başlanmadı",
    needs_review: "Tekrar gerekli",
    developing: "Gelişiyor",
    proficient: "Yetkin",
    mastered: "Uzman",
  },
  sessionType: {
    adaptive_practice: "Alıştırma",
    review: "Tekrar",
  },
  empty: "Henüz etkinlik yok — ilerlemeni görmek için bir alıştırma oturumu yap.",
  loading: "Yükleniyor…",
};

export const dashProgress = { en, tr };

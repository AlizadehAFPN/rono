// Student home dashboard — personal snapshot landing page.

const en = {
  title: "Dashboard",
  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    fallbackName: "there",
  },
  subtitle: "Here's your learning at a glance.",
  loading: "Loading your dashboard…",
  empty: {
    title: "Welcome to Rono",
    body: "Study a category to start building your progress — it will show up here.",
    cta: "Browse categories",
  },
  levels: {
    beginner: "Beginner",
    developing: "Developing",
    proficient: "Proficient",
    advanced: "Advanced",
  },
  stats: {
    ability: "Ability",
    accuracy: "Accuracy",
    answered: "Answered",
    streak: "Day streak",
  },
  due: {
    title: "Review queue",
    dueNow: "due now",
    none: "You're all caught up — nothing due right now.",
    caughtUp: "All caught up",
    cta: "Start review",
    learning: "Learning",
    review: "In review",
  },
  library: {
    title: "Question bank",
    seen: "Seen",
    newLabel: "New",
    coverage: "Coverage",
  },
  mastery: {
    title: "Subject mastery",
    masteredOf: (m: number, total: number) => `${m} of ${total} subjects mastered`,
    strongest: "Strongest",
    focus: "Focus area",
    levels: {
      not_started: "Not started",
      needs_review: "Needs review",
      developing: "Developing",
      proficient: "Proficient",
      mastered: "Mastered",
    },
  },
  activity: {
    title: "Last 14 days",
    empty: "No activity yet.",
    questions: "questions",
  },
  trend: {
    title: "Ability trend",
    notEnough: "Answer a few more questions to see your trend.",
  },
  actions: {
    title: "Quick actions",
    study: "Continue studying",
    exam: "Take an exam",
    progress: "Detailed progress",
    dailyStudy: "Daily Study",
    dailySub: "Spaced-repetition review",
    progressTitle: "Progress",
    progressSub: "Trends, mastery & history",
  },
  sessions: {
    title: "Recent sessions",
    empty: "No sessions yet.",
    types: {
      adaptive_practice: "Practice",
      review: "Review",
      exam: "Exam",
    },
  },
};

export type DashHomeDict = typeof en;

const tr: DashHomeDict = {
  title: "Panel",
  greeting: {
    morning: "Günaydın",
    afternoon: "İyi günler",
    evening: "İyi akşamlar",
    fallbackName: "merhaba",
  },
  subtitle: "Öğrenmene genel bir bakış.",
  loading: "Panelin yükleniyor…",
  empty: {
    title: "Rono'e hoş geldin",
    body: "İlerlemeni oluşturmak için bir kategori çalış — burada görünecek.",
    cta: "Kategorilere göz at",
  },
  levels: {
    beginner: "Başlangıç",
    developing: "Gelişiyor",
    proficient: "Yetkin",
    advanced: "İleri",
  },
  stats: {
    ability: "Yetenek",
    accuracy: "Doğruluk",
    answered: "Yanıtlanan",
    streak: "Gün serisi",
  },
  due: {
    title: "Tekrar kuyruğu",
    dueNow: "zamanı geldi",
    none: "Her şey tamam — şu an tekrar bekleyen yok.",
    caughtUp: "Her şey tamam",
    cta: "Tekrara başla",
    learning: "Öğreniliyor",
    review: "Tekrarda",
  },
  library: {
    title: "Soru bankası",
    seen: "Görülen",
    newLabel: "Yeni",
    coverage: "Kapsam",
  },
  mastery: {
    title: "Ders uzmanlığı",
    masteredOf: (m: number, total: number) => `${total} dersten ${m} tanesinde uzman`,
    strongest: "En güçlü",
    focus: "Odak alanı",
    levels: {
      not_started: "Başlanmadı",
      needs_review: "Tekrar gerekli",
      developing: "Gelişiyor",
      proficient: "Yetkin",
      mastered: "Uzman",
    },
  },
  activity: {
    title: "Son 14 gün",
    empty: "Henüz etkinlik yok.",
    questions: "soru",
  },
  trend: {
    title: "Yetenek eğilimi",
    notEnough: "Eğilimini görmek için birkaç soru daha yanıtla.",
  },
  actions: {
    title: "Hızlı işlemler",
    study: "Çalışmaya devam et",
    exam: "Sınava gir",
    progress: "Ayrıntılı ilerleme",
    dailyStudy: "Günlük Çalışma",
    dailySub: "Aralıklı tekrar",
    progressTitle: "İlerleme",
    progressSub: "Eğilimler, uzmanlık ve geçmiş",
  },
  sessions: {
    title: "Son oturumlar",
    empty: "Henüz oturum yok.",
    types: {
      adaptive_practice: "Alıştırma",
      review: "Tekrar",
      exam: "Sınav",
    },
  },
};

export const dashHome = { en, tr };

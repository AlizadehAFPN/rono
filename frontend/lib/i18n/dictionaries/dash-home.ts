// Student home dashboard — personal snapshot landing page.

const en = {
  title: "Dashboard",
  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    fallbackName: "there",
  },
  subtitle: "Here's how your prep is going at a glance.",
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
    ability: "Readiness",
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
    title: "Readiness trend",
    notEnough: "Answer a few more questions to see your trend.",
  },
  actions: {
    title: "Quick actions",
    study: "Continue studying",
    exam: "Take an exam",
    progress: "Detailed progress",
    dailyStudy: "Daily Study",
    dailySub: "Review what's due today",
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

const fa: DashHomeDict = {
  title: "داشبورد",
  greeting: {
    morning: "صبح بخیر",
    afternoon: "ظهر بخیر",
    evening: "عصر بخیر",
    fallbackName: "دوست عزیز",
  },
  subtitle: "نگاهی کلی به روند آماده‌شدن شما.",
  loading: "در حال بارگذاری داشبورد شما…",
  empty: {
    title: "به Rono خوش آمدید",
    body: "برای شروع ساختن پیشرفت خود، یک دسته را مطالعه کنید — اینجا نمایش داده می‌شود.",
    cta: "مرور دسته‌ها",
  },
  levels: {
    beginner: "تازه‌کار",
    developing: "متوسط",
    proficient: "ماهر",
    advanced: "پیشرفته",
  },
  stats: {
    ability: "آمادگی",
    accuracy: "دقت",
    answered: "پاسخ‌داده‌شده",
    streak: "زنجیره روزانه",
  },
  due: {
    title: "صف مرور",
    dueNow: "اکنون سررسید",
    none: "همه‌چیز به‌روز است — در حال حاضر چیزی برای مرور نیست.",
    caughtUp: "همه‌چیز به‌روز است",
    cta: "شروع مرور",
    learning: "در حال یادگیری",
    review: "در حال مرور",
  },
  library: {
    title: "بانک سؤال",
    seen: "دیده‌شده",
    newLabel: "جدید",
    coverage: "پوشش",
  },
  mastery: {
    title: "تسلط بر درس",
    masteredOf: (m: number, total: number) => `تسلط بر ${m} درس از ${total} درس`,
    strongest: "قوی‌ترین",
    focus: "حوزه تمرکز",
    levels: {
      not_started: "شروع‌نشده",
      needs_review: "نیازمند مرور",
      developing: "در حال پیشرفت",
      proficient: "ماهر",
      mastered: "مسلط",
    },
  },
  activity: {
    title: "14 روز اخیر",
    empty: "هنوز فعالیتی نیست.",
    questions: "سؤال",
  },
  trend: {
    title: "روند آمادگی",
    notEnough: "برای دیدن روند خود، چند سؤال دیگر پاسخ دهید.",
  },
  actions: {
    title: "اقدامات سریع",
    study: "ادامه مطالعه",
    exam: "شرکت در آزمون",
    progress: "پیشرفت تفصیلی",
    dailyStudy: "مطالعه روزانه",
    dailySub: "مرور سؤال‌های سررسید امروز",
    progressTitle: "پیشرفت",
    progressSub: "روندها، تسلط و تاریخچه",
  },
  sessions: {
    title: "جلسات اخیر",
    empty: "هنوز جلسه‌ای نیست.",
    types: {
      adaptive_practice: "تمرین",
      review: "مرور",
      exam: "آزمون",
    },
  },
};

export const dashHome = { en, fa };

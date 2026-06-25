// Student progress dashboard.

const en = {
  pageTitle: "My readiness",
  summary: {
    title: "Your snapshot",
    strongest: "Strongest subject",
    focus: "Focus area",
    dueReview: "Due for review",
    mastered: "Subjects you've nailed",
    cardsUnit: "questions",
    subjectsUnit: "subjects",
    none: "—",
  },
  abilityLevel: {
    beginner: "Just starting",
    developing: "Getting there",
    proficient: "Confident",
    advanced: "Exam-ready",
  },
  insight: {
    high: "Excellent work — your accuracy is strong. Keep the momentum.",
    mid: "Solid progress. A little review will push your scores higher.",
    low: "Early days — keep practicing and your readiness will climb.",
  },
  stats: {
    ability: "Readiness",
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
    developing: "Getting there",
    proficient: "Confident",
    mastered: "Nailed it",
  },
  sessionType: {
    adaptive_practice: "Practice",
    review: "Review",
  },
  empty: "No activity yet — take a practice session to see your progress.",
  loading: "Loading…",
};

export type DashProgressDict = typeof en;

const fa: DashProgressDict = {
  pageTitle: "آمادگی من",
  summary: {
    title: "نمای کلی شما",
    strongest: "قوی‌ترین درس",
    focus: "حوزه تمرکز",
    dueReview: "آماده مرور",
    mastered: "درس‌هایی که مسلط شده‌اید",
    cardsUnit: "سؤال",
    subjectsUnit: "درس",
    none: "—",
  },
  abilityLevel: {
    beginner: "تازه شروع کرده",
    developing: "در حال پیشرفت",
    proficient: "مطمئن",
    advanced: "آماده آزمون",
  },
  insight: {
    high: "عالی بود — دقت شما بالاست. این روند را حفظ کنید.",
    mid: "پیشرفت خوبی دارید. کمی مرور امتیازهای شما را بالاتر می‌برد.",
    low: "هنوز در ابتدای راه هستید — به تمرین ادامه دهید تا آمادگی‌تان بالا برود.",
  },
  stats: {
    ability: "میزان آمادگی",
    answered: "پاسخ‌داده‌شده",
    correct: "درست",
    accuracy: "دقت",
  },
  topics: {
    title: "بر اساس درس",
    empty: "هنوز فعالیتی در هیچ درسی نیست.",
    questions: "سؤال",
  },
  sessions: {
    title: "جلسه‌های اخیر",
    empty: "هنوز جلسه‌ای نیست.",
    score: "امتیاز",
    net: "خالص",
  },
  mastery: {
    not_started: "شروع‌نشده",
    needs_review: "نیازمند مرور",
    developing: "در حال پیشرفت",
    proficient: "مطمئن",
    mastered: "مسلط",
  },
  sessionType: {
    adaptive_practice: "تمرین",
    review: "مرور",
  },
  empty: "هنوز فعالیتی نیست — برای دیدن پیشرفت خود یک جلسه تمرین انجام دهید.",
  loading: "در حال بارگذاری…",
};

export const dashProgress = { en, fa };

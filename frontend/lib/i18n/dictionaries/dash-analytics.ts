// Analytics & reporting dashboard.

const en = {
  pageTitle: "Analytics",
  overview: {
    items: "Questions",
    activeItems: "Active",
    responses: "Responses",
    accuracy: "Avg accuracy",
    users: "Members",
    sessions: "Sessions",
  },
  items: {
    title: "Question performance",
    subtitle: "Most-answered questions with accuracy and difficulty.",
    preview: "Question",
    exam: "Exam",
    responses: "Resp.",
    accuracy: "Accuracy",
    difficulty: "Difficulty",
    calibration: "Readiness",
    empty: "No response data yet.",
  },
  calibration: {
    uncalibrated: "Not ready",
    pre_set: "Expert-set",
    calibrating: "Getting ready",
    calibrated: "Ready",
  },
  loading: "Loading…",
};

export type DashAnalyticsDict = typeof en;

const fa: DashAnalyticsDict = {
  pageTitle: "تحلیل و آمار",
  overview: {
    items: "سؤال‌ها",
    activeItems: "فعال",
    responses: "پاسخ‌ها",
    accuracy: "میانگین دقت",
    users: "اعضا",
    sessions: "جلسه‌ها",
  },
  items: {
    title: "عملکرد سؤال‌ها",
    subtitle: "پرپاسخ‌ترین سؤال‌ها همراه با دقت و دشواری.",
    preview: "سؤال",
    exam: "آزمون",
    responses: "پاسخ",
    accuracy: "دقت",
    difficulty: "دشواری",
    calibration: "وضعیت آماده‌سازی",
    empty: "هنوز داده پاسخی نیست.",
  },
  calibration: {
    uncalibrated: "آماده‌نشده",
    pre_set: "برآورد نویسنده",
    calibrating: "در حال آماده‌سازی",
    calibrated: "آماده",
  },
  loading: "در حال بارگذاری…",
};

export const dashAnalytics = { en, fa };

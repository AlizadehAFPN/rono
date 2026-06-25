// Dashboard "Overview" page: header greeting, stat cards, charts, question-status
// legend, and the recently-added questions list.

const en = {
  greetings: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    fallbackName: "there",
  },
  // Relative time used in the recent questions list.
  relativeTime: {
    justNow: "just now",
    minutesShort: "m ago",
    hoursShort: "h ago",
    daysShort: "d ago",
  },
  header: {
    subtitle: "Question bank overview",
    newQuestion: "New question",
  },
  stats: {
    totalQuestions: "Total Questions",
    totalQuestionsSub: {
      activeSuffix: "active",
      draftSuffix: "draft",
    },
    activeQuestions: "Active Questions",
    activeQuestionsSubSuffix: "of total questions",
    draftQuestions: "Draft Questions",
    draftQuestionsSub: "Pending review & activation",
    topics: "Topics",
    topicsSub: {
      one: "topic in your bank",
      other: "topics in your bank",
    },
  },
  examBreakdown: {
    title: "Questions by Exam Type",
    viewAll: "View all",
    empty: "No questions yet.",
    unassigned: "Unassigned",
  },
  calibration: {
    title: "Question readiness",
    statuses: {
      calibrated: {
        label: "Ready",
        desc: "Tuned from candidate answers",
      },
      pre_set: {
        label: "Author set",
        desc: "Difficulty set by authors",
      },
      calibrating: {
        label: "Getting ready",
        desc: "Collecting answers",
      },
      uncalibrated: {
        label: "Not ready yet",
        desc: "Waiting for first answers",
      },
    },
  },
  recent: {
    title: "Recently Added",
    allQuestions: "All questions",
    emptyTitle: "No questions yet",
    emptyDescription: "Create your first question to get started.",
    newQuestion: "New question",
    noContent: "(no content)",
    noExamType: "No exam type",
  },
  // Localized question status labels (Draft/Active/Retired) shown in the list,
  // mirroring STATUS_LABELS from lib/types/items.ts.
  status: {
    draft: "Draft",
    active: "Active",
    retired: "Retired",
  },
};

export type DashOverviewDict = typeof en;

const fa: DashOverviewDict = {
  greetings: {
    morning: "صبح بخیر",
    afternoon: "ظهر بخیر",
    evening: "عصر بخیر",
    fallbackName: "دوست عزیز",
  },
  relativeTime: {
    justNow: "همین حالا",
    minutesShort: " دقیقه پیش",
    hoursShort: " ساعت پیش",
    daysShort: " روز پیش",
  },
  header: {
    subtitle: "نمای کلی بانک سؤال",
    newQuestion: "سؤال جدید",
  },
  stats: {
    totalQuestions: "کل سؤال‌ها",
    totalQuestionsSub: {
      activeSuffix: "فعال",
      draftSuffix: "پیش‌نویس",
    },
    activeQuestions: "سؤال‌های فعال",
    activeQuestionsSubSuffix: "از کل سؤال‌ها",
    draftQuestions: "سؤال‌های پیش‌نویس",
    draftQuestionsSub: "در انتظار بررسی و فعال‌سازی",
    topics: "مباحث",
    topicsSub: {
      one: "مبحث در بانک شما",
      other: "مبحث در بانک شما",
    },
  },
  examBreakdown: {
    title: "سؤال‌ها بر اساس نوع آزمون",
    viewAll: "مشاهده همه",
    empty: "هنوز سؤالی نیست.",
    unassigned: "تخصیص‌نیافته",
  },
  calibration: {
    title: "وضعیت آماده‌سازی سؤال",
    statuses: {
      calibrated: {
        label: "آماده",
        desc: "بر اساس پاسخ داوطلب‌ها تنظیم شده",
      },
      pre_set: {
        label: "تنظیم‌شده توسط نویسنده",
        desc: "دشواری تعیین‌شده توسط نویسندگان",
      },
      calibrating: {
        label: "در حال آماده‌سازی",
        desc: "در حال جمع‌آوری پاسخ‌ها",
      },
      uncalibrated: {
        label: "هنوز آماده نیست",
        desc: "در انتظار نخستین پاسخ‌ها",
      },
    },
  },
  recent: {
    title: "اخیراً افزوده‌شده",
    allQuestions: "همه سؤال‌ها",
    emptyTitle: "هنوز سؤالی نیست",
    emptyDescription: "برای شروع، نخستین سؤال خود را ایجاد کنید.",
    newQuestion: "سؤال جدید",
    noContent: "(بدون محتوا)",
    noExamType: "بدون نوع آزمون",
  },
  status: {
    draft: "پیش‌نویس",
    active: "فعال",
    retired: "بازنشسته",
  },
};

export const dashOverview = { en, fa };

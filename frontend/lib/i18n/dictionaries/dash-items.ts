// Dashboard Questions / Items list page: header, filters, table, row actions,
// pagination, empty / loading / error states, and the delete confirmation dialog.

const en = {
  topbarTitle: "Questions",
  header: {
    title: "Question Bank",
    // Interpolated as `${total} ${countSuffix}` where countSuffix is singular
    // or plural depending on the total.
    countSuffixOne: "question total",
    countSuffixMany: "questions total",
    newQuestion: "New question",
  },
  filters: {
    allExamTypes: "All exam types",
  },
  tabs: {
    all: "All",
    active: "Active",
    draft: "Draft",
    retired: "Retired",
  },
  status: {
    draft: "Draft",
    active: "Active",
    retired: "Retired",
  },
  difficulty: {
    veryEasy: "Very Easy",
    easy: "Easy",
    average: "Average",
    hard: "Hard",
    veryHard: "Very Hard",
  },
  columns: {
    question: "Question",
    correctAnswer: "Correct Answer",
    options: "Options",
    examType: "Exam Type",
    dateAdded: "Date Added",
    status: "Status",
  },
  rowActions: {
    edit: "Edit",
    delete: "Delete",
  },
  empty: {
    titleAll: "No questions yet",
    // Interpolated as `${titleFilteredPrefix} ${statusLabel} ${titleFilteredSuffix}`
    titleFilteredPrefix: "No",
    titleFilteredSuffix: "questions",
    descriptionAll: "Create your first question to build your question bank.",
    // Interpolated as `${descriptionFilteredPrefix} "${statusLabel}" ${descriptionFilteredSuffix}`
    descriptionFilteredPrefix: "No questions with status",
    descriptionFilteredSuffix: "match your filters.",
    newQuestion: "New question",
  },
  error: {
    loadFailed: "Failed to load questions. Please refresh.",
  },
  pagination: {
    // Interpolated as `${pagePrefix} ${current} ${pageOf} ${total} · ${totalCount} ${pageTotalSuffix}`
    pagePrefix: "Page",
    pageOf: "of",
    pageTotalSuffix: "total",
    previous: "Previous",
    next: "Next",
  },
  deleteDialog: {
    title: "Delete question",
    description:
      "This question and all its versions will be permanently deleted. This cannot be undone.",
    cancel: "Cancel",
    delete: "Delete",
    deleting: "Deleting…",
  },
  toast: {
    deleted: "Question deleted",
    deleteFailedTitle: "Delete failed",
    deleteFailedDescription: "The question could not be deleted.",
  },
  empty_em_dash: "—",
};

export type DashItemsDict = typeof en;

const fa: DashItemsDict = {
  topbarTitle: "سؤال‌ها",
  header: {
    title: "بانک سؤال",
    countSuffixOne: "سؤال در مجموع",
    countSuffixMany: "سؤال در مجموع",
    newQuestion: "سؤال جدید",
  },
  filters: {
    allExamTypes: "همه انواع آزمون",
  },
  tabs: {
    all: "همه",
    active: "فعال",
    draft: "پیش‌نویس",
    retired: "بازنشسته",
  },
  status: {
    draft: "پیش‌نویس",
    active: "فعال",
    retired: "بازنشسته",
  },
  difficulty: {
    veryEasy: "خیلی آسان",
    easy: "آسان",
    average: "متوسط",
    hard: "دشوار",
    veryHard: "خیلی دشوار",
  },
  columns: {
    question: "سؤال",
    correctAnswer: "پاسخ درست",
    options: "گزینه‌ها",
    examType: "نوع آزمون",
    dateAdded: "تاریخ افزودن",
    status: "وضعیت",
  },
  rowActions: {
    edit: "ویرایش",
    delete: "حذف",
  },
  empty: {
    titleAll: "هنوز سؤالی نیست",
    titleFilteredPrefix: "بدون",
    titleFilteredSuffix: "سؤال",
    descriptionAll: "برای ساختن بانک سؤال خود، نخستین سؤالتان را ایجاد کنید.",
    descriptionFilteredPrefix: "هیچ سؤالی با وضعیت",
    descriptionFilteredSuffix: "با فیلترهای شما مطابقت ندارد.",
    newQuestion: "سؤال جدید",
  },
  error: {
    loadFailed: "بارگذاری سؤال‌ها ناموفق بود. لطفاً صفحه را تازه‌سازی کنید.",
  },
  pagination: {
    pagePrefix: "صفحه",
    pageOf: "از",
    pageTotalSuffix: "در مجموع",
    previous: "قبلی",
    next: "بعدی",
  },
  deleteDialog: {
    title: "حذف سؤال",
    description:
      "این سؤال و همه نسخه‌های آن برای همیشه حذف خواهد شد. این عمل قابل بازگشت نیست.",
    cancel: "لغو",
    delete: "حذف",
    deleting: "در حال حذف…",
  },
  toast: {
    deleted: "سؤال حذف شد",
    deleteFailedTitle: "حذف ناموفق بود",
    deleteFailedDescription: "سؤال حذف نشد.",
  },
  empty_em_dash: "—",
};

export const dashItems = { en, fa };

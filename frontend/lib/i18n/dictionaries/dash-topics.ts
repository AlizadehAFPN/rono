// Dashboard Topics page: topic taxonomy tree, create/edit sheet, delete dialog.

const en = {
  topbarTitle: "Topics",
  header: {
    title: "Topic Taxonomy",
    // Rendered as: 4-level hierarchy — Exam → Subject → Domain → Sub-domain
    subtitlePrefix: "4-level hierarchy —",
    newTopic: "New Topic",
  },
  levels: {
    exam: {
      label: "Exam",
      sublabel: "Level 1",
      hint: "e.g. USMLE Step 1, TUS",
    },
    subject: {
      label: "Subject",
      sublabel: "Level 2",
      hint: "e.g. Basic Sciences",
    },
    domain: {
      label: "Domain",
      sublabel: "Level 3",
      hint: "e.g. Cardiology",
    },
    subdomain: {
      label: "Sub-domain",
      sublabel: "Level 4",
      hint: "e.g. Arrhythmias",
    },
  },
  stats: {
    totalTopics: "Total Topics",
    exams: "Exams",
    subjects: "Subjects",
    domains: "Domains",
    subdomains: "Sub-domains",
  },
  search: {
    placeholder: "Search topics by name or slug…",
    clear: "Clear search",
  },
  badges: {
    inactive: "Inactive",
    global: "Global",
    exam: "EXAM",
  },
  // Rendered as: "{n} subject" / "{n} subjects" under an exam row
  subjectUnit: "subject",
  subjectUnitPlural: "subjects",
  node: {
    addChild: "Add", // prefix, joined with the child level label, e.g. "Add Subject"
    edit: "Edit",
    delete: "Delete",
    collapse: "Collapse",
    expand: "Expand",
  },
  error: {
    loadFailed: "Failed to load topics. Please refresh.",
  },
  empty: {
    title: "No topics yet",
    description: "Start by creating your first exam (e.g. USMLE Step 1).",
    createFirstExam: "Create first exam",
  },
  delete: {
    title: "Delete topic",
    // Rendered around the quoted topic name:
    confirmPrefix: "Are you sure you want to permanently delete",
    confirmSuffix: "? This cannot be undone.",
    // Child warning, rendered as: "This topic has {n} child topic(s). Delete all children first."
    childWarningPrefix: "This topic has",
    childTopicUnit: "child topic",
    childTopicUnitPlural: "child topics",
    childWarningSuffix: ". Delete all children first.",
    confirmButton: "Delete topic",
    deleting: "Deleting…",
    toastDeleted: "Topic deleted",
    toastCannotTitle: "Cannot delete",
    toastCannotDescription: "This topic may have children or linked questions.",
  },
  sheet: {
    titleNew: "New Topic",
    titleEdit: "Edit Topic",
    // Edit description, rendered as: "Editing {level} · {slug}"
    descriptionEditPrefix: "Editing",
    descriptionCreate:
      "Choose the hierarchy level, fill in the details, then save.",
    hierarchyLevel: "Hierarchy Level",
    // Rendered as: "Hint: {hint}"
    hintPrefix: "Hint:",
    editContextUnder: "under",
    placeInHierarchy: "Place in hierarchy",
    detailsEdit: "Details",
    detailsCreate: "Topic details",
    parentExamLabel: "Parent Exam",
    parentSubjectLabel: "Parent Subject",
    parentDomainLabel: "Parent Domain",
    parentExamPlaceholder: "Select an exam…",
    parentExamEmpty: "No exams yet. Create one first.",
    parentSubjectPlaceholderDisabled: "Select an exam first",
    parentSubjectPlaceholder: "Select a subject…",
    parentSubjectEmpty: "No subjects under this exam yet.",
    parentDomainPlaceholderDisabled: "Select a subject first",
    parentDomainPlaceholder: "Select a domain…",
    parentDomainEmpty: "No domains under this subject yet.",
    nameLabel: "Name",
    slugLabel: "Slug",
    slugPlaceholder: "auto-generated",
    slugDescription: "Auto-generated from name · URL-safe",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Optional description…",
    displayOrderLabel: "Display Order",
    displayOrderDescription:
      "Lower numbers appear first within the same parent.",
    activeLabel: "Active",
    activeDescription: "Inactive topics are hidden from learners.",
    saving: "Saving…",
    saveChanges: "Save changes",
    createPrefix: "Create", // joined with the level label, e.g. "Create Exam"
    toastUpdated: "Topic updated",
    toastCreatedSuffix: "created", // joined as "{level} created"
    toastErrorTitle: "Error",
    toastErrorGeneric: "Something went wrong",
  },
  validation: {
    nameRequired: "Name is required",
    slugRequired: "Slug is required",
    slugFormat: "Lowercase, numbers and hyphens only",
  },
};

export type DashTopicsDict = typeof en;

const fa: DashTopicsDict = {
  topbarTitle: "مباحث",
  header: {
    title: "دسته‌بندی مباحث",
    subtitlePrefix: "سلسله‌مراتب 4 سطحی —",
    newTopic: "مبحث جدید",
  },
  levels: {
    exam: {
      label: "آزمون",
      sublabel: "سطح 1",
      hint: "مثلاً USMLE Step 1, TUS",
    },
    subject: {
      label: "درس",
      sublabel: "سطح 2",
      hint: "مثلاً علوم پایه",
    },
    domain: {
      label: "حوزه",
      sublabel: "سطح 3",
      hint: "مثلاً قلب و عروق",
    },
    subdomain: {
      label: "زیرحوزه",
      sublabel: "سطح 4",
      hint: "مثلاً آریتمی‌ها",
    },
  },
  stats: {
    totalTopics: "کل مباحث",
    exams: "آزمون‌ها",
    subjects: "درس‌ها",
    domains: "حوزه‌ها",
    subdomains: "زیرحوزه‌ها",
  },
  search: {
    placeholder: "جستجوی مباحث بر اساس نام یا اسلاگ…",
    clear: "پاک کردن جستجو",
  },
  badges: {
    inactive: "غیرفعال",
    global: "سراسری",
    exam: "آزمون",
  },
  subjectUnit: "درس",
  subjectUnitPlural: "درس",
  node: {
    addChild: "افزودن",
    edit: "ویرایش",
    delete: "حذف",
    collapse: "بستن",
    expand: "باز کردن",
  },
  error: {
    loadFailed: "بارگذاری مباحث ناموفق بود. لطفاً صفحه را تازه‌سازی کنید.",
  },
  empty: {
    title: "هنوز مبحثی وجود ندارد",
    description: "با ایجاد اولین آزمون خود شروع کنید (مثلاً USMLE Step 1).",
    createFirstExam: "ایجاد اولین آزمون",
  },
  delete: {
    title: "حذف مبحث",
    confirmPrefix: "آیا مطمئن هستید که می‌خواهید برای همیشه این مورد را حذف کنید",
    confirmSuffix: "؟ این عمل قابل بازگشت نیست.",
    childWarningPrefix: "این مبحث دارای",
    childTopicUnit: "زیرمبحث",
    childTopicUnitPlural: "زیرمبحث",
    childWarningSuffix: " است. ابتدا تمام زیرمباحث را حذف کنید.",
    confirmButton: "حذف مبحث",
    deleting: "در حال حذف…",
    toastDeleted: "مبحث حذف شد",
    toastCannotTitle: "امکان حذف وجود ندارد",
    toastCannotDescription: "این مبحث ممکن است زیرمبحث یا سؤال‌های مرتبط داشته باشد.",
  },
  sheet: {
    titleNew: "مبحث جدید",
    titleEdit: "ویرایش مبحث",
    descriptionEditPrefix: "در حال ویرایش",
    descriptionCreate:
      "سطح سلسله‌مراتب را انتخاب کنید، جزئیات را پر کنید، سپس ذخیره کنید.",
    hierarchyLevel: "سطح سلسله‌مراتب",
    hintPrefix: "راهنما:",
    editContextUnder: "زیرِ",
    placeInHierarchy: "جای‌گذاری در سلسله‌مراتب",
    detailsEdit: "جزئیات",
    detailsCreate: "جزئیات مبحث",
    parentExamLabel: "آزمون والد",
    parentSubjectLabel: "درس والد",
    parentDomainLabel: "حوزه والد",
    parentExamPlaceholder: "یک آزمون انتخاب کنید…",
    parentExamEmpty: "هنوز آزمونی وجود ندارد. ابتدا یکی ایجاد کنید.",
    parentSubjectPlaceholderDisabled: "ابتدا یک آزمون انتخاب کنید",
    parentSubjectPlaceholder: "یک درس انتخاب کنید…",
    parentSubjectEmpty: "هنوز درسی زیر این آزمون وجود ندارد.",
    parentDomainPlaceholderDisabled: "ابتدا یک درس انتخاب کنید",
    parentDomainPlaceholder: "یک حوزه انتخاب کنید…",
    parentDomainEmpty: "هنوز حوزه‌ای زیر این درس وجود ندارد.",
    nameLabel: "نام",
    slugLabel: "اسلاگ",
    slugPlaceholder: "تولید خودکار",
    slugDescription: "به‌طور خودکار از نام تولید می‌شود · سازگار با URL",
    descriptionLabel: "توضیح",
    descriptionPlaceholder: "توضیح اختیاری…",
    displayOrderLabel: "ترتیب نمایش",
    displayOrderDescription:
      "اعداد کوچک‌تر در میان والدِ یکسان زودتر نمایش داده می‌شوند.",
    activeLabel: "فعال",
    activeDescription: "مباحث غیرفعال از فراگیران پنهان می‌شوند.",
    saving: "در حال ذخیره…",
    saveChanges: "ذخیره تغییرات",
    createPrefix: "ایجاد",
    toastUpdated: "مبحث به‌روزرسانی شد",
    toastCreatedSuffix: "ایجاد شد",
    toastErrorTitle: "خطا",
    toastErrorGeneric: "مشکلی پیش آمد",
  },
  validation: {
    nameRequired: "نام الزامی است",
    slugRequired: "اسلاگ الزامی است",
    slugFormat: "فقط حروف کوچک، اعداد و خط تیره",
  },
};

export const dashTopics = { en, fa };

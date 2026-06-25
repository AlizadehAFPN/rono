// Question (Item) editor — shared across the "new question" page and the
// "[id]" question detail/edit page. Keys are reused wherever the English
// string is identical across the two pages.

const en = {
  // ── Page titles (Topbar) ──────────────────────────────────────────────────
  pageTitle: {
    new: "New question",
    detail: "Question detail",
    edit: "Edit question",
  },

  // ── Section / card headings ───────────────────────────────────────────────
  sections: {
    classification: "Classification",
    questionStem: "Question stem",
    answerChoices: "Answer choices",
    versionNote: "Version note",
    versionHistory: "Version history",
    metadata: "Metadata",
    difficulty: "Difficulty",
    editQuestion: "Edit question",
  },

  // ── Exam classification (exam-based, distinct from topics) ────────────────
  exam: {
    typeLabel: "Exam",
    typePlaceholder: "Select exam…",
    typeNone: "Unspecified",
    partLabel: "Exam part",
    partPlaceholder: "Select part…",
    partNone: "Unspecified",
    parts: {
      basic_sciences: "General knowledge",
      clinical_sciences: "Specialized",
    },
  },

  // ── Provenance (source of the question) ───────────────────────────────────
  provenance: {
    sectionLabel: "Source",
    sectionHint: "Where this question comes from (e.g. an official past paper).",
    sourceLabel: "Source",
    sourcePlaceholder: "e.g. ÖSYM",
    sourceRefLabel: "Reference",
    sourceRefPlaceholder: "e.g. 2013-TUS İlkbahar / TTBT",
    yearLabel: "Year",
    yearPlaceholder: "e.g. 2013",
    sessionLabel: "Session",
    sessionPlaceholder: "Select session…",
    sessionNone: "Unspecified",
    sessions: {
      spring: "Spring",
      fall: "Fall",
    },
  },

  // ── Topic cascade ─────────────────────────────────────────────────────────
  topic: {
    label: "Topic (subject)",
    hint: "Choose the subject. Optionally narrow down by domain and sub-domain — the deepest selected level is assigned to this question.",
    levels: {
      exam: "Exam",
      subject: "Subject",
      domain: "Domain",
      subdomain: "Sub-domain",
    },
    placeholders: {
      exam: "Select exam…",
      subject: "Select subject…",
      domain: "Select domain…",
      subdomain: "Select sub-domain…",
      selectExamFirst: "Select exam first",
      selectSubjectFirst: "Select subject first",
      selectDomainFirst: "Select domain first",
      noOptions: "No options yet",
    },
    examType: "Exam type:",
    noExamTypeMapping: "(no exam_type mapping)",
    noTopicAssigned: "No topic assigned",
  },

  // ── Difficulty ────────────────────────────────────────────────────────────
  difficulty: {
    label: "Difficulty",
    presetLabel: "Difficulty preset",
    hint: "Sets the starting difficulty before candidate answers come in",
    descriptionPrefix: "Default is ",
    descriptionDefault: "Average",
    descriptionSuffix:
      ". Rono fine-tunes this automatically once 30+ candidates have answered.",
    presets: {
      veryEasy: "Very Easy",
      easy: "Easy",
      average: "Average",
      hard: "Hard",
      veryHard: "Very Hard",
    },
    scale: {
      easy: "Easy",
      hard: "Hard",
    },
    fields: {
      difficultyB: "Difficulty",
      discriminationA: "How well it sorts answers",
      responsesUsed: "Answers used",
    },
  },

  // ── Question readiness status badges ──────────────────────────────────────
  calibration: {
    uncalibrated: "Not ready yet",
    pre_set: "Author estimate",
    calibrating: "Getting ready",
    calibrated: "Ready",
    awaitingCalibration: (count: number) =>
      `Getting ready · ${count} answer${
        count !== 1 ? "s" : ""
      } collected`,
    expertPreset: (label: string, b: string) =>
      `${label} — author estimate (difficulty ${b})`,
    calibratingProgress: (count: number, current: string | null) =>
      `Getting ready · ${count} answer${count !== 1 ? "s" : ""}${
        current != null ? ` · current difficulty ${current}` : ""
      }`,
  },

  // ── Question stem fields ──────────────────────────────────────────────────
  stem: {
    placeholder: "Type the question here…",
    placeholderEdit: "Enter the question text…",
  },

  // ── Explanation fields ────────────────────────────────────────────────────
  explanation: {
    overallLabel: "Overall explanation",
    label: "Explanation",
    optional: "(optional)",
    placeholder: "Explain the correct approach…",
    placeholderEdit: "Explain the correct answer…",
  },

  // ── Answer choices ────────────────────────────────────────────────────────
  options: {
    hint: "Click the circle to mark the correct answer",
    addOption: "Add option",
    removeOption: "Remove option",
    correctAnswer: "Correct answer",
    markAsCorrect: "Mark as correct",
    correct: "Correct",
    optionPlaceholder: (label: string | number) => `Option ${label}`,
    contentPlaceholder: "Answer option text…",
    optionExplanationPlaceholder: "Option-level explanation (optional)",
    optionExplanationPlaceholderEdit: "Explanation for this option (optional)…",
  },

  // ── Version note ──────────────────────────────────────────────────────────
  versionNote: {
    label: "Version note",
    optional: "(optional)",
    placeholder: "Initial version",
    description: "Describe what changed in this version for version history",
  },

  // ── Version history ───────────────────────────────────────────────────────
  versions: {
    published: "Published",
  },

  // ── Metadata sidebar ──────────────────────────────────────────────────────
  metadata: {
    status: "Status",
    classification: "Classification",
    examType: "Exam type",
    type: "Type",
    created: "Created",
  },

  // ── View card empty state ─────────────────────────────────────────────────
  view: {
    noContent: "No content yet.",
    addContent: "Add content",
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  buttons: {
    cancel: "Cancel",
    createQuestion: "Create question",
    creating: "Creating…",
    editQuestion: "Edit question",
    saveChanges: "Save changes",
    saving: "Saving…",
    deleteQuestion: "Delete question",
    delete: "Delete",
    deleting: "Deleting…",
    backToQuestions: "Questions",
  },

  // ── Delete confirmation dialog ────────────────────────────────────────────
  deleteDialog: {
    title: "Delete question",
    body: "This question and all its versions will be permanently deleted.",
  },

  // ── Loading / error states ────────────────────────────────────────────────
  states: {
    loadError: "Question not found or failed to load.",
  },

  // ── Toast messages ────────────────────────────────────────────────────────
  toast: {
    created: "Question created",
    createFailed: "Failed to create question",
    saved: "Question saved",
    saveFailed: "Failed to save question",
    statusUpdated: "Status updated",
    updateFailed: "Update failed",
    deleted: "Question deleted",
    deleteFailed: "Delete failed",
    error: "Error",
  },

  // ── Validation messages (zod) ─────────────────────────────────────────────
  validation: {
    keyRequired: "Key is required",
    optionTextRequired: "Option text is required",
    topicRequired: "Select a subject to assign this question",
    stemMin: "Question stem must be at least 10 characters",
    optionsMin: "At least 2 options are required",
    optionsMax: "Maximum 6 options allowed",
    atLeastOneCorrect: "At least one option must be marked as correct",
    atLeastOneCorrectShort: "At least one option must be correct",
    yearInvalid: "Enter a 4-digit year",
  },
};

export type DashItemEditorDict = typeof en;

const fa: DashItemEditorDict = {
  // ── Sayfa başlıkları (Topbar) ─────────────────────────────────────────────
  pageTitle: {
    new: "سؤال جدید",
    detail: "جزئیات سؤال",
    edit: "ویرایش سؤال",
  },

  // ── Bölüm / kart başlıkları ───────────────────────────────────────────────
  sections: {
    classification: "طبقه‌بندی",
    questionStem: "متن اصلی سؤال",
    answerChoices: "گزینه‌های پاسخ",
    versionNote: "یادداشت نسخه",
    versionHistory: "تاریخچه نسخه‌ها",
    metadata: "فراداده",
    difficulty: "دشواری",
    editQuestion: "ویرایش سؤال",
  },

  // ── Sınav sınıflandırması (konudan ayrı, sınav temelli) ───────────────────
  exam: {
    typeLabel: "آزمون",
    typePlaceholder: "انتخاب آزمون…",
    typeNone: "نامشخص",
    partLabel: "بخش آزمون",
    partPlaceholder: "انتخاب بخش…",
    partNone: "نامشخص",
    parts: {
      basic_sciences: "عمومی",
      clinical_sciences: "تخصصی",
    },
  },

  // ── Kaynak (sorunun kaynağı) ──────────────────────────────────────────────
  provenance: {
    sectionLabel: "منبع",
    sectionHint: "این سؤال از کجا آمده است (مثلاً یک آزمون رسمی پیشین).",
    sourceLabel: "منبع",
    sourcePlaceholder: "مثلاً ÖSYM",
    sourceRefLabel: "مرجع",
    sourceRefPlaceholder: "مثلاً 2013-TUS İlkbahar / TTBT",
    yearLabel: "سال",
    yearPlaceholder: "مثلاً 2013",
    sessionLabel: "نوبت",
    sessionPlaceholder: "انتخاب نوبت…",
    sessionNone: "نامشخص",
    sessions: {
      spring: "بهار",
      fall: "پاییز",
    },
  },

  // ── Konu kademeleri ───────────────────────────────────────────────────────
  topic: {
    label: "مبحث (درس)",
    hint: "درس را انتخاب کنید. در صورت تمایل با حوزه و زیرحوزه محدودتر کنید — عمیق‌ترین سطح انتخاب‌شده به این سؤال اختصاص می‌یابد.",
    levels: {
      exam: "آزمون",
      subject: "درس",
      domain: "حوزه",
      subdomain: "زیرحوزه",
    },
    placeholders: {
      exam: "انتخاب آزمون…",
      subject: "انتخاب درس…",
      domain: "انتخاب حوزه…",
      subdomain: "انتخاب زیرحوزه…",
      selectExamFirst: "ابتدا آزمون را انتخاب کنید",
      selectSubjectFirst: "ابتدا درس را انتخاب کنید",
      selectDomainFirst: "ابتدا حوزه را انتخاب کنید",
      noOptions: "هنوز گزینه‌ای نیست",
    },
    examType: "نوع آزمون:",
    noExamTypeMapping: "(نگاشت exam_type وجود ندارد)",
    noTopicAssigned: "مبحثی اختصاص داده نشده است",
  },

  // ── دشواری ────────────────────────────────────────────────────────────────
  difficulty: {
    label: "دشواری",
    presetLabel: "پیش‌تنظیم دشواری",
    hint: "دشواری اولیه سؤال را پیش از رسیدن پاسخ داوطلب‌ها تعیین می‌کند",
    descriptionPrefix: "مقدار پیش‌فرض ",
    descriptionDefault: "متوسط",
    descriptionSuffix:
      " است. رونو این مقدار را پس از پاسخ بیش از 30 داوطلب به‌طور خودکار دقیق‌تر می‌کند.",
    presets: {
      veryEasy: "بسیار آسان",
      easy: "آسان",
      average: "متوسط",
      hard: "دشوار",
      veryHard: "بسیار دشوار",
    },
    scale: {
      easy: "آسان",
      hard: "دشوار",
    },
    fields: {
      difficultyB: "دشواری",
      discriminationA: "میزان تشخیص",
      responsesUsed: "پاسخ‌های استفاده‌شده",
    },
  },

  // ── نشان‌های وضعیت آماده‌سازی سؤال ─────────────────────────────────────────
  calibration: {
    uncalibrated: "هنوز آماده نیست",
    pre_set: "برآورد نویسنده",
    calibrating: "در حال آماده‌سازی",
    calibrated: "آماده",
    awaitingCalibration: (count: number) =>
      `در حال آماده‌سازی · ${count} پاسخ جمع‌آوری شد`,
    expertPreset: (label: string, b: string) =>
      `${label} — برآورد نویسنده (دشواری ${b})`,
    calibratingProgress: (count: number, current: string | null) =>
      `در حال آماده‌سازی · ${count} پاسخ${
        current != null ? ` · دشواری کنونی ${current}` : ""
      }`,
  },

  // ── Soru kökü alanları ────────────────────────────────────────────────────
  stem: {
    placeholder: "متن سؤال را اینجا بنویس…",
    placeholderEdit: "متن سؤال را وارد کنید…",
  },

  // ── Açıklama alanları ─────────────────────────────────────────────────────
  explanation: {
    overallLabel: "توضیح کلی",
    label: "توضیح",
    optional: "(اختیاری)",
    placeholder: "رویکرد درست را توضیح دهید…",
    placeholderEdit: "پاسخ درست را توضیح دهید…",
  },

  // ── Yanıt seçenekleri ─────────────────────────────────────────────────────
  options: {
    hint: "برای علامت‌گذاری پاسخ درست روی دایره کلیک کنید",
    addOption: "افزودن گزینه",
    removeOption: "حذف گزینه",
    correctAnswer: "پاسخ درست",
    markAsCorrect: "علامت‌گذاری به‌عنوان درست",
    correct: "درست",
    optionPlaceholder: (label: string | number) => `گزینه ${label}`,
    contentPlaceholder: "متن گزینه پاسخ…",
    optionExplanationPlaceholder: "توضیح در سطح گزینه (اختیاری)",
    optionExplanationPlaceholderEdit: "توضیح برای این گزینه (اختیاری)…",
  },

  // ── Sürüm notu ────────────────────────────────────────────────────────────
  versionNote: {
    label: "یادداشت نسخه",
    optional: "(اختیاری)",
    placeholder: "نسخه اولیه",
    description: "برای تاریخچه نسخه‌ها توضیح دهید در این نسخه چه چیزی تغییر کرده است",
  },

  // ── Sürüm geçmişi ─────────────────────────────────────────────────────────
  versions: {
    published: "منتشرشده",
  },

  // ── Üst veriler kenar çubuğu ──────────────────────────────────────────────
  metadata: {
    status: "وضعیت",
    classification: "طبقه‌بندی",
    examType: "نوع آزمون",
    type: "نوع",
    created: "ایجادشده",
  },

  // ── Görüntüleme kartı boş durumu ──────────────────────────────────────────
  view: {
    noContent: "هنوز محتوایی نیست.",
    addContent: "افزودن محتوا",
  },

  // ── Düğmeler ──────────────────────────────────────────────────────────────
  buttons: {
    cancel: "لغو",
    createQuestion: "ایجاد سؤال",
    creating: "در حال ایجاد…",
    editQuestion: "ویرایش سؤال",
    saveChanges: "ذخیره تغییرات",
    saving: "در حال ذخیره…",
    deleteQuestion: "حذف سؤال",
    delete: "حذف",
    deleting: "در حال حذف…",
    backToQuestions: "سؤالات",
  },

  // ── Silme onay penceresi ──────────────────────────────────────────────────
  deleteDialog: {
    title: "حذف سؤال",
    body: "این سؤال و تمام نسخه‌های آن برای همیشه حذف خواهند شد.",
  },

  // ── Yükleme / hata durumları ──────────────────────────────────────────────
  states: {
    loadError: "سؤال یافت نشد یا بارگذاری آن ناموفق بود.",
  },

  // ── Bildirim mesajları ────────────────────────────────────────────────────
  toast: {
    created: "سؤال ایجاد شد",
    createFailed: "ایجاد سؤال ناموفق بود",
    saved: "سؤال ذخیره شد",
    saveFailed: "ذخیره سؤال ناموفق بود",
    statusUpdated: "وضعیت به‌روزرسانی شد",
    updateFailed: "به‌روزرسانی ناموفق بود",
    deleted: "سؤال حذف شد",
    deleteFailed: "حذف ناموفق بود",
    error: "خطا",
  },

  // ── Doğrulama mesajları (zod) ─────────────────────────────────────────────
  validation: {
    keyRequired: "کلید الزامی است",
    optionTextRequired: "متن گزینه الزامی است",
    topicRequired: "برای اختصاص این سؤال یک درس انتخاب کنید",
    stemMin: "متن اصلی سؤال باید حداقل 10 نویسه باشد",
    optionsMin: "حداقل 2 گزینه لازم است",
    optionsMax: "حداکثر 6 گزینه مجاز است",
    atLeastOneCorrect: "حداقل یک گزینه باید به‌عنوان درست علامت‌گذاری شود",
    atLeastOneCorrectShort: "حداقل یک گزینه باید درست باشد",
    yearInvalid: "یک سال 4 رقمی وارد کنید",
  },
};

export const dashItemEditor = { en, fa };

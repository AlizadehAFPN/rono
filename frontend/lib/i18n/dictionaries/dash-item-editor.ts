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
      basic_sciences: "Basic Sciences",
      clinical_sciences: "Clinical Sciences",
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
    hint: "Sets the initial IRT difficulty (b) before calibration data is collected",
    descriptionPrefix: "Default is ",
    descriptionDefault: "Average",
    descriptionSuffix:
      ". IRT calibration will refine this automatically after 30+ student responses.",
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
      difficultyB: "Difficulty (b)",
      discriminationA: "Discrimination (a)",
      responsesUsed: "Responses used",
    },
  },

  // ── Calibration status badges ─────────────────────────────────────────────
  calibration: {
    uncalibrated: "Uncalibrated",
    pre_set: "Expert estimate",
    calibrating: "Calibrating",
    calibrated: "IRT calibrated",
    awaitingCalibration: (count: number) =>
      `Awaiting calibration · ${count} response${
        count !== 1 ? "s" : ""
      } collected`,
    expertPreset: (label: string, b: string) =>
      `${label} — expert preset (b = ${b})`,
    calibratingProgress: (count: number, current: string | null) =>
      `Calibrating in progress · ${count} response${count !== 1 ? "s" : ""}${
        current != null ? ` · current b = ${current}` : ""
      }`,
  },

  // ── Question stem fields ──────────────────────────────────────────────────
  stem: {
    placeholder: "A 45-year-old male presents with…",
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

const tr: DashItemEditorDict = {
  // ── Sayfa başlıkları (Topbar) ─────────────────────────────────────────────
  pageTitle: {
    new: "Yeni soru",
    detail: "Soru ayrıntısı",
    edit: "Soruyu düzenle",
  },

  // ── Bölüm / kart başlıkları ───────────────────────────────────────────────
  sections: {
    classification: "Sınıflandırma",
    questionStem: "Soru kökü",
    answerChoices: "Yanıt seçenekleri",
    versionNote: "Sürüm notu",
    versionHistory: "Sürüm geçmişi",
    metadata: "Üst veriler",
    difficulty: "Zorluk",
    editQuestion: "Soruyu düzenle",
  },

  // ── Sınav sınıflandırması (konudan ayrı, sınav temelli) ───────────────────
  exam: {
    typeLabel: "Sınav",
    typePlaceholder: "Sınav seçin…",
    typeNone: "Belirtilmemiş",
    partLabel: "Sınav bölümü",
    partPlaceholder: "Bölüm seçin…",
    partNone: "Belirtilmemiş",
    parts: {
      basic_sciences: "Temel Tıp Bilimleri",
      clinical_sciences: "Klinik Tıp Bilimleri",
    },
  },

  // ── Kaynak (sorunun kaynağı) ──────────────────────────────────────────────
  provenance: {
    sectionLabel: "Kaynak",
    sectionHint: "Bu sorunun kaynağı (örn. resmî bir çıkmış sınav).",
    sourceLabel: "Kaynak",
    sourcePlaceholder: "örn. ÖSYM",
    sourceRefLabel: "Referans",
    sourceRefPlaceholder: "örn. 2013-TUS İlkbahar / TTBT",
    yearLabel: "Yıl",
    yearPlaceholder: "örn. 2013",
    sessionLabel: "Dönem",
    sessionPlaceholder: "Dönem seçin…",
    sessionNone: "Belirtilmemiş",
    sessions: {
      spring: "İlkbahar",
      fall: "Sonbahar",
    },
  },

  // ── Konu kademeleri ───────────────────────────────────────────────────────
  topic: {
    label: "Konu (ders)",
    hint: "Dersi seçin. İsteğe bağlı olarak alan ve alt alanla daraltın — seçilen en alt kademe bu soruya atanır.",
    levels: {
      exam: "Sınav",
      subject: "Ders",
      domain: "Alan",
      subdomain: "Alt alan",
    },
    placeholders: {
      exam: "Sınav seçin…",
      subject: "Ders seçin…",
      domain: "Alan seçin…",
      subdomain: "Alt alan seçin…",
      selectExamFirst: "Önce sınav seçin",
      selectSubjectFirst: "Önce ders seçin",
      selectDomainFirst: "Önce alan seçin",
      noOptions: "Henüz seçenek yok",
    },
    examType: "Sınav türü:",
    noExamTypeMapping: "(exam_type eşlemesi yok)",
    noTopicAssigned: "Atanmış konu yok",
  },

  // ── Zorluk ────────────────────────────────────────────────────────────────
  difficulty: {
    label: "Zorluk",
    presetLabel: "Zorluk ön ayarı",
    hint: "Kalibrasyon verisi toplanmadan önce başlangıç IRT zorluğunu (b) belirler",
    descriptionPrefix: "Varsayılan değer ",
    descriptionDefault: "Orta",
    descriptionSuffix:
      "'dır. IRT kalibrasyonu, 30+ öğrenci yanıtından sonra bunu otomatik olarak iyileştirir.",
    presets: {
      veryEasy: "Çok Kolay",
      easy: "Kolay",
      average: "Orta",
      hard: "Zor",
      veryHard: "Çok Zor",
    },
    scale: {
      easy: "Kolay",
      hard: "Zor",
    },
    fields: {
      difficultyB: "Zorluk (b)",
      discriminationA: "Ayırt edicilik (a)",
      responsesUsed: "Kullanılan yanıtlar",
    },
  },

  // ── Kalibrasyon durum rozetleri ───────────────────────────────────────────
  calibration: {
    uncalibrated: "Kalibre edilmemiş",
    pre_set: "Uzman tahmini",
    calibrating: "Kalibre ediliyor",
    calibrated: "IRT kalibre edildi",
    awaitingCalibration: (count: number) =>
      `Kalibrasyon bekleniyor · ${count} yanıt toplandı`,
    expertPreset: (label: string, b: string) =>
      `${label} — uzman ön ayarı (b = ${b})`,
    calibratingProgress: (count: number, current: string | null) =>
      `Kalibrasyon sürüyor · ${count} yanıt${
        current != null ? ` · mevcut b = ${current}` : ""
      }`,
  },

  // ── Soru kökü alanları ────────────────────────────────────────────────────
  stem: {
    placeholder: "45 yaşında erkek hasta şu şikâyetlerle başvuruyor…",
    placeholderEdit: "Soru metnini girin…",
  },

  // ── Açıklama alanları ─────────────────────────────────────────────────────
  explanation: {
    overallLabel: "Genel açıklama",
    label: "Açıklama",
    optional: "(isteğe bağlı)",
    placeholder: "Doğru yaklaşımı açıklayın…",
    placeholderEdit: "Doğru cevabı açıklayın…",
  },

  // ── Yanıt seçenekleri ─────────────────────────────────────────────────────
  options: {
    hint: "Doğru cevabı işaretlemek için daireye tıklayın",
    addOption: "Seçenek ekle",
    removeOption: "Seçeneği kaldır",
    correctAnswer: "Doğru cevap",
    markAsCorrect: "Doğru olarak işaretle",
    correct: "Doğru",
    optionPlaceholder: (label: string | number) => `${label} seçeneği`,
    contentPlaceholder: "Yanıt seçeneği metni…",
    optionExplanationPlaceholder: "Seçenek düzeyinde açıklama (isteğe bağlı)",
    optionExplanationPlaceholderEdit:
      "Bu seçenek için açıklama (isteğe bağlı)…",
  },

  // ── Sürüm notu ────────────────────────────────────────────────────────────
  versionNote: {
    label: "Sürüm notu",
    optional: "(isteğe bağlı)",
    placeholder: "İlk sürüm",
    description: "Sürüm geçmişi için bu sürümde nelerin değiştiğini açıklayın",
  },

  // ── Sürüm geçmişi ─────────────────────────────────────────────────────────
  versions: {
    published: "Yayımlandı",
  },

  // ── Üst veriler kenar çubuğu ──────────────────────────────────────────────
  metadata: {
    status: "Durum",
    classification: "Sınıflandırma",
    examType: "Sınav türü",
    type: "Tür",
    created: "Oluşturulma",
  },

  // ── Görüntüleme kartı boş durumu ──────────────────────────────────────────
  view: {
    noContent: "Henüz içerik yok.",
    addContent: "İçerik ekle",
  },

  // ── Düğmeler ──────────────────────────────────────────────────────────────
  buttons: {
    cancel: "İptal",
    createQuestion: "Soru oluştur",
    creating: "Oluşturuluyor…",
    editQuestion: "Soruyu düzenle",
    saveChanges: "Değişiklikleri kaydet",
    saving: "Kaydediliyor…",
    deleteQuestion: "Soruyu sil",
    delete: "Sil",
    deleting: "Siliniyor…",
    backToQuestions: "Sorular",
  },

  // ── Silme onay penceresi ──────────────────────────────────────────────────
  deleteDialog: {
    title: "Soruyu sil",
    body: "Bu soru ve tüm sürümleri kalıcı olarak silinecek.",
  },

  // ── Yükleme / hata durumları ──────────────────────────────────────────────
  states: {
    loadError: "Soru bulunamadı veya yüklenemedi.",
  },

  // ── Bildirim mesajları ────────────────────────────────────────────────────
  toast: {
    created: "Soru oluşturuldu",
    createFailed: "Soru oluşturulamadı",
    saved: "Soru kaydedildi",
    saveFailed: "Soru kaydedilemedi",
    statusUpdated: "Durum güncellendi",
    updateFailed: "Güncelleme başarısız",
    deleted: "Soru silindi",
    deleteFailed: "Silme başarısız",
    error: "Hata",
  },

  // ── Doğrulama mesajları (zod) ─────────────────────────────────────────────
  validation: {
    keyRequired: "Anahtar gereklidir",
    optionTextRequired: "Seçenek metni gereklidir",
    topicRequired: "Bu soruyu atamak için bir ders seçin",
    stemMin: "Soru kökü en az 10 karakter olmalıdır",
    optionsMin: "En az 2 seçenek gereklidir",
    optionsMax: "En fazla 6 seçeneğe izin verilir",
    atLeastOneCorrect: "En az bir seçenek doğru olarak işaretlenmelidir",
    atLeastOneCorrectShort: "En az bir seçenek doğru olmalıdır",
    yearInvalid: "4 haneli bir yıl girin",
  },
};

export const dashItemEditor = { en, tr };

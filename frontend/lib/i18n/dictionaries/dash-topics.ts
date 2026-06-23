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

const tr: DashTopicsDict = {
  topbarTitle: "Konular",
  header: {
    title: "Konu Taksonomisi",
    subtitlePrefix: "4 seviyeli hiyerarşi —",
    newTopic: "Yeni Konu",
  },
  levels: {
    exam: {
      label: "Sınav",
      sublabel: "Seviye 1",
      hint: "örn. USMLE Step 1, TUS",
    },
    subject: {
      label: "Ders",
      sublabel: "Seviye 2",
      hint: "örn. Temel Bilimler",
    },
    domain: {
      label: "Alan",
      sublabel: "Seviye 3",
      hint: "örn. Kardiyoloji",
    },
    subdomain: {
      label: "Alt alan",
      sublabel: "Seviye 4",
      hint: "örn. Aritmiler",
    },
  },
  stats: {
    totalTopics: "Toplam Konu",
    exams: "Sınavlar",
    subjects: "Dersler",
    domains: "Alanlar",
    subdomains: "Alt alanlar",
  },
  search: {
    placeholder: "Konuları ada veya kısa ada göre ara…",
    clear: "Aramayı temizle",
  },
  badges: {
    inactive: "Pasif",
    global: "Genel",
    exam: "SINAV",
  },
  subjectUnit: "ders",
  subjectUnitPlural: "ders",
  node: {
    addChild: "Ekle",
    edit: "Düzenle",
    delete: "Sil",
    collapse: "Daralt",
    expand: "Genişlet",
  },
  error: {
    loadFailed: "Konular yüklenemedi. Lütfen sayfayı yenileyin.",
  },
  empty: {
    title: "Henüz konu yok",
    description: "İlk sınavınızı oluşturarak başlayın (örn. USMLE Step 1).",
    createFirstExam: "İlk sınavı oluştur",
  },
  delete: {
    title: "Konuyu sil",
    confirmPrefix: "Şunu kalıcı olarak silmek istediğinizden emin misiniz:",
    confirmSuffix: "? Bu işlem geri alınamaz.",
    childWarningPrefix: "Bu konunun",
    childTopicUnit: "alt konusu",
    childTopicUnitPlural: "alt konusu",
    childWarningSuffix: " var. Önce tüm alt konuları silin.",
    confirmButton: "Konuyu sil",
    deleting: "Siliniyor…",
    toastDeleted: "Konu silindi",
    toastCannotTitle: "Silinemiyor",
    toastCannotDescription:
      "Bu konunun alt konuları veya bağlı soruları olabilir.",
  },
  sheet: {
    titleNew: "Yeni Konu",
    titleEdit: "Konuyu Düzenle",
    descriptionEditPrefix: "Düzenleniyor:",
    descriptionCreate:
      "Hiyerarşi seviyesini seçin, ayrıntıları doldurun ve kaydedin.",
    hierarchyLevel: "Hiyerarşi Seviyesi",
    hintPrefix: "İpucu:",
    editContextUnder: "şunun altında:",
    placeInHierarchy: "Hiyerarşiye yerleştir",
    detailsEdit: "Ayrıntılar",
    detailsCreate: "Konu ayrıntıları",
    parentExamLabel: "Üst Sınav",
    parentSubjectLabel: "Üst Ders",
    parentDomainLabel: "Üst Alan",
    parentExamPlaceholder: "Bir sınav seçin…",
    parentExamEmpty: "Henüz sınav yok. Önce bir tane oluşturun.",
    parentSubjectPlaceholderDisabled: "Önce bir sınav seçin",
    parentSubjectPlaceholder: "Bir ders seçin…",
    parentSubjectEmpty: "Bu sınav altında henüz ders yok.",
    parentDomainPlaceholderDisabled: "Önce bir ders seçin",
    parentDomainPlaceholder: "Bir alan seçin…",
    parentDomainEmpty: "Bu ders altında henüz alan yok.",
    nameLabel: "Ad",
    slugLabel: "Kısa ad",
    slugPlaceholder: "otomatik oluşturulur",
    slugDescription: "Addan otomatik oluşturulur · URL uyumlu",
    descriptionLabel: "Açıklama",
    descriptionPlaceholder: "İsteğe bağlı açıklama…",
    displayOrderLabel: "Görüntülenme Sırası",
    displayOrderDescription: "Küçük sayılar aynı üst konu içinde önce görünür.",
    activeLabel: "Aktif",
    activeDescription: "Pasif konular öğrencilerden gizlenir.",
    saving: "Kaydediliyor…",
    saveChanges: "Değişiklikleri kaydet",
    createPrefix: "Oluştur:",
    toastUpdated: "Konu güncellendi",
    toastCreatedSuffix: "oluşturuldu",
    toastErrorTitle: "Hata",
    toastErrorGeneric: "Bir şeyler ters gitti",
  },
  validation: {
    nameRequired: "Ad gereklidir",
    slugRequired: "Kısa ad gereklidir",
    slugFormat: "Yalnızca küçük harf, rakam ve tire",
  },
};

export const dashTopics = { en, tr };

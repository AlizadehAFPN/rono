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

const tr: DashItemsDict = {
  topbarTitle: "Sorular",
  header: {
    title: "Soru Bankası",
    countSuffixOne: "soru toplam",
    countSuffixMany: "soru toplam",
    newQuestion: "Yeni soru",
  },
  filters: {
    allExamTypes: "Tüm sınav türleri",
  },
  tabs: {
    all: "Tümü",
    active: "Aktif",
    draft: "Taslak",
    retired: "Emekliye ayrılmış",
  },
  status: {
    draft: "Taslak",
    active: "Aktif",
    retired: "Emekliye ayrılmış",
  },
  difficulty: {
    veryEasy: "Çok Kolay",
    easy: "Kolay",
    average: "Orta",
    hard: "Zor",
    veryHard: "Çok Zor",
  },
  columns: {
    question: "Soru",
    correctAnswer: "Doğru Cevap",
    options: "Seçenekler",
    examType: "Sınav Türü",
    dateAdded: "Eklenme Tarihi",
    status: "Durum",
  },
  rowActions: {
    edit: "Düzenle",
    delete: "Sil",
  },
  empty: {
    titleAll: "Henüz soru yok",
    titleFilteredPrefix: "",
    titleFilteredSuffix: "soru yok",
    descriptionAll: "Soru bankanızı oluşturmak için ilk sorunuzu ekleyin.",
    descriptionFilteredPrefix: "Durumu",
    descriptionFilteredSuffix: "olan, filtrelerinizle eşleşen soru yok.",
    newQuestion: "Yeni soru",
  },
  error: {
    loadFailed: "Sorular yüklenemedi. Lütfen sayfayı yenileyin.",
  },
  pagination: {
    pagePrefix: "Sayfa",
    pageOf: "/",
    pageTotalSuffix: "toplam",
    previous: "Önceki",
    next: "İleri",
  },
  deleteDialog: {
    title: "Soruyu sil",
    description:
      "Bu soru ve tüm sürümleri kalıcı olarak silinecek. Bu işlem geri alınamaz.",
    cancel: "İptal",
    delete: "Sil",
    deleting: "Siliniyor…",
  },
  toast: {
    deleted: "Soru silindi",
    deleteFailedTitle: "Silme başarısız",
    deleteFailedDescription: "Soru silinemedi.",
  },
  empty_em_dash: "—",
};

export const dashItems = { en, tr };

// Shared strings: language switcher, role labels, and reusable action/state
// labels used across the dashboard.

const en = {
  language: {
    label: "Language",
    turkish: "Türkçe",
    english: "English",
  },
  roles: {
    student: "Student",
    content_author: "Content Author",
    instructor: "Instructor",
    coordinator: "Coordinator",
    institution_admin: "Institution Admin",
    system_admin: "System Admin",
  },
  actions: {
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    delete: "Delete",
    deleting: "Deleting…",
    edit: "Edit",
    create: "Create",
    creating: "Creating…",
    add: "Add",
    remove: "Remove",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    confirm: "Confirm",
    search: "Search",
    retry: "Retry",
    view: "View",
    refresh: "Refresh",
    saveChanges: "Save changes",
    loadMore: "Load more",
  },
  states: {
    loading: "Loading…",
    error: "Something went wrong.",
    empty: "Nothing here yet.",
    noResults: "No results found.",
    required: "Required",
    optional: "Optional",
  },
};

export type CommonDict = typeof en;

const tr: CommonDict = {
  language: {
    label: "Dil",
    turkish: "Türkçe",
    english: "English",
  },
  roles: {
    student: "Öğrenci",
    content_author: "İçerik Yazarı",
    instructor: "Eğitmen",
    coordinator: "Koordinatör",
    institution_admin: "Kurum Yöneticisi",
    system_admin: "Sistem Yöneticisi",
  },
  actions: {
    save: "Kaydet",
    saving: "Kaydediliyor…",
    cancel: "İptal",
    delete: "Sil",
    deleting: "Siliniyor…",
    edit: "Düzenle",
    create: "Oluştur",
    creating: "Oluşturuluyor…",
    add: "Ekle",
    remove: "Kaldır",
    back: "Geri",
    next: "İleri",
    previous: "Önceki",
    close: "Kapat",
    confirm: "Onayla",
    search: "Ara",
    retry: "Tekrar dene",
    view: "Görüntüle",
    refresh: "Yenile",
    saveChanges: "Değişiklikleri kaydet",
    loadMore: "Daha fazla yükle",
  },
  states: {
    loading: "Yükleniyor…",
    error: "Bir şeyler ters gitti.",
    empty: "Burada henüz bir şey yok.",
    noResults: "Sonuç bulunamadı.",
    required: "Zorunlu",
    optional: "İsteğe bağlı",
  },
};

export const common = { en, tr };

import Foundation

/// Root string table, assembled from per-feature tables. Mirrors the structure
/// of `frontend/lib/i18n/dictionaries/*`. Grows file-by-file as features land.
struct Strings: Sendable {
    let common: CommonStrings
    let nav: NavStrings
    let auth: AuthStrings
    let onboarding: OnboardingStrings
    let settings: SettingsStrings
    let profile: ProfileStrings
    let home: HomeStrings
    let study: StudyStrings
    let practice: PracticeStrings
    let progress: ProgressStrings

    static let en = Strings(
        common: .en, nav: .en, auth: .en, onboarding: .en, settings: .en, profile: .en,
        home: .en, study: .en, practice: .en, progress: .en
    )
    static let tr = Strings(
        common: .tr, nav: .tr, auth: .tr, onboarding: .tr, settings: .tr, profile: .tr,
        home: .tr, study: .tr, practice: .tr, progress: .tr
    )

    /// Localized label for a role raw value (e.g. "institution_admin").
    func roleLabel(_ raw: String) -> String { common.roles[raw] ?? raw }
}

// MARK: - Common

struct CommonStrings: Sendable {
    struct Language: Sendable { let label, turkish, english: String }
    struct Actions: Sendable {
        let save, saving, cancel, delete, deleting, edit, create, creating, add, remove,
            back, next, previous, close, confirm, search, retry, view, refresh,
            saveChanges, loadMore: String
    }
    struct States: Sendable {
        let loading, error, empty, noResults, required, optional: String
    }

    let language: Language
    let roles: [String: String]
    let actions: Actions
    let states: States

    static let en = CommonStrings(
        language: .init(label: "Language", turkish: "Türkçe", english: "English"),
        roles: [
            "student": "Student", "content_author": "Content Author", "instructor": "Instructor",
            "coordinator": "Coordinator", "institution_admin": "Institution Admin",
            "system_admin": "System Admin",
        ],
        actions: .init(
            save: "Save", saving: "Saving…", cancel: "Cancel", delete: "Delete",
            deleting: "Deleting…", edit: "Edit", create: "Create", creating: "Creating…",
            add: "Add", remove: "Remove", back: "Back", next: "Next", previous: "Previous",
            close: "Close", confirm: "Confirm", search: "Search", retry: "Retry", view: "View",
            refresh: "Refresh", saveChanges: "Save changes", loadMore: "Load more"
        ),
        states: .init(
            loading: "Loading…", error: "Something went wrong.", empty: "Nothing here yet.",
            noResults: "No results found.", required: "Required", optional: "Optional"
        )
    )

    static let tr = CommonStrings(
        language: .init(label: "Dil", turkish: "Türkçe", english: "English"),
        roles: [
            "student": "Öğrenci", "content_author": "İçerik Yazarı", "instructor": "Eğitmen",
            "coordinator": "Koordinatör", "institution_admin": "Kurum Yöneticisi",
            "system_admin": "Sistem Yöneticisi",
        ],
        actions: .init(
            save: "Kaydet", saving: "Kaydediliyor…", cancel: "İptal", delete: "Sil",
            deleting: "Siliniyor…", edit: "Düzenle", create: "Oluştur", creating: "Oluşturuluyor…",
            add: "Ekle", remove: "Kaldır", back: "Geri", next: "İleri", previous: "Önceki",
            close: "Kapat", confirm: "Onayla", search: "Ara", retry: "Tekrar dene",
            view: "Görüntüle", refresh: "Yenile", saveChanges: "Değişiklikleri kaydet",
            loadMore: "Daha fazla yükle"
        ),
        states: .init(
            loading: "Yükleniyor…", error: "Bir şeyler ters gitti.",
            empty: "Burada henüz bir şey yok.", noResults: "Sonuç bulunamadı.",
            required: "Zorunlu", optional: "İsteğe bağlı"
        )
    )
}

// MARK: - Navigation

struct NavStrings: Sendable {
    struct Items: Sendable {
        let overview, topics, questions, study, daily, practice, progress, analytics,
            users, settings, profile: String
    }
    let adminBadge, workspace, administration, account, signOut, openMenu, back,
        profile, navigation, more, learning, developer, backend: String
    let items: Items

    static let en = NavStrings(
        adminBadge: "Admin", workspace: "Workspace", administration: "Administration",
        account: "Account", signOut: "Sign out", openMenu: "Open menu", back: "Back",
        profile: "Profile", navigation: "Navigation", more: "More", learning: "Learning",
        developer: "Developer", backend: "Backend",
        items: .init(
            overview: "Dashboard", topics: "Topics", questions: "Questions", study: "Study",
            daily: "Daily Review", practice: "Exam", progress: "Progress",
            analytics: "Analytics", users: "Users", settings: "Settings", profile: "Profile"
        )
    )

    static let tr = NavStrings(
        adminBadge: "Yönetici", workspace: "Çalışma Alanı", administration: "Yönetim",
        account: "Hesap", signOut: "Çıkış yap", openMenu: "Menüyü aç", back: "Geri",
        profile: "Profil", navigation: "Gezinme", more: "Daha fazla", learning: "Öğrenme",
        developer: "Geliştirici", backend: "Sunucu",
        items: .init(
            overview: "Panel", topics: "Konular", questions: "Sorular", study: "Çalış",
            daily: "Günlük Tekrar", practice: "Sınav", progress: "İlerleme",
            analytics: "Analitik", users: "Kullanıcılar", settings: "Ayarlar", profile: "Profil"
        )
    )
}

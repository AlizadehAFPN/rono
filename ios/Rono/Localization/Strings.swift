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
    static let fa = Strings(
        common: .fa, nav: .fa, auth: .fa, onboarding: .fa, settings: .fa, profile: .fa,
        home: .fa, study: .fa, practice: .fa, progress: .fa
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

    static let fa = CommonStrings(
        language: .init(label: "زبان", turkish: "Türkçe", english: "English"),
        roles: [
            "student": "داوطلب", "content_author": "نویسنده محتوا", "instructor": "مدرس",
            "coordinator": "هماهنگ‌کننده", "institution_admin": "مدیر سازمان",
            "system_admin": "مدیر سیستم",
        ],
        actions: .init(
            save: "ذخیره", saving: "در حال ذخیره…", cancel: "انصراف", delete: "حذف",
            deleting: "در حال حذف…", edit: "ویرایش", create: "ایجاد", creating: "در حال ایجاد…",
            add: "افزودن", remove: "حذف", back: "بازگشت", next: "بعدی", previous: "قبلی",
            close: "بستن", confirm: "تأیید", search: "جستجو", retry: "تلاش دوباره",
            view: "مشاهده", refresh: "بازخوانی", saveChanges: "ذخیره تغییرات",
            loadMore: "بارگذاری بیشتر"
        ),
        states: .init(
            loading: "در حال بارگذاری…", error: "مشکلی پیش آمد.",
            empty: "هنوز چیزی اینجا نیست.", noResults: "نتیجه‌ای یافت نشد.",
            required: "الزامی", optional: "اختیاری"
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

    static let fa = NavStrings(
        adminBadge: "مدیر", workspace: "فضای کاری", administration: "مدیریت",
        account: "حساب کاربری", signOut: "خروج", openMenu: "باز کردن منو", back: "بازگشت",
        profile: "پروفایل", navigation: "ناوبری", more: "بیشتر", learning: "یادگیری",
        developer: "توسعه‌دهنده", backend: "سرور",
        items: .init(
            overview: "داشبورد", topics: "مباحث", questions: "بانک سؤال", study: "مرور",
            daily: "مرور روزانه", practice: "آزمون آزمایشی", progress: "آمادگی من",
            analytics: "کارنامه", users: "کاربران", settings: "تنظیمات", profile: "پروفایل"
        )
    )
}

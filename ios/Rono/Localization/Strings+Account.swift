import Foundation

// MARK: - Settings

struct SettingsStrings: Sendable {
    struct ThemeOption: Sendable { let label, desc: String }
    struct Theme: Sendable {
        let title, description: String
        let light, dark, system: ThemeOption
    }
    struct Language: Sendable { let title, description, saved, saveFailed: String }
    struct Account: Sendable { let heading, description, emailLabel, emailHint: String }
    struct Password: Sendable {
        let title, description, current, next, confirm, rules, mismatch,
            change, changing, changed, failed: String
    }
    struct Sessions: Sendable {
        let title, description, current, unknownDevice, signedIn, expires, revoke,
            revoked, revokeOthers, revokedOthers, empty, loading, failed: String
    }
    struct Institution: Sendable {
        let heading, description, nameLabel, namePh, domainLabel, domainPh, slugLabel,
            tierLabel, save, saving, saved, saveFailed, error, adminOnly: String
    }

    let pageTitle: String
    let theme: Theme
    let language: Language
    let account: Account
    let password: Password
    let sessions: Sessions
    let institution: Institution

    static let en = SettingsStrings(
        pageTitle: "Settings",
        theme: .init(
            title: "Theme", description: "Choose how the dashboard looks to you.",
            light: .init(label: "Light", desc: "Clean & bright"),
            dark: .init(label: "Dark", desc: "Easy on the eyes"),
            system: .init(label: "System", desc: "Follows your OS")
        ),
        language: .init(
            title: "Language", description: "Used across the app. Saved to your account.",
            saved: "Language updated", saveFailed: "Couldn't save your language"
        ),
        account: .init(
            heading: "Account & security",
            description: "Manage your sign-in credentials and active sessions.",
            emailLabel: "Email", emailHint: "Contact your administrator to change your email."
        ),
        password: .init(
            title: "Password", description: "Choose a strong password you don't use elsewhere.",
            current: "Current password", next: "New password", confirm: "Confirm new password",
            rules: "At least 8 characters, with an uppercase letter, a lowercase letter and a number.",
            mismatch: "The new passwords don't match.", change: "Update password",
            changing: "Updating…", changed: "Password updated — other sessions were signed out.",
            failed: "Couldn't update your password"
        ),
        sessions: .init(
            title: "Active sessions", description: "Devices currently signed in to your account.",
            current: "This device", unknownDevice: "Unknown device", signedIn: "Signed in",
            expires: "Expires", revoke: "Sign out", revoked: "Session signed out",
            revokeOthers: "Sign out all other sessions", revokedOthers: "Other sessions signed out",
            empty: "No other active sessions.", loading: "Loading sessions…", failed: "Action failed"
        ),
        institution: .init(
            heading: "Institution", description: "Your institution's profile. Only admins can edit.",
            nameLabel: "Name", namePh: "Rono Demo University", domainLabel: "Domain",
            domainPh: "example.edu", slugLabel: "Slug", tierLabel: "Plan", save: "Save changes",
            saving: "Saving…", saved: "Institution updated", saveFailed: "Failed to update institution",
            error: "Error", adminOnly: "Only admins can edit these settings."
        )
    )

    static let fa = SettingsStrings(
        pageTitle: "تنظیمات",
        theme: .init(
            title: "ظاهر", description: "انتخاب کن داشبورد چه شکلی برات نمایش داده بشه.",
            light: .init(label: "روشن", desc: "تمیز و روشن"),
            dark: .init(label: "تیره", desc: "ملایم برای چشم"),
            system: .init(label: "سیستم", desc: "از سیستم‌عاملت پیروی می‌کنه")
        ),
        language: .init(
            title: "زبان", description: "در کل برنامه استفاده می‌شه. روی حسابت ذخیره می‌شه.",
            saved: "زبان به‌روزرسانی شد", saveFailed: "نتونستیم زبانت رو ذخیره کنیم"
        ),
        account: .init(
            heading: "حساب و امنیت",
            description: "اطلاعات ورود و نشست‌های فعالت رو مدیریت کن.",
            emailLabel: "ایمیل", emailHint: "برای تغییر ایمیلت با مدیر تماس بگیر."
        ),
        password: .init(
            title: "رمز عبور", description: "یک رمز عبور قوی انتخاب کن که جای دیگه ازش استفاده نمی‌کنی.",
            current: "رمز عبور فعلی", next: "رمز عبور جدید", confirm: "تأیید رمز عبور جدید",
            rules: "حداقل ۸ کاراکتر، شامل یک حرف بزرگ، یک حرف کوچک و یک عدد.",
            mismatch: "رمزهای عبور جدید با هم یکی نیستن.", change: "به‌روزرسانی رمز عبور",
            changing: "در حال به‌روزرسانی…", changed: "رمز عبور به‌روزرسانی شد — بقیه نشست‌ها خارج شدن.",
            failed: "نتونستیم رمز عبورت رو به‌روزرسانی کنیم"
        ),
        sessions: .init(
            title: "نشست‌های فعال", description: "دستگاه‌هایی که الان به حسابت وارد شدن.",
            current: "این دستگاه", unknownDevice: "دستگاه ناشناس", signedIn: "ورود",
            expires: "انقضا", revoke: "خروج", revoked: "نشست خارج شد",
            revokeOthers: "خروج از همه نشست‌های دیگه", revokedOthers: "نشست‌های دیگه خارج شدن",
            empty: "نشست فعال دیگه‌ای نیست.", loading: "در حال بارگذاری نشست‌ها…", failed: "عملیات ناموفق بود"
        ),
        institution: .init(
            heading: "سازمان", description: "پروفایل سازمانت. فقط مدیرها می‌تونن ویرایش کنن.",
            nameLabel: "نام", namePh: "سازمان نمونه رونو", domainLabel: "دامنه",
            domainPh: "example.edu", slugLabel: "نامک", tierLabel: "پلن", save: "ذخیره تغییرات",
            saving: "در حال ذخیره…", saved: "سازمان به‌روزرسانی شد", saveFailed: "به‌روزرسانی سازمان ناموفق بود",
            error: "خطا", adminOnly: "فقط مدیرها می‌تونن این تنظیمات رو ویرایش کنن."
        )
    )
}

// MARK: - Profile (identity / edit / avatar; learning-state added in Phase 2)

struct ProfileStrings: Sendable {
    struct Identity: Sendable {
        let memberSince, lastLogin, never, institution, role, emailVerified,
            emailUnverified, accountActive, accountInactive: String
    }
    struct Edit: Sendable {
        let title, description, fullName, fullNamePh, preferredName, preferredNamePh,
            preferredNameHint, save, saving, saved, saveFailed, error: String
    }
    struct Avatar: Sendable {
        let alt, upload, change, remove, uploading, removing, hint, uploaded, removed,
            uploadFailed, removeFailed, tooLarge, badType: String
    }

    struct Ability: Sendable {
        let label, help, confidenceLabel: String
        let confidence: [String: String]   // building / medium / high
        let interpret: [String: String]    // building / developing / solid / advanced
        let interpretHint: [String: String]
    }
    struct StateStats: Sendable {
        let answered, correct, accuracy, reviewDue, reviewDueHelp, newAvailable: String
    }
    struct StateMastery: Sendable { let title, description, empty, questions, distributionTitle: String }
    struct StateSessions: Sendable { let title, empty, net: String }
    struct LearningState: Sendable {
        let title, description, empty: String
        let ability: Ability
        let stats: StateStats
        let mastery: StateMastery
        let sessions: StateSessions
    }

    let pageTitle: String
    let identity: Identity
    let edit: Edit
    let avatar: Avatar
    let state: LearningState

    static let en = ProfileStrings(
        pageTitle: "Profile",
        identity: .init(
            memberSince: "Member since", lastLogin: "Last sign-in", never: "Never",
            institution: "Institution", role: "Role", emailVerified: "Email verified",
            emailUnverified: "Email not verified", accountActive: "Active",
            accountInactive: "Deactivated"
        ),
        edit: .init(
            title: "Personal details", description: "This is how you appear across Rono.",
            fullName: "Full name", fullNamePh: "Jane Doe", preferredName: "Preferred name",
            preferredNamePh: "Jane", preferredNameHint: "Shown in greetings. Optional.",
            save: "Save changes", saving: "Saving…", saved: "Profile updated",
            saveFailed: "Couldn't save your profile", error: "Error"
        ),
        avatar: .init(
            alt: "Profile photo", upload: "Upload photo", change: "Change photo",
            remove: "Remove photo", uploading: "Uploading…", removing: "Removing…",
            hint: "JPEG, PNG, WebP or GIF. Max 5 MB.", uploaded: "Photo updated",
            removed: "Photo removed", uploadFailed: "Couldn't upload your photo",
            removeFailed: "Couldn't remove your photo",
            tooLarge: "Image is too large. Maximum size is 5 MB.",
            badType: "Unsupported format. Use JPEG, PNG, WebP or GIF."
        ),
        state: .init(
            title: "Your learning state",
            description: "A transparent, real-time view of what the adaptive engine knows about you.",
            empty: "You haven't answered any questions yet. Start a session and your ability, mastery, and review schedule will appear here.",
            ability: .init(
                label: "Ability (θ)",
                help: "Your estimated skill on a scale where 0 is the average learner, updated after every answer (IRT 2PL).",
                confidenceLabel: "Confidence",
                confidence: ["building": "Still calibrating", "medium": "Firming up", "high": "Well established"],
                interpret: ["building": "Building foundations", "developing": "Developing", "solid": "On track", "advanced": "Advanced"],
                interpretHint: ["building": "Below the average learner — focus on the fundamentals.",
                                "developing": "Approaching the average learner.",
                                "solid": "At or above the average learner.",
                                "advanced": "Well above the average learner."]
            ),
            stats: .init(answered: "Questions answered", correct: "Correct", accuracy: "Accuracy",
                         reviewDue: "Reviews due", reviewDueHelp: "Cards FSRS-5 says are ready to review now.",
                         newAvailable: "New available"),
            mastery: .init(title: "Mastery by topic", description: "Where each topic sits on the path to mastery.",
                           empty: "No topic data yet.", questions: "questions", distributionTitle: "Mastery distribution"),
            sessions: .init(title: "Recent sessions", empty: "No sessions yet.", net: "Net")
        )
    )

    static let fa = ProfileStrings(
        pageTitle: "پروفایل",
        identity: .init(
            memberSince: "عضو از", lastLogin: "آخرین ورود", never: "هرگز",
            institution: "سازمان", role: "نقش", emailVerified: "ایمیل تأیید شده",
            emailUnverified: "ایمیل تأیید نشده", accountActive: "فعال",
            accountInactive: "غیرفعال"
        ),
        edit: .init(
            title: "اطلاعات شخصی", description: "در سراسر رونو به این شکل دیده می‌شی.",
            fullName: "نام کامل", fullNamePh: "نام و نام خانوادگی", preferredName: "نام دلخواه",
            preferredNamePh: "نام کوچک", preferredNameHint: "در خوشامدگویی‌ها نشون داده می‌شه. اختیاری.",
            save: "ذخیره تغییرات", saving: "در حال ذخیره…", saved: "پروفایل به‌روزرسانی شد",
            saveFailed: "نتونستیم پروفایلت رو ذخیره کنیم", error: "خطا"
        ),
        avatar: .init(
            alt: "عکس پروفایل", upload: "بارگذاری عکس", change: "تغییر عکس",
            remove: "حذف عکس", uploading: "در حال بارگذاری…", removing: "در حال حذف…",
            hint: "JPEG، PNG، WebP یا GIF. حداکثر ۵ مگابایت.", uploaded: "عکس به‌روزرسانی شد",
            removed: "عکس حذف شد", uploadFailed: "نتونستیم عکست رو بارگذاری کنیم",
            removeFailed: "نتونستیم عکست رو حذف کنیم",
            tooLarge: "عکس خیلی بزرگه. حداکثر اندازه ۵ مگابایته.",
            badType: "این قالب پشتیبانی نمی‌شه. از JPEG، PNG، WebP یا GIF استفاده کن."
        ),
        state: .init(
            title: "وضعیت پیشرفت تو",
            description: "نمای روشن و لحظه‌ای از اینکه رونو چقدر تو رو می‌شناسه.",
            empty: "هنوز به هیچ سؤالی جواب ندادی. یک تمرین رو شروع کن تا سطح آمادگی، تسلط و برنامه مرورت اینجا نمایش داده بشه.",
            ability: .init(
                label: "سطح آمادگی",
                help: "برآوردی از سطح آمادگیت روی مقیاسی که ۰ یعنی داوطلب متوسط؛ بعد از هر جواب به‌روز می‌شه.",
                confidenceLabel: "میزان اطمینان",
                confidence: ["building": "هنوز در حال سنجش", "medium": "در حال تثبیت", "high": "کاملاً جا افتاده"],
                interpret: ["building": "ساختن پایه‌ها", "developing": "در حال پیشرفت", "solid": "روی مسیر درست", "advanced": "پیشرفته"],
                interpretHint: ["building": "پایین‌تر از داوطلب متوسط — روی مباحث پایه تمرکز کن.",
                                "developing": "داری به داوطلب متوسط نزدیک می‌شی.",
                                "solid": "هم‌سطح یا بالاتر از داوطلب متوسط.",
                                "advanced": "خیلی بالاتر از داوطلب متوسط."]
            ),
            stats: .init(answered: "سؤال‌های جواب‌داده‌شده", correct: "درست", accuracy: "دقت",
                         reviewDue: "مرورهای موعد رسیده", reviewDueHelp: "سؤال‌هایی که الان آماده مرورن.",
                         newAvailable: "سؤال‌های جدید"),
            mastery: .init(title: "تسلط بر اساس مبحث", description: "جای هر مبحث در مسیر تسلط.",
                           empty: "هنوز داده‌ای برای مبحث‌ها نیست.", questions: "سؤال", distributionTitle: "توزیع تسلط"),
            sessions: .init(title: "تمرین‌های اخیر", empty: "هنوز تمرینی نیست.", net: "خالص")
        )
    )
}

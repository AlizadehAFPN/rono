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
            nameLabel: "Name", namePh: "Synapse Demo University", domainLabel: "Domain",
            domainPh: "example.edu", slugLabel: "Slug", tierLabel: "Plan", save: "Save changes",
            saving: "Saving…", saved: "Institution updated", saveFailed: "Failed to update institution",
            error: "Error", adminOnly: "Only admins can edit these settings."
        )
    )

    static let tr = SettingsStrings(
        pageTitle: "Ayarlar",
        theme: .init(
            title: "Tema", description: "Panonun size nasıl görüneceğini seçin.",
            light: .init(label: "Açık", desc: "Sade ve aydınlık"),
            dark: .init(label: "Koyu", desc: "Gözleri yormaz"),
            system: .init(label: "Sistem", desc: "İşletim sisteminizi izler")
        ),
        language: .init(
            title: "Dil", description: "Uygulama genelinde kullanılır. Hesabınıza kaydedilir.",
            saved: "Dil güncellendi", saveFailed: "Diliniz kaydedilemedi"
        ),
        account: .init(
            heading: "Hesap ve güvenlik",
            description: "Giriş bilgilerinizi ve aktif oturumlarınızı yönetin.",
            emailLabel: "E-posta", emailHint: "E-postanızı değiştirmek için yöneticinizle iletişime geçin."
        ),
        password: .init(
            title: "Parola", description: "Başka yerde kullanmadığınız güçlü bir parola seçin.",
            current: "Mevcut parola", next: "Yeni parola", confirm: "Yeni parolayı onayla",
            rules: "En az 8 karakter; bir büyük harf, bir küçük harf ve bir rakam içermeli.",
            mismatch: "Yeni parolalar eşleşmiyor.", change: "Parolayı güncelle",
            changing: "Güncelleniyor…", changed: "Parola güncellendi — diğer oturumlar kapatıldı.",
            failed: "Parolanız güncellenemedi"
        ),
        sessions: .init(
            title: "Aktif oturumlar", description: "Hesabınızda şu anda oturum açmış cihazlar.",
            current: "Bu cihaz", unknownDevice: "Bilinmeyen cihaz", signedIn: "Giriş",
            expires: "Bitiş", revoke: "Çıkış yap", revoked: "Oturum kapatıldı",
            revokeOthers: "Diğer tüm oturumları kapat", revokedOthers: "Diğer oturumlar kapatıldı",
            empty: "Başka aktif oturum yok.", loading: "Oturumlar yükleniyor…", failed: "İşlem başarısız"
        ),
        institution: .init(
            heading: "Kurum", description: "Kurumunuzun profili. Yalnızca yöneticiler düzenleyebilir.",
            nameLabel: "Ad", namePh: "Synapse Demo Üniversitesi", domainLabel: "Alan adı",
            domainPh: "ornek.edu", slugLabel: "Kısa ad", tierLabel: "Plan",
            save: "Değişiklikleri kaydet", saving: "Kaydediliyor…", saved: "Kurum güncellendi",
            saveFailed: "Kurum güncellenemedi", error: "Hata",
            adminOnly: "Bu ayarları yalnızca yöneticiler düzenleyebilir."
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
            title: "Personal details", description: "This is how you appear across Synapse.",
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

    static let tr = ProfileStrings(
        pageTitle: "Profil",
        identity: .init(
            memberSince: "Üyelik başlangıcı", lastLogin: "Son giriş", never: "Hiç",
            institution: "Kurum", role: "Rol", emailVerified: "E-posta doğrulandı",
            emailUnverified: "E-posta doğrulanmadı", accountActive: "Aktif",
            accountInactive: "Devre dışı"
        ),
        edit: .init(
            title: "Kişisel bilgiler", description: "Synapse genelinde bu şekilde görünürsünüz.",
            fullName: "Ad soyad", fullNamePh: "Ayşe Yılmaz", preferredName: "Tercih edilen ad",
            preferredNamePh: "Ayşe", preferredNameHint: "Karşılamalarda gösterilir. İsteğe bağlı.",
            save: "Değişiklikleri kaydet", saving: "Kaydediliyor…", saved: "Profil güncellendi",
            saveFailed: "Profiliniz kaydedilemedi", error: "Hata"
        ),
        avatar: .init(
            alt: "Profil fotoğrafı", upload: "Fotoğraf yükle", change: "Fotoğrafı değiştir",
            remove: "Fotoğrafı kaldır", uploading: "Yükleniyor…", removing: "Kaldırılıyor…",
            hint: "JPEG, PNG, WebP veya GIF. En fazla 5 MB.", uploaded: "Fotoğraf güncellendi",
            removed: "Fotoğraf kaldırıldı", uploadFailed: "Fotoğrafınız yüklenemedi",
            removeFailed: "Fotoğrafınız kaldırılamadı",
            tooLarge: "Görsel çok büyük. En fazla 5 MB olabilir.",
            badType: "Desteklenmeyen biçim. JPEG, PNG, WebP veya GIF kullanın."
        ),
        state: .init(
            title: "Öğrenme durumunuz",
            description: "Uyarlanabilir motorun sizin hakkınızda bildiklerinin şeffaf, gerçek zamanlı görünümü.",
            empty: "Henüz hiç soru yanıtlamadınız. Bir oturum başlatın; yetenek, ustalık ve tekrar planınız burada görünecek.",
            ability: .init(
                label: "Yetenek (θ)",
                help: "0'ın ortalama öğrenciyi temsil ettiği bir ölçekte tahmini beceriniz; her yanıttan sonra güncellenir (IRT 2PL).",
                confidenceLabel: "Güven",
                confidence: ["building": "Hâlâ kalibre ediliyor", "medium": "Sağlamlaşıyor", "high": "İyi oturmuş"],
                interpret: ["building": "Temel oluşturuluyor", "developing": "Gelişiyor", "solid": "Yolunda", "advanced": "İleri düzey"],
                interpretHint: ["building": "Ortalama öğrencinin altında — temellere odaklanın.",
                                "developing": "Ortalama öğrenciye yaklaşıyor.",
                                "solid": "Ortalama öğrenci düzeyinde veya üzerinde.",
                                "advanced": "Ortalama öğrencinin oldukça üzerinde."]
            ),
            stats: .init(answered: "Yanıtlanan soru", correct: "Doğru", accuracy: "Doğruluk",
                         reviewDue: "Bekleyen tekrar", reviewDueHelp: "FSRS-5'in şimdi tekrar edilmeye hazır dediği kartlar.",
                         newAvailable: "Yeni mevcut"),
            mastery: .init(title: "Konuya göre ustalık", description: "Her konunun ustalık yolundaki yeri.",
                           empty: "Henüz konu verisi yok.", questions: "soru", distributionTitle: "Ustalık dağılımı"),
            sessions: .init(title: "Son oturumlar", empty: "Henüz oturum yok.", net: "Net")
        )
    )
}

import Foundation

struct AuthStrings: Sendable {
    struct Login: Sendable {
        let tagline, title, subtitle, emailLabel, emailPlaceholder, passwordLabel,
            forgotPassword, signIn, signingIn, or, noAccount, createOne,
            errorInvalid, errorGeneric, vEmailInvalid, vPasswordRequired: String
    }
    struct Signup: Sendable {
        let tagline, title, subtitle, fullNameLabel, fullNamePlaceholder, emailLabel,
            emailPlaceholder, passwordLabel, passwordPlaceholder, createAccount, creating,
            or, haveAccount, signIn, errorConflict, errorValidation, errorGeneric,
            vFullNameRequired, vEmailInvalid, vPasswordRequired: String
    }
    struct Register: Sendable {
        let title, subtitle, fullNameLabel, fullNamePlaceholder, emailLabel, emailPlaceholder,
            passwordLabel, passwordHint, institutionSection, institutionNameLabel,
            institutionNamePlaceholder, slugLabel, slugPlaceholder, slugHint, createAccount,
            creating, haveAccount, signIn, errorConflict, errorValidation, errorGeneric,
            vFullNameMin, vEmailInvalid, vPasswordMin, vPasswordUpper, vPasswordLower,
            vPasswordNumber, vInstitutionNameMin, vSlugMin, vSlugMax, vSlugFormat: String
    }

    let login: Login
    let signup: Signup
    let register: Register

    static let en = AuthStrings(
        login: .init(
            tagline: "Adaptive Medical Learning Platform", title: "Welcome back",
            subtitle: "Sign in to continue to your dashboard", emailLabel: "Email address",
            emailPlaceholder: "you@institution.edu", passwordLabel: "Password",
            forgotPassword: "Forgot password?", signIn: "Sign in", signingIn: "Signing in…",
            or: "or", noAccount: "Don't have an account?", createOne: "Create one",
            errorInvalid: "Invalid email or password.",
            errorGeneric: "Something went wrong. Please try again.",
            vEmailInvalid: "Enter a valid email address", vPasswordRequired: "Password is required"
        ),
        signup: .init(
            tagline: "Adaptive Medical Learning Platform", title: "Create your account",
            subtitle: "Sign up to start practicing", fullNameLabel: "Full name",
            fullNamePlaceholder: "Jane Smith", emailLabel: "Email address",
            emailPlaceholder: "you@example.com", passwordLabel: "Password",
            passwordPlaceholder: "••••••••", createAccount: "Create account",
            creating: "Creating account…", or: "or", haveAccount: "Already have an account?",
            signIn: "Sign in", errorConflict: "An account with this email already exists.",
            errorValidation: "Please check your details and try again.",
            errorGeneric: "Something went wrong. Please try again.",
            vFullNameRequired: "Full name is required", vEmailInvalid: "Enter a valid email address",
            vPasswordRequired: "Password is required"
        ),
        register: .init(
            title: "Create your account", subtitle: "Start your institution's Rono workspace",
            fullNameLabel: "Full name", fullNamePlaceholder: "Dr. Jane Smith",
            emailLabel: "Work email", emailPlaceholder: "you@institution.edu",
            passwordLabel: "Password",
            passwordHint: "8+ characters with uppercase, lowercase, and a number",
            institutionSection: "Institution", institutionNameLabel: "Institution name",
            institutionNamePlaceholder: "University of Medicine", slugLabel: "URL slug",
            slugPlaceholder: "university-of-medicine",
            slugHint: "Unique identifier, lowercase with hyphens only",
            createAccount: "Create account", creating: "Creating account…",
            haveAccount: "Already have an account?", signIn: "Sign in",
            errorConflict: "An account with this email already exists.",
            errorValidation: "Please check your details and try again.",
            errorGeneric: "Something went wrong. Please try again.",
            vFullNameMin: "Full name must be at least 2 characters",
            vEmailInvalid: "Enter a valid email address",
            vPasswordMin: "Password must be at least 8 characters",
            vPasswordUpper: "Must contain an uppercase letter",
            vPasswordLower: "Must contain a lowercase letter",
            vPasswordNumber: "Must contain a number",
            vInstitutionNameMin: "Institution name is required",
            vSlugMin: "Slug must be at least 2 characters",
            vSlugMax: "Slug must be at most 40 characters",
            vSlugFormat: "Slug can only contain lowercase letters, numbers, and hyphens"
        )
    )

    static let tr = AuthStrings(
        login: .init(
            tagline: "Uyarlanabilir Tıp Öğrenme Platformu", title: "Tekrar hoş geldiniz",
            subtitle: "Panonuza devam etmek için giriş yapın", emailLabel: "E-posta adresi",
            emailPlaceholder: "siz@kurum.edu.tr", passwordLabel: "Parola",
            forgotPassword: "Parolanızı mı unuttunuz?", signIn: "Giriş yap",
            signingIn: "Giriş yapılıyor…", or: "veya", noAccount: "Hesabınız yok mu?",
            createOne: "Bir tane oluşturun", errorInvalid: "Geçersiz e-posta veya parola.",
            errorGeneric: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
            vEmailInvalid: "Geçerli bir e-posta adresi girin", vPasswordRequired: "Parola gereklidir"
        ),
        signup: .init(
            tagline: "Uyarlanabilir Tıp Öğrenme Platformu", title: "Hesabınızı oluşturun",
            subtitle: "Alıştırmaya başlamak için kaydolun", fullNameLabel: "Ad soyad",
            fullNamePlaceholder: "Ayşe Yılmaz", emailLabel: "E-posta adresi",
            emailPlaceholder: "siz@ornek.com", passwordLabel: "Parola",
            passwordPlaceholder: "••••••••", createAccount: "Hesap oluştur",
            creating: "Hesap oluşturuluyor…", or: "veya", haveAccount: "Zaten hesabınız var mı?",
            signIn: "Giriş yap", errorConflict: "Bu e-posta ile kayıtlı bir hesap zaten var.",
            errorValidation: "Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
            errorGeneric: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
            vFullNameRequired: "Ad soyad gereklidir",
            vEmailInvalid: "Geçerli bir e-posta adresi girin", vPasswordRequired: "Parola gereklidir"
        ),
        register: .init(
            title: "Hesabınızı oluşturun", subtitle: "Kurumunuzun Rono çalışma alanını başlatın",
            fullNameLabel: "Ad soyad", fullNamePlaceholder: "Dr. Ayşe Yılmaz",
            emailLabel: "İş e-postası", emailPlaceholder: "siz@kurum.edu.tr",
            passwordLabel: "Parola",
            passwordHint: "Büyük harf, küçük harf ve rakam içeren en az 8 karakter",
            institutionSection: "Kurum", institutionNameLabel: "Kurum adı",
            institutionNamePlaceholder: "Tıp Üniversitesi", slugLabel: "URL kısa adı",
            slugPlaceholder: "tip-universitesi",
            slugHint: "Benzersiz tanımlayıcı, yalnızca küçük harf ve tire",
            createAccount: "Hesap oluştur", creating: "Hesap oluşturuluyor…",
            haveAccount: "Zaten hesabınız var mı?", signIn: "Giriş yap",
            errorConflict: "Bu e-posta ile kayıtlı bir hesap zaten var.",
            errorValidation: "Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
            errorGeneric: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
            vFullNameMin: "Ad soyad en az 2 karakter olmalıdır",
            vEmailInvalid: "Geçerli bir e-posta adresi girin",
            vPasswordMin: "Parola en az 8 karakter olmalıdır",
            vPasswordUpper: "Bir büyük harf içermelidir",
            vPasswordLower: "Bir küçük harf içermelidir",
            vPasswordNumber: "Bir rakam içermelidir",
            vInstitutionNameMin: "Kurum adı gereklidir",
            vSlugMin: "Kısa ad en az 2 karakter olmalıdır",
            vSlugMax: "Kısa ad en fazla 40 karakter olabilir",
            vSlugFormat: "Kısa ad yalnızca küçük harf, rakam ve tire içerebilir"
        )
    )
}

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

    static let fa = AuthStrings(
        login: .init(
            tagline: "همراه هوشمند آمادگی آزمون استخدامی", title: "خوش اومدی",
            subtitle: "وارد شو تا به داشبوردت برسی", emailLabel: "ایمیل",
            emailPlaceholder: "you@example.com", passwordLabel: "رمز عبور",
            forgotPassword: "رمزت رو فراموش کردی؟", signIn: "ورود", signingIn: "در حال ورود…",
            or: "یا", noAccount: "هنوز حساب نداری؟", createOne: "یکی بساز",
            errorInvalid: "ایمیل یا رمز عبور درست نیست.",
            errorGeneric: "یه مشکلی پیش اومد. لطفاً دوباره امتحان کن.",
            vEmailInvalid: "یک ایمیل معتبر وارد کن", vPasswordRequired: "وارد کردن رمز عبور لازمه"
        ),
        signup: .init(
            tagline: "همراه هوشمند آمادگی آزمون استخدامی", title: "حسابت رو بساز",
            subtitle: "ثبت‌نام کن تا تمرین رو شروع کنی", fullNameLabel: "نام و نام خانوادگی",
            fullNamePlaceholder: "زهرا محمدی", emailLabel: "ایمیل",
            emailPlaceholder: "you@example.com", passwordLabel: "رمز عبور",
            passwordPlaceholder: "••••••••", createAccount: "ساخت حساب",
            creating: "در حال ساخت حساب…", or: "یا", haveAccount: "از قبل حساب داری؟",
            signIn: "ورود", errorConflict: "با این ایمیل قبلاً یک حساب ساخته شده.",
            errorValidation: "لطفاً اطلاعاتت رو بررسی کن و دوباره امتحان کن.",
            errorGeneric: "یه مشکلی پیش اومد. لطفاً دوباره امتحان کن.",
            vFullNameRequired: "وارد کردن نام و نام خانوادگی لازمه", vEmailInvalid: "یک ایمیل معتبر وارد کن",
            vPasswordRequired: "وارد کردن رمز عبور لازمه"
        ),
        register: .init(
            title: "حسابت رو بساز", subtitle: "فضای کاری رونو رو برای مجموعه‌ات راه‌اندازی کن",
            fullNameLabel: "نام و نام خانوادگی", fullNamePlaceholder: "زهرا محمدی",
            emailLabel: "ایمیل کاری", emailPlaceholder: "you@example.com",
            passwordLabel: "رمز عبور",
            passwordHint: "حداقل ۸ نویسه شامل حرف بزرگ، حرف کوچک و یک عدد",
            institutionSection: "مجموعه", institutionNameLabel: "نام مجموعه",
            institutionNamePlaceholder: "آموزشگاه آمادگی آزمون", slugLabel: "نشانی اختصاصی",
            slugPlaceholder: "amadegi-azmoon",
            slugHint: "شناسه یکتا، فقط با حروف کوچک و خط تیره",
            createAccount: "ساخت حساب", creating: "در حال ساخت حساب…",
            haveAccount: "از قبل حساب داری؟", signIn: "ورود",
            errorConflict: "با این ایمیل قبلاً یک حساب ساخته شده.",
            errorValidation: "لطفاً اطلاعاتت رو بررسی کن و دوباره امتحان کن.",
            errorGeneric: "یه مشکلی پیش اومد. لطفاً دوباره امتحان کن.",
            vFullNameMin: "نام و نام خانوادگی باید حداقل ۲ نویسه باشه",
            vEmailInvalid: "یک ایمیل معتبر وارد کن",
            vPasswordMin: "رمز عبور باید حداقل ۸ نویسه باشه",
            vPasswordUpper: "باید یک حرف بزرگ داشته باشه",
            vPasswordLower: "باید یک حرف کوچک داشته باشه",
            vPasswordNumber: "باید یک عدد داشته باشه",
            vInstitutionNameMin: "وارد کردن نام مجموعه لازمه",
            vSlugMin: "نشانی باید حداقل ۲ نویسه باشه",
            vSlugMax: "نشانی باید حداکثر ۴۰ نویسه باشه",
            vSlugFormat: "نشانی فقط می‌تونه شامل حروف کوچک، عدد و خط تیره باشه"
        )
    )
}

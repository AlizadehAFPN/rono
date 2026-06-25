import Foundation

/// Native-only intro carousel shown before login/register on first launch.
struct OnboardingStrings: Sendable {
    struct Slide: Sendable, Identifiable {
        let id: Int
        let systemImage: String
        let title: String
        let subtitle: String
    }
    let slides: [Slide]
    let skip, next, getStarted, logIn, signUp: String

    static let en = OnboardingStrings(
        slides: [
            .init(id: 0, systemImage: "brain.head.profile",
                  title: "Welcome to Rono",
                  subtitle: "Adaptive medical exam prep that learns with you."),
            .init(id: 1, systemImage: "target",
                  title: "Questions that adapt",
                  subtitle: "Every answer tunes difficulty to your real ability."),
            .init(id: 2, systemImage: "calendar.badge.clock",
                  title: "Remember more, for longer",
                  subtitle: "Daily Review brings cards back right before you'd forget."),
            .init(id: 3, systemImage: "chart.line.uptrend.xyaxis",
                  title: "See your progress",
                  subtitle: "Track mastery across topics and watch your ability grow."),
        ],
        skip: "Skip", next: "Next", getStarted: "Get started",
        logIn: "Log in", signUp: "Create account"
    )

    static let fa = OnboardingStrings(
        slides: [
            .init(id: 0, systemImage: "brain.head.profile",
                  title: "به رونو خوش اومدی",
                  subtitle: "آماده شدن برای آزمون استخدامی، ساده و همراه خودت."),
            .init(id: 1, systemImage: "target",
                  title: "سؤال‌های واقعی آزمون",
                  subtitle: "سؤال‌های اصلِ آزمون‌های قبلی رو بخون و تمرین کن."),
            .init(id: 2, systemImage: "calendar.badge.clock",
                  title: "بیشتر و موندگارتر یاد بگیر",
                  subtitle: "مرور روزانه سؤال‌ها رو درست قبل از اینکه یادت بره برمی‌گردونه."),
            .init(id: 3, systemImage: "chart.line.uptrend.xyaxis",
                  title: "پیشرفتت رو ببین",
                  subtitle: "تسلطت روی هر مبحث رو دنبال کن و رشدت رو تماشا کن."),
        ],
        skip: "رد کردن", next: "بعدی", getStarted: "شروع کنیم",
        logIn: "ورود", signUp: "ساخت حساب"
    )
}

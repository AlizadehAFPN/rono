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

    static let tr = OnboardingStrings(
        slides: [
            .init(id: 0, systemImage: "brain.head.profile",
                  title: "Rono'e hoş geldiniz",
                  subtitle: "Sizinle birlikte öğrenen uyarlanabilir tıp sınavı hazırlığı."),
            .init(id: 1, systemImage: "target",
                  title: "Size uyum sağlayan sorular",
                  subtitle: "Her yanıt, zorluğu gerçek seviyenize göre ayarlar."),
            .init(id: 2, systemImage: "calendar.badge.clock",
                  title: "Daha uzun süre hatırlayın",
                  subtitle: "Günlük Tekrar, tam unutmadan önce kartları geri getirir."),
            .init(id: 3, systemImage: "chart.line.uptrend.xyaxis",
                  title: "İlerlemenizi görün",
                  subtitle: "Konulardaki ustalığınızı izleyin, seviyenizin yükselişini görün."),
        ],
        skip: "Atla", next: "İleri", getStarted: "Başla",
        logIn: "Giriş yap", signUp: "Hesap oluştur"
    )
}

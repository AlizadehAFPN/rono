import SwiftUI

@main
struct RonoApp: App {
    @State private var themeStore = ThemeStore()
    @State private var localeStore = LocaleStore()
    @State private var auth = AuthStore()

    init() {
        AppFonts.register() // bundle Vazirmatn before any view renders
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(themeStore)
                .environment(localeStore)
                .environment(auth)
                .tint(Palette.primary)
                .preferredColorScheme(themeStore.theme.colorScheme)
                // Default every unstyled Text to Vazirmatn (explicit styles use the
                // Font.v* equivalents in DesignSystem/Typography.swift).
                .environment(\.font, .vBody)
                // Persian (RTL) ⇄ English (LTR): flip the whole UI with the locale.
                .environment(\.layoutDirection, localeStore.locale.layoutDirection)
                .task { await auth.bootstrap() }
        }
    }
}

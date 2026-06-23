import SwiftUI

@main
struct SynapseApp: App {
    @State private var themeStore = ThemeStore()
    @State private var localeStore = LocaleStore()
    @State private var auth = AuthStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(themeStore)
                .environment(localeStore)
                .environment(auth)
                .tint(Palette.primary)
                .preferredColorScheme(themeStore.theme.colorScheme)
                .task { await auth.bootstrap() }
        }
    }
}

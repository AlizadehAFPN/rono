import SwiftUI

/// Top-level router driven by `AuthStore.phase`:
/// loading → onboarding → unauthenticated (auth) → authenticated (app shell).
struct RootView: View {
    @Environment(AuthStore.self) private var auth

    var body: some View {
        ZStack {
            switch auth.phase {
            case .loading:
                LaunchView()
                    .transition(.opacity)
            case .onboarding:
                OnboardingView()
                    .transition(.opacity)
            case .unauthenticated:
                AuthFlowView()
                    .transition(.opacity)
            case .authenticated:
                AppShell()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.25), value: auth.phase)
    }
}

/// Branded splash while the session is restored — a soft brand glow with the
/// mark easing in, matching the web + Android launch screens.
struct LaunchView: View {
    @State private var appeared = false

    var body: some View {
        ZStack {
            // Soft brand glow behind the mark, mirroring the auth header.
            Circle()
                .fill(Palette.primary.opacity(0.12))
                .frame(width: 320, height: 320)
                .blur(radius: 90)

            VStack(spacing: Metric.padLg) {
                BrandMark(size: 76)
                    .scaleEffect(appeared ? 1 : 0.88)
                    .opacity(appeared ? 1 : 0)
                ProgressView()
                    .tint(Palette.primary)
                    .opacity(appeared ? 1 : 0)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .screenBackground()
        .onAppear {
            withAnimation(.spring(duration: 0.6)) { appeared = true }
        }
    }
}

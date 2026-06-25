import SwiftUI

enum AuthRoute: Hashable {
    case signup
    case register
}

/// Unauthenticated flow: Login at the root, pushing Signup / Register.
struct AuthFlowView: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            LoginView(path: $path)
                .navigationDestination(for: AuthRoute.self) { route in
                    switch route {
                    case .signup:   SignupView(path: $path)
                    case .register: RegisterView(path: $path)
                    }
                }
        }
    }
}

/// Shared header + scrollable card layout for all auth screens.
struct AuthScaffold<Content: View>: View {
    let tagline: String
    let title: String
    let subtitle: String
    @ViewBuilder var content: Content

    var body: some View {
        ScrollView {
            VStack(spacing: Metric.section) {
                HStack {
                    Spacer()
                    LanguagePill()
                }

                VStack(spacing: 16) {
                    BrandMark(size: 66)
                        .padding(.bottom, 2)
                    Text(tagline).eyebrowStyle()
                    VStack(spacing: 8) {
                        Text(title)
                            .font(.screenTitle)
                            .foregroundStyle(Palette.foreground)
                            .multilineTextAlignment(.center)
                        Text(subtitle)
                            .font(.vSubheadline)
                            .foregroundStyle(Palette.mutedForeground)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.top, 12)

                AppCard(padding: Metric.padLg) { content }
            }
            .padding(.horizontal, Metric.screen)
            .padding(.vertical, Metric.pad)
            .frame(maxWidth: 520)
            .frame(maxWidth: .infinity)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(
            // A soft brand glow behind the header for subtle depth.
            ZStack {
                Palette.background
                Circle()
                    .fill(Palette.primary.opacity(0.10))
                    .frame(width: 320, height: 320)
                    .blur(radius: 90)
                    .offset(y: -260)
            }
            .ignoresSafeArea()
        )
        .toolbarBackground(Palette.background, for: .navigationBar)
    }
}

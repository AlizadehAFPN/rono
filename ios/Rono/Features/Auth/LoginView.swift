import SwiftUI

struct LoginView: View {
    @Binding var path: NavigationPath
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc

    @State private var email = ""
    @State private var password = ""
    @State private var emailError: String?
    @State private var passwordError: String?
    @State private var formError: String?
    @State private var loading = false

    private var s: AuthStrings.Login { loc.t.auth.login }

    var body: some View {
        AuthScaffold(tagline: s.tagline, title: s.title, subtitle: s.subtitle) {
            VStack(spacing: Metric.pad) {
                if let formError { ErrorBanner(message: formError) }

                RonoField(
                    title: s.emailLabel, placeholder: s.emailPlaceholder, text: $email,
                    keyboard: .emailAddress, textContentType: .username, error: emailError
                )
                RonoField(
                    title: s.passwordLabel, placeholder: "••••••••", text: $password,
                    isSecure: true, textContentType: .password, error: passwordError
                )

                PrimaryButton(title: loading ? s.signingIn : s.signIn, loading: loading) {
                    Task { await submit() }
                }

                HStack(spacing: 4) {
                    Text(s.noAccount).foregroundStyle(Palette.mutedForeground)
                    Button(s.createOne) { path.append(AuthRoute.signup) }
                        .foregroundStyle(Palette.primary)
                }
                .font(.vSubheadline)

                Button(loc.t.auth.register.title) { path.append(AuthRoute.register) }
                    .font(.vFootnote)
                    .foregroundStyle(Palette.mutedForeground)
            }
        }
    }

    private func submit() async {
        emailError = nil; passwordError = nil; formError = nil
        var ok = true
        if !Validation.isValidEmail(email) { emailError = s.vEmailInvalid; ok = false }
        if password.isEmpty { passwordError = s.vPasswordRequired; ok = false }
        guard ok else { return }

        loading = true
        defer { loading = false }
        do {
            try await auth.login(email: email, password: password)
        } catch let e as APIError {
            formError = e.status == 401 ? s.errorInvalid : (e.detail.isEmpty ? s.errorGeneric : e.detail)
        } catch {
            formError = s.errorGeneric
        }
    }
}

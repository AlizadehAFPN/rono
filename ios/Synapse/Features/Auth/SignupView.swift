import SwiftUI

struct SignupView: View {
    @Binding var path: NavigationPath
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc

    @State private var fullName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var nameError: String?
    @State private var emailError: String?
    @State private var passwordError: String?
    @State private var formError: String?
    @State private var loading = false

    private var s: AuthStrings.Signup { loc.t.auth.signup }

    var body: some View {
        AuthScaffold(tagline: s.tagline, title: s.title, subtitle: s.subtitle) {
            VStack(spacing: Metric.pad) {
                if let formError { ErrorBanner(message: formError) }

                SynapseField(
                    title: s.fullNameLabel, placeholder: s.fullNamePlaceholder, text: $fullName,
                    textContentType: .name, autocapitalization: .words, error: nameError
                )
                SynapseField(
                    title: s.emailLabel, placeholder: s.emailPlaceholder, text: $email,
                    keyboard: .emailAddress, textContentType: .username, error: emailError
                )
                SynapseField(
                    title: s.passwordLabel, placeholder: s.passwordPlaceholder, text: $password,
                    isSecure: true, textContentType: .newPassword, error: passwordError
                )

                PrimaryButton(title: loading ? s.creating : s.createAccount, loading: loading) {
                    Task { await submit() }
                }

                HStack(spacing: 4) {
                    Text(s.haveAccount).foregroundStyle(Palette.mutedForeground)
                    Button(s.signIn) { path.removeLast(path.count) }
                        .foregroundStyle(Palette.primary)
                }
                .font(.subheadline)
            }
        }
        .navigationTitle(s.title)
        .navigationBarTitleDisplayMode(.inline)
    }

    private func submit() async {
        nameError = nil; emailError = nil; passwordError = nil; formError = nil
        var ok = true
        if fullName.trimmingCharacters(in: .whitespaces).isEmpty { nameError = s.vFullNameRequired; ok = false }
        if !Validation.isValidEmail(email) { emailError = s.vEmailInvalid; ok = false }
        if password.isEmpty { passwordError = s.vPasswordRequired; ok = false }
        guard ok else { return }

        loading = true
        defer { loading = false }
        do {
            try await auth.signup(email: email, password: password, fullName: fullName)
        } catch let e as APIError {
            switch e.status {
            case 409: formError = s.errorConflict
            case 422: formError = s.errorValidation
            default:  formError = e.detail.isEmpty ? s.errorGeneric : e.detail
            }
        } catch {
            formError = s.errorGeneric
        }
    }
}

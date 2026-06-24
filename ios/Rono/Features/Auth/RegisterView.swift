import SwiftUI

struct RegisterView: View {
    @Binding var path: NavigationPath
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc

    @State private var fullName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var institutionName = ""
    @State private var slug = ""
    @State private var slugEdited = false

    @State private var nameError: String?
    @State private var emailError: String?
    @State private var passwordError: String?
    @State private var institutionError: String?
    @State private var slugError: String?
    @State private var formError: String?
    @State private var loading = false

    private var s: AuthStrings.Register { loc.t.auth.register }

    var body: some View {
        AuthScaffold(tagline: loc.t.auth.login.tagline, title: s.title, subtitle: s.subtitle) {
            VStack(spacing: Metric.pad) {
                if let formError { ErrorBanner(message: formError) }

                RonoField(
                    title: s.fullNameLabel, placeholder: s.fullNamePlaceholder, text: $fullName,
                    textContentType: .name, autocapitalization: .words, error: nameError
                )
                RonoField(
                    title: s.emailLabel, placeholder: s.emailPlaceholder, text: $email,
                    keyboard: .emailAddress, textContentType: .username, error: emailError
                )
                RonoField(
                    title: s.passwordLabel, placeholder: "••••••••", text: $password,
                    isSecure: true, textContentType: .newPassword,
                    hint: s.passwordHint, error: passwordError
                )

                Divider().overlay(Palette.border)
                HStack {
                    Text(s.institutionSection)
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(Palette.mutedForeground)
                        .textCase(.uppercase)
                    Spacer()
                }

                RonoField(
                    title: s.institutionNameLabel, placeholder: s.institutionNamePlaceholder,
                    text: $institutionName, autocapitalization: .words, error: institutionError
                )
                .onChange(of: institutionName) { _, newValue in
                    if !slugEdited { slug = Validation.slugify(newValue) }
                }
                RonoField(
                    title: s.slugLabel, placeholder: s.slugPlaceholder, text: $slug,
                    hint: s.slugHint, error: slugError
                )
                .onChange(of: slug) { _, _ in slugEdited = true }

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
        nameError = nil; emailError = nil; passwordError = nil
        institutionError = nil; slugError = nil; formError = nil
        var ok = true

        if fullName.trimmingCharacters(in: .whitespaces).count < 2 { nameError = s.vFullNameMin; ok = false }
        if !Validation.isValidEmail(email) { emailError = s.vEmailInvalid; ok = false }
        if password.count < 8 { passwordError = s.vPasswordMin; ok = false }
        else if !Validation.hasUpper(password) { passwordError = s.vPasswordUpper; ok = false }
        else if !Validation.hasLower(password) { passwordError = s.vPasswordLower; ok = false }
        else if !Validation.hasDigit(password) { passwordError = s.vPasswordNumber; ok = false }
        if institutionName.trimmingCharacters(in: .whitespaces).isEmpty { institutionError = s.vInstitutionNameMin; ok = false }
        if slug.count < 2 { slugError = s.vSlugMin; ok = false }
        else if slug.count > 40 { slugError = s.vSlugMax; ok = false }
        else if !Validation.isValidSlug(slug) { slugError = s.vSlugFormat; ok = false }
        guard ok else { return }

        loading = true
        defer { loading = false }
        do {
            try await auth.register(.init(
                email: email, password: password, fullName: fullName,
                institutionName: institutionName, institutionSlug: slug
            ))
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

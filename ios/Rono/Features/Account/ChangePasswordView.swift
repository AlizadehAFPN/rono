import SwiftUI

struct ChangePasswordView: View {
    @Environment(LocaleStore.self) private var loc
    @Environment(\.dismiss) private var dismiss

    @State private var current = ""
    @State private var next = ""
    @State private var confirm = ""
    @State private var error: String?
    @State private var success = false
    @State private var loading = false

    private var s: SettingsStrings.Password { loc.t.settings.password }

    var body: some View {
        Form {
            if success {
                Section {
                    Label(s.changed, systemImage: "checkmark.seal.fill")
                        .foregroundStyle(Palette.studySuccess)
                }
            }
            Section {
                SecureField(s.current, text: $current).textContentType(.password)
                SecureField(s.next, text: $next).textContentType(.newPassword)
                SecureField(s.confirm, text: $confirm).textContentType(.newPassword)
            } footer: {
                Text(error ?? s.rules)
                    .foregroundStyle(error == nil ? Palette.mutedForeground : Palette.destructive)
            }
            Section {
                Button {
                    Task { await submit() }
                } label: {
                    HStack {
                        if loading { ProgressView() }
                        Text(loading ? s.changing : s.change)
                    }
                }
                .disabled(loading || current.isEmpty || next.isEmpty || confirm.isEmpty)
            }
        }
        .navigationTitle(s.title)
        .navigationBarTitleDisplayMode(.inline)
        .listRowBackground(Palette.card)
        .ronoScreen()
    }

    private func submit() async {
        error = nil; success = false
        guard next == confirm else { error = s.mismatch; Haptics.error(); return }
        guard next.count >= 8, Validation.hasUpper(next), Validation.hasLower(next),
              Validation.hasDigit(next) else { error = s.rules; Haptics.error(); return }

        loading = true; defer { loading = false }
        do {
            try await AuthAPI.changePassword(.init(currentPassword: current, newPassword: next))
            success = true; Haptics.success()
            current = ""; next = ""; confirm = ""
        } catch let e as APIError {
            error = e.detail.isEmpty ? s.failed : e.detail; Haptics.error()
        } catch {
            self.error = s.failed; Haptics.error()
        }
    }
}

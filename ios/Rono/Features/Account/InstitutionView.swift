import SwiftUI

struct InstitutionView: View {
    @Environment(LocaleStore.self) private var loc

    @State private var institution: Institution?
    @State private var name = ""
    @State private var domain = ""
    @State private var loading = true
    @State private var saving = false
    @State private var message: (text: String, ok: Bool)?

    private var s: SettingsStrings.Institution { loc.t.settings.institution }

    var body: some View {
        Form {
            if let message {
                Section {
                    Label(message.text, systemImage: message.ok ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                        .foregroundStyle(message.ok ? Palette.studySuccess : Palette.destructive)
                }
            }
            Section {
                TextField(s.namePh, text: $name)
                TextField(s.domainPh, text: $domain)
                    .keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
            } header: {
                Text(s.heading)
            } footer: {
                Text(s.description)
            }

            if let inst = institution {
                Section {
                    LabeledContent(s.slugLabel, value: inst.slug)
                    LabeledContent(s.tierLabel, value: inst.subscriptionTier.capitalized)
                }
            }

            Section {
                Button {
                    Task { await save() }
                } label: {
                    HStack { if saving { ProgressView() }; Text(saving ? s.saving : s.save) }
                }
                .disabled(saving || loading)
            }
        }
        .navigationTitle(s.heading)
        .navigationBarTitleDisplayMode(.inline)
        .listRowBackground(Palette.card)
        .ronoScreen()
        .overlay { if loading { ProgressView() } }
        .task { await load() }
    }

    private func load() async {
        loading = true; defer { loading = false }
        do {
            let inst = try await InstitutionAPI.get()
            institution = inst; name = inst.name; domain = inst.domain ?? ""
        } catch let e as APIError {
            message = (e.detail.isEmpty ? s.error : e.detail, false)
        } catch { message = (s.error, false) }
    }

    private func save() async {
        saving = true; defer { saving = false }
        do {
            let updated = try await InstitutionAPI.update(.init(name: name, domain: domain.isEmpty ? nil : domain))
            institution = updated
            message = (s.saved, true); Haptics.success()
        } catch let e as APIError {
            message = (e.detail.isEmpty ? s.saveFailed : e.detail, false); Haptics.error()
        } catch { message = (s.saveFailed, false); Haptics.error() }
    }
}

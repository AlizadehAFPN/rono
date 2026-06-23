import SwiftUI

struct SettingsView: View {
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc
    @Environment(ThemeStore.self) private var theme

    private var s: SettingsStrings { loc.t.settings }

    var body: some View {
        Form {
            // ── Appearance ──
            Section {
                themeRow(.light, title: s.theme.light.label, desc: s.theme.light.desc, icon: "sun.max.fill")
                themeRow(.dark, title: s.theme.dark.label, desc: s.theme.dark.desc, icon: "moon.fill")
                themeRow(.system, title: s.theme.system.label, desc: s.theme.system.desc, icon: "circle.lefthalf.filled")
            } header: {
                Text(s.theme.title)
            } footer: {
                Text(s.theme.description)
            }

            // ── Language ──
            Section {
                ForEach(AppLocale.allCases, id: \.self) { l in
                    selectRow(title: l.native, selected: loc.locale == l) {
                        Haptics.select()
                        loc.locale = l
                        Task { try? await AuthAPI.updateProfile(.init(locale: l.rawValue)) }
                    }
                }
            } header: {
                Text(s.language.title)
            } footer: {
                Text(s.language.description)
            }

            // ── Account & security ──
            Section {
                LabeledContent(s.account.emailLabel, value: auth.user?.email ?? "")
                NavigationLink {
                    ChangePasswordView()
                } label: {
                    Label(s.password.title, systemImage: "key.fill")
                }
                NavigationLink {
                    SessionsView()
                } label: {
                    Label(s.sessions.title, systemImage: "laptopcomputer.and.iphone")
                }
            } header: {
                Text(s.account.heading)
            } footer: {
                Text(s.account.emailHint)
            }

            // ── Institution (admin) ──
            if auth.role?.isAdmin == true {
                Section(s.institution.heading) {
                    NavigationLink {
                        InstitutionView()
                    } label: {
                        Label(s.institution.heading, systemImage: "building.2.fill")
                    }
                }
            }
        }
        .navigationTitle(s.pageTitle)
        .navigationBarTitleDisplayMode(.inline)
        .listRowBackground(Palette.card)
        .synapseScreen()
    }

    private func themeRow(_ value: AppTheme, title: String, desc: String, icon: String) -> some View {
        selectRow(title: title, subtitle: desc, icon: icon, selected: theme.theme == value) {
            Haptics.select()
            withAnimation(.snappy) { theme.theme = value }
        }
    }

    @ViewBuilder
    private func selectRow(
        title: String, subtitle: String? = nil, icon: String? = nil,
        selected: Bool, action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                if let icon {
                    Image(systemName: icon)
                        .foregroundStyle(selected ? Palette.primary : Palette.mutedForeground)
                        .frame(width: 24)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).foregroundStyle(Palette.foreground)
                    if let subtitle {
                        Text(subtitle).font(.caption).foregroundStyle(Palette.mutedForeground)
                    }
                }
                Spacer()
                if selected {
                    Image(systemName: "checkmark")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(Palette.primary)
                        .transition(.scale.combined(with: .opacity))
                }
            }
        }
    }
}

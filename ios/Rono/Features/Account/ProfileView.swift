import SwiftUI
import PhotosUI
import UIKit

struct ProfileView: View {
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc

    @State private var fullName = ""
    @State private var preferredName = ""
    @State private var photoItem: PhotosPickerItem?
    @State private var saving = false
    @State private var avatarBusy = false
    @State private var message: (text: String, ok: Bool)?
    @State private var progress: ProgressOut?
    @State private var dash: StudentDashboardOut?

    private var p: ProfileStrings { loc.t.profile }
    private var user: UserOut? { auth.user }

    var body: some View {
        Form {
            // ── Header: avatar + name ──
            Section {
                VStack(spacing: 14) {
                    ZStack(alignment: .bottomTrailing) {
                        AvatarView(url: user?.avatarUrl, initials: user?.initials ?? "?", size: 96)
                        PhotosPicker(selection: $photoItem, matching: .images) {
                            Image(systemName: "camera.fill")
                                .font(.footnote.weight(.bold))
                                .foregroundStyle(Palette.primaryForeground)
                                .padding(8)
                                .background(Palette.primary, in: Circle())
                                .overlay(Circle().stroke(Palette.card, lineWidth: 2))
                        }
                        .disabled(avatarBusy)
                    }
                    Text(user?.displayName ?? "")
                        .font(.title3.bold())
                        .foregroundStyle(Palette.foreground)
                    if let role = auth.role {
                        Text(loc.t.roleLabel(role.rawValue))
                            .font(.caption.weight(.medium))
                            .foregroundStyle(Palette.primary)
                            .padding(.horizontal, 10).padding(.vertical, 4)
                            .background(Palette.primary.opacity(0.12), in: Capsule())
                    }
                    if user?.avatarUrl != nil {
                        Button(role: .destructive) {
                            Task { await removeAvatar() }
                        } label: {
                            Text(avatarBusy ? p.avatar.removing : p.avatar.remove).font(.footnote)
                        }
                        .disabled(avatarBusy)
                    }
                }
                .frame(maxWidth: .infinity)
                .listRowBackground(Color.clear)
            }

            if let message {
                Section {
                    Label(message.text, systemImage: message.ok ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                        .foregroundStyle(message.ok ? Palette.studySuccess : Palette.destructive)
                }
            }

            // ── Edit personal details ──
            Section {
                TextField(p.edit.fullNamePh, text: $fullName).textContentType(.name)
                TextField(p.edit.preferredNamePh, text: $preferredName)
                Button {
                    Task { await save() }
                } label: {
                    HStack { if saving { ProgressView() }; Text(saving ? p.edit.saving : p.edit.save) }
                }
                .disabled(saving)
            } header: {
                Text(p.edit.title)
            } footer: {
                Text(p.edit.preferredNameHint)
            }

            // ── Identity ──
            Section(p.pageTitle) {
                if let role = auth.role {
                    LabeledContent(p.identity.role, value: loc.t.roleLabel(role.rawValue))
                }
                LabeledContent(p.identity.memberSince,
                               value: user?.createdAt.formatted(date: .abbreviated, time: .omitted) ?? "—")
                LabeledContent(p.identity.lastLogin,
                               value: user?.lastLoginAt?.formatted(date: .abbreviated, time: .shortened) ?? p.identity.never)
                LabeledContent("Email", value: user?.email ?? "")
                HStack {
                    Image(systemName: user?.emailVerifiedAt != nil ? "checkmark.seal.fill" : "exclamationmark.circle")
                        .foregroundStyle(user?.emailVerifiedAt != nil ? Palette.studySuccess : Palette.studyWarning)
                    Text(user?.emailVerifiedAt != nil ? p.identity.emailVerified : p.identity.emailUnverified)
                        .font(.subheadline)
                }
            }

            learningState
        }
        .navigationTitle(p.pageTitle)
        .navigationBarTitleDisplayMode(.inline)
        .listRowBackground(Palette.card)
        .ronoScreen()
        .onAppear(perform: syncFields)
        .task { await loadState() }
        .onChange(of: photoItem) { _, newItem in
            guard let newItem else { return }
            Task { await uploadAvatar(newItem) }
        }
    }

    // MARK: - Learning state (θ ability, stats, mastery, sessions)

    @ViewBuilder private var learningState: some View {
        let st = p.state
        if let pr = progress, pr.totalResponses > 0 {
            // Ability
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(String(format: "%.2f", pr.globalTheta ?? 0))
                            .font(.system(size: 34, weight: .bold, design: .rounded))
                            .foregroundStyle(Palette.primary)
                        Text("θ").foregroundStyle(Palette.mutedForeground)
                        Spacer()
                        Pill(text: st.ability.interpret[interpretKey(pr.globalTheta ?? 0)] ?? "",
                             color: Palette.primary)
                    }
                    Text(st.ability.interpretHint[interpretKey(pr.globalTheta ?? 0)] ?? "")
                        .font(.caption).foregroundStyle(Palette.mutedForeground)
                    Text("\(st.ability.confidenceLabel): \(st.ability.confidence[confidenceKey(pr.globalThetaSe)] ?? "")")
                        .font(.caption2).foregroundStyle(Palette.mutedForeground)
                }
            } header: { Text(st.ability.label) } footer: { Text(st.ability.help) }

            // Stats
            Section(st.title) {
                LabeledContent(st.stats.answered, value: "\(pr.totalResponses)")
                LabeledContent(st.stats.correct, value: "\(pr.totalCorrect)")
                LabeledContent(st.stats.accuracy, value: pr.accuracy != nil ? "\(Int(pr.accuracy! * 100))%" : "—")
                if let d = dash {
                    LabeledContent(st.stats.reviewDue, value: "\(d.dueNow)")
                    LabeledContent(st.stats.newAvailable, value: "\(d.libraryNew)")
                }
            }

            // Mastery by topic
            if !pr.topics.isEmpty {
                Section(st.mastery.title) {
                    ForEach(pr.topics) { topic in
                        VStack(alignment: .leading, spacing: 5) {
                            HStack {
                                Text(topic.topicName).font(.subheadline).lineLimit(1)
                                Spacer()
                                Text("\(topic.correctResponses)/\(topic.totalResponses)")
                                    .font(.caption2.monospacedDigit()).foregroundStyle(Palette.mutedForeground)
                            }
                            ProgressView(value: topic.accuracyRate ?? 0).tint(Palette.primary)
                        }
                    }
                }
            }
        } else if progress != nil {
            Section { Text(st.empty).font(.subheadline).foregroundStyle(Palette.mutedForeground) }
                header: { Text(st.title) }
        }
    }

    private func interpretKey(_ theta: Double) -> String {
        if theta < -0.5 { return "building" }
        if theta < 0 { return "developing" }
        if theta < 1 { return "solid" }
        return "advanced"
    }
    private func confidenceKey(_ se: Double?) -> String {
        guard let se else { return "building" }
        if se > 0.6 { return "building" }
        if se > 0.35 { return "medium" }
        return "high"
    }

    private func loadState() async {
        async let pr = try? ProgressAPI.progress()
        async let d = try? ProgressAPI.dashboard()
        progress = await pr
        dash = await d
    }

    private func syncFields() {
        fullName = user?.fullName ?? ""
        preferredName = user?.preferredName ?? ""
    }

    private func save() async {
        saving = true; defer { saving = false }
        do {
            let me = try await AuthAPI.updateProfile(.init(
                fullName: fullName,
                preferredName: preferredName.isEmpty ? nil : preferredName
            ))
            auth.adopt(me)
            message = (p.edit.saved, true); Haptics.success()
        } catch let e as APIError {
            message = (e.detail.isEmpty ? p.edit.saveFailed : e.detail, false); Haptics.error()
        } catch { message = (p.edit.saveFailed, false); Haptics.error() }
    }

    private func uploadAvatar(_ item: PhotosPickerItem) async {
        avatarBusy = true; defer { avatarBusy = false; photoItem = nil }
        do {
            guard let data = try await item.loadTransferable(type: Data.self) else { return }
            guard data.count <= 5 * 1024 * 1024 else { message = (p.avatar.tooLarge, false); Haptics.error(); return }
            guard imageMime(data) != nil else { message = (p.avatar.badType, false); Haptics.error(); return }
            let uploadData = downsampledAvatarData(from: data) ?? data
            let mime = imageMime(uploadData) ?? "image/jpeg"
            let me = try await AuthAPI.uploadAvatar(data: uploadData, filename: "avatar", mime: mime)
            auth.adopt(me)
            message = (p.avatar.uploaded, true); Haptics.success()
        } catch let e as APIError {
            message = (e.detail.isEmpty ? p.avatar.uploadFailed : e.detail, false); Haptics.error()
        } catch { message = (p.avatar.uploadFailed, false); Haptics.error() }
    }

    private func removeAvatar() async {
        avatarBusy = true; defer { avatarBusy = false }
        do {
            let me = try await AuthAPI.deleteAvatar()
            auth.adopt(me)
            message = (p.avatar.removed, true); Haptics.success()
        } catch { message = (p.avatar.removeFailed, false); Haptics.error() }
    }

    /// Detect a supported image MIME from magic bytes.
    private func imageMime(_ data: Data) -> String? {
        guard let first = data.first else { return nil }
        switch first {
        case 0xFF: return "image/jpeg"
        case 0x89: return "image/png"
        case 0x47: return "image/gif"
        case 0x52: return "image/webp" // RIFF/WEBP
        default:   return nil
        }
    }

    private func downsampledAvatarData(from data: Data) -> Data? {
        guard let image = UIImage(data: data) else { return nil }
        let maxSide: CGFloat = 512
        let longest = max(image.size.width, image.size.height)
        guard longest > maxSide else { return data }

        let scale = maxSide / longest
        let target = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: target, format: format)
        let resized = renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: target))
        }
        return resized.jpegData(compressionQuality: 0.85)
    }
}

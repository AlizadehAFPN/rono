import SwiftUI

// MARK: - Brand mark

/// The rounded-square Rono app-icon logo used on auth + onboarding: the
/// "hourglass" rono graph mark on the brand gradient. Matches the raster app
/// icons and the web `LogoMark` — keep the node geometry in `RonoGlyph` in
/// sync with `frontend/scripts/generate-icons.mjs` and `logo.tsx`.
struct BrandMark: View {
    var size: CGFloat = 56
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.28, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Palette.primary, Palette.primary.opacity(0.82)],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
            RonoGlyph(color: Palette.primaryForeground)
                .frame(width: size * 0.58, height: size * 0.58)
        }
        .frame(width: size, height: size)
        .shadow(color: Palette.primary.opacity(0.35), radius: size * 0.22, y: size * 0.1)
    }
}

/// The bare brand mark — four corner nodes + a center hub joined by a top bar,
/// a bottom bar, and two crossing diagonals. Drawn on a normalised 100×100 grid
/// so it scales to any frame. Use directly for a tinted, background-less mark.
struct RonoGlyph: View {
    var color: Color = Palette.primary

    // Node coordinates on a 0…100 grid (shared with web + icon generator).
    private static let nodes: [(x: CGFloat, y: CGFloat, r: CGFloat)] = [
        (22, 24, 7), (78, 24, 7), (22, 76, 7), (78, 76, 7), (50, 50, 6.5),
    ]
    private static let edges: [(CGFloat, CGFloat, CGFloat, CGFloat)] = [
        (22, 24, 78, 24), (22, 76, 78, 76), (22, 24, 78, 76), (78, 24, 22, 76),
    ]

    var body: some View {
        Canvas { ctx, size in
            let u = size.width / 100
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x * u, y: y * u) }

            var lines = Path()
            for (x1, y1, x2, y2) in Self.edges {
                lines.move(to: pt(x1, y1))
                lines.addLine(to: pt(x2, y2))
            }
            ctx.stroke(
                lines, with: .color(color),
                style: StrokeStyle(lineWidth: 9 * u, lineCap: .round, lineJoin: .round)
            )

            for n in Self.nodes {
                let r = n.r * u
                let c = pt(n.x, n.y)
                ctx.fill(
                    Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: r * 2, height: r * 2)),
                    with: .color(color)
                )
            }
        }
        .aspectRatio(1, contentMode: .fit)
    }
}

// MARK: - Screen background

private struct ScreenBackground: ViewModifier {
    func body(content: Content) -> some View {
        content.background(Palette.background.ignoresSafeArea())
    }
}

extension View {
    /// Apply the app's page background.
    func screenBackground() -> some View { modifier(ScreenBackground()) }

    /// The single, unified screen chrome — used by EVERY screen so the app feels
    /// like one app: navy page background (also under Lists/Forms), and a
    /// consistent navy navigation bar. Pair with `.navigationTitle` +
    /// a consistent `.navigationBarTitleDisplayMode`.
    func ronoScreen() -> some View {
        self
            .scrollContentBackground(.hidden)
            .background(Palette.background.ignoresSafeArea())
            .toolbarBackground(Palette.background, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
    }

    /// Uniform gap between an inline nav title and the first content, applied to
    /// EVERY scrollable screen regardless of container (ScrollView / List /
    /// Form) so the title→content spacing is identical app-wide. Replaces
    /// ad-hoc per-screen `.padding(.top, …)`.
    func screenContentTop() -> some View {
        contentMargins(.top, Metric.contentTop, for: .scrollContent)
    }
}

// MARK: - Press feedback

/// Subtle, premium press feedback — a slight scale + dim. No bounce, no gimmick.
struct PressableStyle: ButtonStyle {
    var scale: CGFloat = 0.97
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scale : 1)
            .opacity(configuration.isPressed ? 0.92 : 1)
            .animation(.snappy(duration: 0.16), value: configuration.isPressed)
    }
}

// MARK: - Card

/// The standard elevated surface. Hairline border + soft, theme-aware shadow for
/// real depth — the foundation of the app's calm, premium feel.
struct AppCard<Content: View>: View {
    var padding: CGFloat = 18
    var elevated: Bool = true
    @ViewBuilder var content: Content
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: Metric.card, style: .continuous)
                    .fill(Palette.card)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Metric.card, style: .continuous)
                    .strokeBorder(Palette.border.opacity(0.6), lineWidth: 0.75)
            )
            .modifier(ConditionalShadow(on: elevated, scheme: scheme))
    }
}

private struct ConditionalShadow: ViewModifier {
    let on: Bool
    let scheme: ColorScheme
    func body(content: Content) -> some View {
        if on { content.cardShadow(scheme) } else { content }
    }
}

// MARK: - Text field

struct RonoField: View {
    let title: String
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var keyboard: UIKeyboardType = .default
    var textContentType: UITextContentType?
    var autocapitalization: TextInputAutocapitalization = .never
    var hint: String?
    var error: String?

    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Palette.foreground)

            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
            }
            .focused($focused)
            .textInputAutocapitalization(autocapitalization)
            .autocorrectionDisabled()
            .keyboardType(keyboard)
            .textContentType(textContentType)
            .font(.body)
            .foregroundStyle(Palette.foreground)
            .padding(.horizontal, 15)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: Metric.control, style: .continuous)
                    .fill(focused ? Palette.card : Palette.secondary.opacity(0.5))
            )
            .overlay(
                RoundedRectangle(cornerRadius: Metric.control, style: .continuous)
                    .strokeBorder(borderColor, lineWidth: focused ? 2 : 1)
            )
            .animation(.snappy(duration: 0.15), value: focused)

            if let error {
                Label(error, systemImage: "exclamationmark.circle.fill")
                    .font(.caption)
                    .foregroundStyle(Palette.destructive)
                    .transition(.opacity)
            } else if let hint {
                Text(hint).font(.caption).foregroundStyle(Palette.mutedForeground)
            }
        }
    }

    private var borderColor: Color {
        if error != nil { return Palette.destructive }
        return focused ? Palette.ring : Palette.border.opacity(0.6)
    }
}

// MARK: - Buttons

struct PrimaryButton: View {
    let title: String
    var icon: String?
    var loading: Bool = false
    var enabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: { Haptics.tap(); action() }) {
            HStack(spacing: 8) {
                if loading {
                    ProgressView().tint(Palette.primaryForeground).controlSize(.small)
                } else if let icon {
                    Image(systemName: icon).font(.body.weight(.semibold))
                }
                Text(title).font(.body.weight(.semibold))
            }
            .frame(maxWidth: .infinity)
            .frame(height: Metric.buttonHeight)
            .foregroundStyle(Palette.primaryForeground)
            .background(
                RoundedRectangle(cornerRadius: Metric.control, style: .continuous)
                    .fill(Palette.primary)
                    .opacity(enabled && !loading ? 1 : 0.45)
            )
            .shadow(color: Palette.primary.opacity(enabled && !loading ? 0.3 : 0), radius: 10, y: 4)
        }
        .buttonStyle(PressableStyle())
        .disabled(!enabled || loading)
    }
}

struct SecondaryButton: View {
    let title: String
    var systemImage: String?
    let action: () -> Void

    var body: some View {
        Button(action: { Haptics.tap(); action() }) {
            HStack(spacing: 8) {
                if let systemImage { Image(systemName: systemImage) }
                Text(title).font(.body.weight(.medium))
            }
            .frame(maxWidth: .infinity)
            .frame(height: Metric.buttonHeight)
            .foregroundStyle(Palette.foreground)
            .background(
                RoundedRectangle(cornerRadius: Metric.control, style: .continuous)
                    .fill(Palette.secondary)
            )
        }
        .buttonStyle(PressableStyle())
    }
}

// MARK: - Inline error banner

struct ErrorBanner: View {
    let message: String
    var body: some View {
        HStack(spacing: 9) {
            Image(systemName: "exclamationmark.triangle.fill")
            Text(message).font(.footnote)
            Spacer(minLength: 0)
        }
        .foregroundStyle(Palette.destructive)
        .padding(13)
        .background(
            RoundedRectangle(cornerRadius: Metric.control, style: .continuous)
                .fill(Palette.destructive.opacity(0.12))
        )
    }
}

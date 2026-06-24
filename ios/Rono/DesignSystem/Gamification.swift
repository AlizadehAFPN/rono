import SwiftUI

// MARK: - Progress ring

/// Animated circular progress ring with an optional center label.
struct ProgressRing<Center: View>: View {
    var progress: Double            // 0...1
    var size: CGFloat = 120
    var lineWidth: CGFloat = 12
    var tint: Color = Palette.primary
    var track: Color = Palette.secondary
    @ViewBuilder var center: Center

    var body: some View {
        ZStack {
            Circle()
                .stroke(track, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
            Circle()
                .trim(from: 0, to: max(0.001, min(progress, 1)))
                .stroke(
                    AngularGradient(colors: [tint.opacity(0.7), tint], center: .center),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.spring(duration: 0.6), value: progress)
            center
        }
        .frame(width: size, height: size)
    }
}

extension ProgressRing where Center == EmptyView {
    init(progress: Double, size: CGFloat = 120, lineWidth: CGFloat = 12,
         tint: Color = Palette.primary, track: Color = Palette.secondary) {
        self.init(progress: progress, size: size, lineWidth: lineWidth,
                  tint: tint, track: track) { EmptyView() }
    }
}

// MARK: - Stat tile

/// Compact metric card: icon chip, big rounded value, label. Native, premium.
struct StatTile: View {
    let icon: String
    let value: String
    let label: String
    var tint: Color = Palette.primary
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 9, style: .continuous)
                    .fill(tint.opacity(0.14))
                    .frame(width: 32, height: 32)
                Image(systemName: icon).font(.footnote.weight(.semibold)).foregroundStyle(tint)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.metricLarge)
                    .foregroundStyle(Palette.foreground)
                    .contentTransition(.numericText())
                    .lineLimit(1).minimumScaleFactor(0.7)
                Text(label)
                    .font(.caption)
                    .foregroundStyle(Palette.mutedForeground)
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: Metric.radiusLg, style: .continuous).fill(Palette.card)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Metric.radiusLg, style: .continuous)
                .strokeBorder(Palette.border.opacity(0.6), lineWidth: 0.75)
        )
        .cardShadow(scheme)
    }
}

// MARK: - Streak badge

/// Day-streak indicator with a flame. Static by design — no perpetual animation.
struct StreakBadge: View {
    let days: Int

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "flame.fill")
                .foregroundStyle(
                    LinearGradient(colors: [Palette.chart4, Palette.studyDanger],
                                   startPoint: .bottom, endPoint: .top)
                )
            Text("\(days)")
                .font(.subheadline.bold())
                .foregroundStyle(Palette.foreground)
                .contentTransition(.numericText())
        }
        .padding(.horizontal, 10).padding(.vertical, 6)
        .background(Palette.chart4.opacity(0.12), in: Capsule())
    }
}

// MARK: - Confetti

/// Lightweight confetti burst, triggered by toggling `fire`.
struct ConfettiView: View {
    @Binding var fire: Bool
    var count: Int = 80

    @State private var pieces: [Piece] = []

    struct Piece: Identifiable {
        let id = UUID()
        var x: CGFloat
        var y: CGFloat
        var rotation: Double
        var color: Color
        var size: CGFloat
    }

    private let colors: [Color] = [
        Palette.chart1, Palette.chart2, Palette.chart3, Palette.chart4, Palette.chart5,
    ]

    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(pieces) { piece in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(piece.color)
                        .frame(width: piece.size, height: piece.size * 0.5)
                        .rotationEffect(.degrees(piece.rotation))
                        .position(x: piece.x, y: piece.y)
                }
            }
            .onChange(of: fire) { _, new in
                if new { burst(in: geo.size) }
            }
            .allowsHitTesting(false)
        }
        .ignoresSafeArea()
    }

    private func burst(in size: CGSize) {
        pieces = (0..<count).map { _ in
            Piece(
                x: CGFloat.random(in: 0...size.width),
                y: -20,
                rotation: .random(in: 0...360),
                color: colors.randomElement()!,
                size: .random(in: 6...12)
            )
        }
        withAnimation(.easeIn(duration: 1.8)) {
            for i in pieces.indices {
                pieces[i].y = size.height + 40
                pieces[i].x += CGFloat.random(in: -60...60)
                pieces[i].rotation += .random(in: 180...720)
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            pieces = []
            fire = false
        }
    }
}

// MARK: - Pill / chip

struct Pill: View {
    let text: String
    var icon: String?
    var color: Color = Palette.primary
    var filled: Bool = false

    var body: some View {
        HStack(spacing: 5) {
            if let icon { Image(systemName: icon).font(.caption2) }
            Text(text).font(.caption.weight(.medium))
        }
        .foregroundStyle(filled ? Palette.primaryForeground : color)
        .padding(.horizontal, 10).padding(.vertical, 5)
        .background(filled ? color : color.opacity(0.12), in: Capsule())
    }
}

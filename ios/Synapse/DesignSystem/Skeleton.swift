import SwiftUI

// MARK: - Skeleton primitives
//
// One small, shared toolkit so every API-backed screen shows a placeholder that
// mirrors its own first frame (not a generic spinner). Per-screen skeletons live
// here too, composed from these primitives, to keep the loading look consistent.

/// A muted placeholder block. `width == nil` fills the available width.
struct SkeletonBar: View {
    var width: CGFloat? = nil
    var height: CGFloat = 12
    var radius: CGFloat = 6
    var body: some View {
        RoundedRectangle(cornerRadius: radius, style: .continuous)
            .fill(Palette.secondary)
            .frame(maxWidth: width == nil ? .infinity : nil, alignment: .leading)
            .frame(width: width, height: height)
    }
}

/// A subtle left-to-right shimmer. Apply once to the composed skeleton root.
private struct Shimmer: ViewModifier {
    @State private var x: CGFloat = -1
    func body(content: Content) -> some View {
        content
            .overlay {
                GeometryReader { geo in
                    LinearGradient(
                        colors: [.clear, Color.white.opacity(0.06), .clear],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(width: geo.size.width * 0.7)
                    .offset(x: x * geo.size.width * 1.7)
                }
                .blendMode(.plusLighter)
                .allowsHitTesting(false)
            }
            .onAppear {
                withAnimation(.easeInOut(duration: 1.15).repeatForever(autoreverses: false)) {
                    x = 1
                }
            }
    }
}

extension View {
    /// Wrap a placeholder layout: animated shimmer + the standard screen insets.
    func skeleton() -> some View {
        self
            .modifier(Shimmer())
            .padding(.horizontal, Metric.screen)
            .padding(.bottom, Metric.padLg)
            .frame(maxWidth: .infinity, alignment: .leading)
            .transition(.opacity)
    }
}

/// Stat tile placeholder (icon chip + value + label) — shared by the dashboard,
/// progress and staff skeletons.
struct SkeletonTile: View {
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 10) {
                RoundedRectangle(cornerRadius: Metric.radiusSm, style: .continuous)
                    .fill(Palette.secondary).frame(width: 30, height: 30)
                SkeletonBar(width: 38, height: 22)
                SkeletonBar(width: 56, height: 11)
            }
        }
    }
}

/// Generic card placeholder: a heading line plus N body lines.
struct SkeletonCard: View {
    var lines: Int = 3
    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 12) {
                SkeletonBar(width: 150, height: 16)
                ForEach(0..<lines, id: \.self) { i in
                    SkeletonBar(width: i == lines - 1 ? 180 : nil, height: 12)
                }
            }
        }
    }
}

// MARK: - Per-screen skeletons

/// Dashboard: ability ring + 3 stat tiles + review queue + mastery. (The
/// greeting is an inline nav title and the streak is a toolbar item, so both
/// appear instantly and aren't part of the skeleton.)
struct DashboardSkeleton: View {
    var body: some View {
        VStack(spacing: Metric.section) {
            AppCard {
                HStack(spacing: Metric.pad) {
                    Circle().fill(Palette.secondary).frame(width: 96, height: 96)
                    VStack(alignment: .leading, spacing: 10) {
                        SkeletonBar(width: 70, height: 11)
                        SkeletonBar(width: 130, height: 20)
                        SkeletonBar(width: 100, height: 13)
                    }
                    Spacer()
                }
            }
            HStack(spacing: 10) { SkeletonTile(); SkeletonTile(); SkeletonTile() }
            AppCard {
                HStack {
                    VStack(alignment: .leading, spacing: 8) {
                        SkeletonBar(width: 120, height: 16)
                        SkeletonBar(width: 80, height: 13)
                    }
                    Spacer()
                    SkeletonBar(width: 90, height: 14)
                }
            }
            SkeletonCard(lines: 3)
        }
        .skeleton()
    }
}

/// Study: the Daily Review banner plus a few category cards.
struct StudySkeleton: View {
    var body: some View {
        VStack(spacing: Metric.gap) {
            AppCard {
                HStack(spacing: 14) {
                    RoundedRectangle(cornerRadius: Metric.radiusMd, style: .continuous)
                        .fill(Palette.secondary).frame(width: 48, height: 48)
                    VStack(alignment: .leading, spacing: 6) {
                        SkeletonBar(width: 130, height: 16)
                        SkeletonBar(width: 200, height: 12)
                    }
                    Spacer()
                }
            }
            ForEach(0..<3, id: \.self) { _ in
                AppCard {
                    VStack(alignment: .leading, spacing: 12) {
                        SkeletonBar(width: 160, height: 18)
                        HStack(spacing: 16) {
                            ForEach(0..<4, id: \.self) { _ in SkeletonBar(width: 44, height: 28) }
                            Spacer()
                        }
                        SkeletonBar(height: 44, radius: Metric.radiusMd)
                    }
                }
            }
        }
        .skeleton()
    }
}

/// Daily Review: the "Collections" group — a header plus selectable rows.
struct DailyReviewSkeleton: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Metric.gap) {
            SkeletonBar(width: 120, height: 14)
            AppCard(padding: 0) {
                VStack(spacing: 0) {
                    ForEach(0..<8, id: \.self) { i in
                        HStack(spacing: 12) {
                            Circle().fill(Palette.secondary).frame(width: 22, height: 22)
                            SkeletonBar(width: 150, height: 14)
                            Spacer()
                        }
                        .padding(.horizontal, Metric.pad)
                        .padding(.vertical, 14)
                        if i < 7 { Divider().overlay(Palette.border).padding(.leading, Metric.pad) }
                    }
                }
            }
        }
        .skeleton()
    }
}

/// Progress: snapshot card + stat tiles + a topics card.
struct ProgressSkeleton: View {
    var body: some View {
        VStack(spacing: Metric.section) {
            SkeletonCard(lines: 2)
            HStack(spacing: 10) { SkeletonTile(); SkeletonTile(); SkeletonTile() }
            SkeletonCard(lines: 4)
        }
        .skeleton()
    }
}

/// Staff overview: two rows of two stat tiles.
struct StaffOverviewSkeleton: View {
    var body: some View {
        VStack(spacing: Metric.pad) {
            HStack(spacing: 10) { SkeletonTile(); SkeletonTile() }
            HStack(spacing: 10) { SkeletonTile(); SkeletonTile() }
        }
        .skeleton()
    }
}

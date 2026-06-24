import SwiftUI

/// A deliberate, cohesive type system. Text uses SF Pro (Dynamic Type-aware
/// semantic styles with refined weights); numeric/metric values use the rounded
/// design for a confident, modern feel. Keeps hierarchy calm and professional.
extension Font {
    /// Large screen / hero title.
    static let screenTitle = Font.system(.largeTitle, design: .default).weight(.bold)
    /// Inline navigation / sheet title.
    static let screenTitleInline = Font.system(.title3, design: .default).weight(.semibold)
    /// Card / group heading.
    static let cardTitle = Font.system(.headline)
    /// Small section eyebrow (used uppercased + tracked).
    static let eyebrow = Font.system(.caption, design: .default).weight(.semibold)
    /// Big metric number (stat tiles, hero values).
    static let metricLarge = Font.system(size: 28, weight: .bold, design: .rounded)
    static let metric = Font.system(size: 17, weight: .semibold, design: .rounded)
    static let metricSmall = Font.system(size: 13, weight: .semibold, design: .rounded)
}

extension Text {
    /// Uppercase, tracked eyebrow label in muted tone.
    func eyebrowStyle() -> some View {
        self.font(.eyebrow)
            .textCase(.uppercase)
            .tracking(0.6)
            .foregroundStyle(Palette.mutedForeground)
    }
}

/// A consistent section header: title with an optional trailing action.
struct SectionHeader<Trailing: View>: View {
    let title: String
    @ViewBuilder var trailing: Trailing

    init(_ title: String, @ViewBuilder trailing: () -> Trailing = { EmptyView() }) {
        self.title = title
        self.trailing = trailing()
    }

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title).font(.cardTitle).foregroundStyle(Palette.foreground)
            Spacer(minLength: 8)
            trailing
        }
    }
}

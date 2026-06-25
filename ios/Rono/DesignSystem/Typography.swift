import CoreText
import SwiftUI

/// Registers the bundled Vazirmatn TTFs at launch. Done programmatically (not via
/// Info.plist `UIAppFonts`) because the target uses GENERATE_INFOPLIST_FILE. After
/// this runs, `Font.vazir(...)` / `Font.custom("Vazirmatn", …)` resolve.
enum AppFonts {
    static let family = "Vazirmatn"
    private static let files = [
        "Vazirmatn-Regular", "Vazirmatn-Medium", "Vazirmatn-SemiBold", "Vazirmatn-Bold",
    ]
    static func register() {
        for name in files {
            guard let url = Bundle.main.url(forResource: name, withExtension: "ttf") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}

/// A deliberate, cohesive type system built on **Vazirmatn** (Persian, RTL),
/// Dynamic Type-aware via `relativeTo:`. `vazir(_:weight:relativeTo:)` is the
/// single helper every style and view goes through, so the whole app shares one
/// face. Latin glyphs/digits inside Persian text fall back within the family.
extension Font {
    static func vazir(_ size: CGFloat, weight: Font.Weight = .regular, relativeTo style: Font.TextStyle = .body) -> Font {
        .custom(AppFonts.family, size: size, relativeTo: style).weight(weight)
    }

    /// Large screen / hero title.
    static let screenTitle = vazir(34, weight: .bold, relativeTo: .largeTitle)
    /// Inline navigation / sheet title.
    static let screenTitleInline = vazir(20, weight: .semibold, relativeTo: .title3)
    /// Card / group heading.
    static let cardTitle = vazir(17, weight: .semibold, relativeTo: .headline)
    /// Small section eyebrow (used uppercased + tracked).
    static let eyebrow = vazir(12, weight: .semibold, relativeTo: .caption)
    /// Big metric number (stat tiles, hero values).
    static let metricLarge = vazir(28, weight: .bold, relativeTo: .title)
    static let metric = vazir(17, weight: .semibold, relativeTo: .body)
    static let metricSmall = vazir(13, weight: .semibold, relativeTo: .footnote)

    // Vazirmatn equivalents of the system text styles, for views that previously
    // used `.font(.title)`, `.font(.subheadline)`, etc.
    static let vLargeTitle = vazir(34, weight: .bold, relativeTo: .largeTitle)
    static let vTitle = vazir(28, weight: .bold, relativeTo: .title)
    static let vTitle2 = vazir(22, weight: .bold, relativeTo: .title2)
    static let vTitle3 = vazir(20, weight: .semibold, relativeTo: .title3)
    static let vHeadline = vazir(17, weight: .semibold, relativeTo: .headline)
    static let vBody = vazir(17, weight: .regular, relativeTo: .body)
    static let vCallout = vazir(16, weight: .regular, relativeTo: .callout)
    static let vSubheadline = vazir(15, weight: .regular, relativeTo: .subheadline)
    static let vFootnote = vazir(13, weight: .regular, relativeTo: .footnote)
    static let vCaption = vazir(12, weight: .regular, relativeTo: .caption)
    static let vCaption2 = vazir(11, weight: .regular, relativeTo: .caption2)
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

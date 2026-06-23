import SwiftUI
import UIKit

extension UIColor {
    /// Build a UIColor from a 0xRRGGBB integer.
    convenience init(rgb: UInt32) {
        self.init(
            red: CGFloat((rgb >> 16) & 0xFF) / 255.0,
            green: CGFloat((rgb >> 8) & 0xFF) / 255.0,
            blue: CGFloat(rgb & 0xFF) / 255.0,
            alpha: 1.0
        )
    }
}

extension Color {
    /// A dynamic color that resolves to `light` or `dark` based on the effective
    /// interface style. Because the root view sets `.preferredColorScheme`, the
    /// trait collection reflects the user's chosen theme and these adapt for free.
    init(light: UInt32, dark: UInt32) {
        self = Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(rgb: dark)
                : UIColor(rgb: light)
        })
    }

    /// Single fixed hex (same in both modes).
    init(hex: UInt32) {
        self = Color(UIColor(rgb: hex))
    }
}

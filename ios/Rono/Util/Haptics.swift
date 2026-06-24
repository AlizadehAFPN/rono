import UIKit

/// Lightweight haptic feedback helpers for key interactions. Native iOS feel.
///
/// The generators are kept alive (rather than created per call) and re-`prepare()`d
/// immediately after firing, so the Taptic Engine stays warm for the next likely
/// interaction and feedback lands without the cold-start latency of a fresh generator.
@MainActor
enum Haptics {
    private static let impactLight = UIImpactFeedbackGenerator(style: .light)
    private static let impactMedium = UIImpactFeedbackGenerator(style: .medium)
    private static let selection = UISelectionFeedbackGenerator()
    private static let notification = UINotificationFeedbackGenerator()

    static func tap() {
        impactLight.impactOccurred()
        impactLight.prepare()
    }
    static func select() {
        selection.selectionChanged()
        selection.prepare()
    }
    static func success() {
        notification.notificationOccurred(.success)
        notification.prepare()
    }
    static func warning() {
        notification.notificationOccurred(.warning)
        notification.prepare()
    }
    static func error() {
        notification.notificationOccurred(.error)
        notification.prepare()
    }
    static func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        switch style {
        case .light:
            impactLight.impactOccurred(); impactLight.prepare()
        case .medium:
            impactMedium.impactOccurred(); impactMedium.prepare()
        default:
            // Rarer styles (.heavy/.soft/.rigid) aren't on the hot path — fire ad hoc.
            UIImpactFeedbackGenerator(style: style).impactOccurred()
        }
    }
}

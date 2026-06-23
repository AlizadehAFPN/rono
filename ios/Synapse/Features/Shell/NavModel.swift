import SwiftUI
import Observation

/// Shared bottom-tab selection so any screen (e.g. the home dashboard's
/// destination cards) can switch tabs instead of pushing a new screen.
@Observable final class TabRouter {
    var selection: String = AppDestination.overview.rawValue
    func select(_ dest: AppDestination) { selection = dest.rawValue }
}

/// Every navigable surface, mirroring `frontend/components/dashboard/sidebar.tsx`
/// NAV / ADMIN_NAV / ACCOUNT_NAV with the same role gating.
enum AppDestination: String, Hashable, CaseIterable, Identifiable {
    // Learner (visible to every role, like the web NAV non-staff items)
    case overview, study, daily, practice, progress
    // Staff (instructor+)
    case topics, questions, analytics
    // Admin (institution_admin)
    case users, institution
    // Account (everyone)
    case profile, settings

    var id: String { rawValue }

    /// Minimum role required to see this surface.
    var minRole: Role {
        switch self {
        case .topics, .questions, .analytics: return .instructor
        case .users, .institution:            return .institutionAdmin
        default:                              return .student
        }
    }

    var systemImage: String {
        switch self {
        case .overview:    return "house.fill"
        case .study:       return "sparkles"
        case .daily:       return "calendar.badge.clock"
        case .practice:    return "graduationcap.fill"
        case .progress:    return "chart.line.uptrend.xyaxis"
        case .topics:      return "list.bullet.indent"
        case .questions:   return "book.fill"
        case .analytics:   return "chart.bar.fill"
        case .users:       return "person.2.fill"
        case .institution: return "building.2.fill"
        case .profile:     return "person.crop.circle"
        case .settings:    return "gearshape.fill"
        }
    }

    func title(_ t: Strings) -> String {
        switch self {
        case .overview:    return t.nav.items.overview
        case .study:       return t.nav.items.study
        case .daily:       return t.nav.items.daily
        case .practice:    return t.nav.items.practice
        case .progress:    return t.nav.items.progress
        case .topics:      return t.nav.items.topics
        case .questions:   return t.nav.items.questions
        case .analytics:   return t.nav.items.analytics
        case .users:       return t.nav.items.users
        case .institution: return t.nav.items.settings // grouped under settings/institution
        case .profile:     return t.nav.items.profile
        case .settings:    return t.nav.items.settings
        }
    }

    func isVisible(to role: Role?) -> Bool {
        guard let role else { return minRole == .student }
        return role.gte(minRole)
    }
}

enum Nav {
    /// Primary bottom-bar tabs per role (mirrors mobile-bottom-nav.tsx, curated);
    /// everything else lives under "More".
    static func tabs(for role: Role?) -> [AppDestination] {
        if role?.isStaff == true {
            return [.overview, .topics, .questions, .analytics]
        }
        // Study, Daily and Progress are the primary tabs so the home dashboard's
        // Daily Study / Progress cards switch tabs directly. Exam (practice)
        // lives under "More" (Nav.more picks up everything that isn't a tab).
        return [.overview, .study, .daily, .progress]
    }

    /// Surfaces shown in the "More" menu (everything visible that isn't a tab).
    static func more(for role: Role?) -> [AppDestination] {
        let inTabs = Set(tabs(for: role))
        return AppDestination.allCases.filter {
            $0.isVisible(to: role) && !inTabs.contains($0)
        }
    }
}

import XCTest
@testable import Rono

final class RoleTests: XCTestCase {
    func testRoleOrderingMatchesExpectedPrivileges() {
        XCTAssertTrue(Role.instructor.gte(.student))
        XCTAssertTrue(Role.institutionAdmin.gte(.coordinator))
        XCTAssertTrue(Role.systemAdmin.gte(.institutionAdmin))

        XCTAssertFalse(Role.student.gte(.instructor))
        XCTAssertFalse(Role.contentAuthor.isStaff)
        XCTAssertTrue(Role.instructor.isStaff)
        XCTAssertFalse(Role.coordinator.isAdmin)
        XCTAssertTrue(Role.institutionAdmin.isAdmin)
    }
}

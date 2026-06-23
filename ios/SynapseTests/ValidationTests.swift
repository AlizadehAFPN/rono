import XCTest
@testable import Synapse

final class ValidationTests: XCTestCase {
    func testEmailValidationAcceptsSimpleValidAddresses() {
        XCTAssertTrue(Validation.isValidEmail("student@example.com"))
        XCTAssertTrue(Validation.isValidEmail("ada.lovelace+test@getjanus.dev"))
    }

    func testEmailValidationRejectsMalformedAddresses() {
        XCTAssertFalse(Validation.isValidEmail("student"))
        XCTAssertFalse(Validation.isValidEmail("student@"))
        XCTAssertFalse(Validation.isValidEmail("student@example"))
        XCTAssertFalse(Validation.isValidEmail("student @example.com"))
    }

    func testPasswordCharacterChecks() {
        XCTAssertTrue(Validation.hasUpper("abcD"))
        XCTAssertTrue(Validation.hasLower("ABCd"))
        XCTAssertTrue(Validation.hasDigit("abc1"))

        XCTAssertFalse(Validation.hasUpper("abcd"))
        XCTAssertFalse(Validation.hasLower("ABCD"))
        XCTAssertFalse(Validation.hasDigit("abcd"))
    }

    func testSlugValidationAndSlugify() {
        XCTAssertTrue(Validation.isValidSlug("janus-school-2026"))
        XCTAssertFalse(Validation.isValidSlug("Janus School"))
        XCTAssertFalse(Validation.isValidSlug("janus_school"))

        XCTAssertEqual(Validation.slugify("  Janus   School 2026! "), "janus-school-2026")
    }
}

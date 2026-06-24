import XCTest
@testable import Rono

final class APICodersTests: XCTestCase {
    private struct DatePayload: Decodable {
        let createdAt: Date
    }

    private struct EncodingPayload: Encodable {
        let fullName: String
        let preferredName: String
    }

    func testDecoderAcceptsApiDateFormats() throws {
        let samples = [
            "2026-06-21T10:30:45.123Z",
            "2026-06-21T10:30:45Z",
            "2026-06-21T10:30:45.123456",
            "2026-06-21T10:30:45",
            "2026-06-21",
        ]

        for raw in samples {
            let json = #"{"created_at":"\#(raw)"}"#.data(using: .utf8)!
            XCTAssertNoThrow(try APICoders.decoder.decode(DatePayload.self, from: json), raw)
        }
    }

    func testCodersConvertBetweenSnakeCaseAndCamelCase() throws {
        let input = #"{"created_at":"2026-06-21T10:30:45Z"}"#.data(using: .utf8)!
        XCTAssertNoThrow(try APICoders.decoder.decode(DatePayload.self, from: input))

        let encoded = try APICoders.encoder.encode(EncodingPayload(fullName: "Ada Lovelace", preferredName: "Ada"))
        let object = try XCTUnwrap(JSONSerialization.jsonObject(with: encoded) as? [String: String])
        XCTAssertEqual(object["full_name"], "Ada Lovelace")
        XCTAssertEqual(object["preferred_name"], "Ada")
    }
}

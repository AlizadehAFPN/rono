import XCTest
@testable import Rono

final class PracticeModelsTests: XCTestCase {
    func testNextResultDecodesQuestionPayload() throws {
        let json = """
        {
          "session_id": "session-1",
          "item_id": "item-1",
          "item_version_id": "version-1",
          "content": "Question?",
          "options": [
            {"id": "a", "key": "A", "content": "First", "display_order": 0},
            {"id": "b", "key": "B", "content": "Second", "display_order": 1}
          ],
          "primary_topic_id": "topic-1",
          "selection_theta": 0.1,
          "item_irt_a": 1.2,
          "item_irt_b": -0.4,
          "fisher_information": 0.8,
          "items_delivered": 3,
          "items_target": 10
        }
        """.data(using: .utf8)!

        let result = try APICoders.decoder.decode(NextResult.self, from: json)
        guard case .item(let item) = result else {
            return XCTFail("Expected a question payload")
        }

        XCTAssertEqual(item.itemId, "item-1")
        XCTAssertEqual(item.options.count, 2)
        XCTAssertEqual(item.itemsDelivered, 3)
    }

    func testNextResultDecodesNoMorePayload() throws {
        let json = """
        {
          "session_id": "session-1",
          "detail": "No more items",
          "items_delivered": 10
        }
        """.data(using: .utf8)!

        let result = try APICoders.decoder.decode(NextResult.self, from: json)
        guard case .noMore(let marker) = result else {
            return XCTFail("Expected a no-more marker")
        }

        XCTAssertEqual(marker.sessionId, "session-1")
        XCTAssertEqual(marker.itemsDelivered, 10)
    }
}

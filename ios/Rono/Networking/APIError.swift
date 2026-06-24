import Foundation

/// Error surfaced by the API layer, mirroring `frontend/lib/api/client.ts`'s
/// `ApiError` (status + parsed detail).
struct APIError: Error, LocalizedError, Sendable {
    let status: Int
    let detail: String

    var errorDescription: String? { detail }

    /// FastAPI commonly returns `{ "detail": "..." }` or a validation array.
    static func parse(status: Int, data: Data) -> APIError {
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            if let d = obj["detail"] as? String {
                return APIError(status: status, detail: d)
            }
            if let arr = obj["detail"] as? [[String: Any]] {
                let msgs = arr.compactMap { $0["msg"] as? String }
                if !msgs.isEmpty {
                    return APIError(status: status, detail: msgs.joined(separator: "\n"))
                }
            }
        }
        let text = String(data: data, encoding: .utf8)
        return APIError(status: status, detail: text?.isEmpty == false ? text! : "Request failed (\(status))")
    }

    static let sessionExpired = APIError(status: 401, detail: "Session expired")
    static func transport(_ underlying: Error) -> APIError {
        APIError(status: -1, detail: underlying.localizedDescription)
    }
}

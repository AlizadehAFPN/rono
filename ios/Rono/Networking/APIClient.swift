import Foundation

/// Type-erased Encodable so the client can take a heterogeneous body.
struct AnyEncodable: Encodable, @unchecked Sendable {
    private let encodeFn: (Encoder) throws -> Void
    init(_ wrapped: any Encodable) { encodeFn = wrapped.encode }
    func encode(to encoder: Encoder) throws { try encodeFn(encoder) }
}

/// Marker for endpoints that return 204 / empty bodies.
struct EmptyResponse: Decodable, Sendable {}

/// Central API client. Cookie-based auth via the shared `HTTPCookieStorage`
/// with a 401 → coalesced `/auth/refresh` → retry-once interceptor, mirroring
/// `frontend/lib/api/client.ts`. Implemented as an actor so concurrent requests
/// that all 401 at once share a single in-flight refresh.
actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private var refreshTask: Task<Bool, Never>?
    private var onExpire: (@Sendable () async -> Void)?

    init() {
        let cfg = URLSessionConfiguration.default
        cfg.httpCookieStorage = .shared
        cfg.httpCookieAcceptPolicy = .always
        cfg.httpShouldSetCookies = true
        cfg.requestCachePolicy = .reloadIgnoringLocalCacheData
        cfg.waitsForConnectivity = true
        session = URLSession(configuration: cfg)
    }

    /// Called when refresh fails — lets the AuthStore route back to login.
    func setExpireHandler(_ handler: @escaping @Sendable () async -> Void) {
        onExpire = handler
    }

    // MARK: - Public verbs

    func get<T: Decodable & Sendable>(_ path: String, query: [URLQueryItem] = []) async throws -> T {
        try decode(try await raw("GET", path, query: query))
    }

    func post<T: Decodable & Sendable>(_ path: String, _ body: (any Encodable & Sendable)? = nil) async throws -> T {
        try decode(try await raw("POST", path, body: body))
    }

    func patch<T: Decodable & Sendable>(_ path: String, _ body: (any Encodable & Sendable)? = nil) async throws -> T {
        try decode(try await raw("PATCH", path, body: body))
    }

    /// POST that returns no content (204), e.g. logout / change-password.
    func postVoid(_ path: String, _ body: (any Encodable & Sendable)? = nil) async throws {
        _ = try await raw("POST", path, body: body)
    }

    /// DELETE that returns no content (204).
    func deleteVoid(_ path: String) async throws {
        _ = try await raw("DELETE", path)
    }

    /// DELETE that returns a decoded body (e.g. delete-avatar → refreshed profile).
    func delete<T: Decodable & Sendable>(_ path: String) async throws -> T {
        try decode(try await raw("DELETE", path))
    }

    /// Multipart upload (avatar). Returns the refreshed resource.
    func uploadMultipart<T: Decodable & Sendable>(
        _ path: String, fieldName: String, fileData: Data,
        filename: String, mimeType: String
    ) async throws -> T {
        let boundary = "Boundary-\(UUID().uuidString)"
        var bodyData = Data()
        func append(_ s: String) { bodyData.append(s.data(using: .utf8)!) }
        append("--\(boundary)\r\n")
        append("Content-Disposition: form-data; name=\"\(fieldName)\"; filename=\"\(filename)\"\r\n")
        append("Content-Type: \(mimeType)\r\n\r\n")
        bodyData.append(fileData)
        append("\r\n--\(boundary)--\r\n")

        let data = try await raw(
            "PUT", path,
            rawBody: bodyData,
            contentType: "multipart/form-data; boundary=\(boundary)"
        )
        return try decode(data)
    }

    // MARK: - Core

    private func decode<T: Decodable & Sendable>(_ data: Data) throws -> T {
        if T.self == EmptyResponse.self { return EmptyResponse() as! T }
        if data.isEmpty, let empty = EmptyResponse() as? T { return empty }
        do {
            return try APICoders.decoder.decode(T.self, from: data)
        } catch {
            throw APIError(status: -2, detail: "Decoding failed: \(error)")
        }
    }

    private func raw(
        _ method: String,
        _ path: String,
        query: [URLQueryItem] = [],
        body: (any Encodable & Sendable)? = nil,
        rawBody: Data? = nil,
        contentType: String? = nil,
        retry: Bool = true
    ) async throws -> Data {
        var comps = URLComponents(
            url: AppConfig.apiBaseURL.appendingPathComponent(path),
            resolvingAgainstBaseURL: false
        )!
        if !query.isEmpty { comps.queryItems = query }
        guard let url = comps.url else { throw APIError(status: -1, detail: "Bad URL") }

        var req = URLRequest(url: url)
        req.httpMethod = method
        if let rawBody {
            req.httpBody = rawBody
            if let contentType { req.setValue(contentType, forHTTPHeaderField: "Content-Type") }
        } else if let body {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try APICoders.encoder.encode(AnyEncodable(body))
        }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: req)
        } catch {
            throw APIError.transport(error)
        }
        guard let http = response as? HTTPURLResponse else {
            throw APIError(status: -1, detail: "No HTTP response")
        }

        if http.statusCode == 401 && retry {
            if await refresh() {
                return try await raw(
                    method, path, query: query, body: body,
                    rawBody: rawBody, contentType: contentType, retry: false
                )
            }
            await onExpire?()
            throw APIError.sessionExpired
        }

        guard (200..<300).contains(http.statusCode) else {
            throw APIError.parse(status: http.statusCode, data: data)
        }

        // Capture any Set-Cookie (login/refresh) for persistence across launches.
        CookieJar.persist()
        return data
    }

    /// Coalesce concurrent refreshes into a single in-flight request — the
    /// backend rotates refresh tokens, so parallel refreshes would race.
    private func refresh() async -> Bool {
        if let task = refreshTask { return await task.value }
        let task = Task { () -> Bool in
            var req = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("auth/refresh"))
            req.httpMethod = "POST"
            do {
                let (_, resp) = try await session.data(for: req)
                return ((resp as? HTTPURLResponse)?.statusCode).map { (200..<300).contains($0) } ?? false
            } catch {
                return false
            }
        }
        refreshTask = task
        let result = await task.value
        refreshTask = nil
        if result { CookieJar.persist() }
        return result
    }
}

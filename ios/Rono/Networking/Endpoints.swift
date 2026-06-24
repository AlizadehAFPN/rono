import Foundation

/// Typed endpoint functions, mirroring `frontend/lib/api/*.ts`. Each groups the
/// routes of one backend router. All go through `APIClient.shared`.

enum AuthAPI {
    static func login(_ body: LoginRequest) async throws -> MeResponse {
        try await APIClient.shared.post("auth/login", body)
    }
    static func signup(_ body: SignupRequest) async throws -> MeResponse {
        try await APIClient.shared.post("auth/signup", body)
    }
    static func register(_ body: RegisterRequest) async throws -> MeResponse {
        try await APIClient.shared.post("auth/register", body)
    }
    static func logout() async throws {
        try await APIClient.shared.postVoid("auth/logout")
    }
    static func me() async throws -> MeResponse {
        try await APIClient.shared.get("auth/me")
    }
    static func updateProfile(_ body: ProfileUpdateRequest) async throws -> MeResponse {
        try await APIClient.shared.patch("auth/me", body)
    }
    static func uploadAvatar(data: Data, filename: String, mime: String) async throws -> MeResponse {
        try await APIClient.shared.uploadMultipart(
            "auth/me/avatar", fieldName: "file", fileData: data, filename: filename, mimeType: mime
        )
    }
    static func deleteAvatar() async throws -> MeResponse {
        try await APIClient.shared.delete("auth/me/avatar")
    }
    static func changePassword(_ body: ChangePasswordRequest) async throws {
        try await APIClient.shared.postVoid("auth/change-password", body)
    }
    static func sessions() async throws -> [DeviceSession] {
        try await APIClient.shared.get("auth/sessions")
    }
    static func revokeOtherSessions() async throws {
        try await APIClient.shared.deleteVoid("auth/sessions/others")
    }
    static func revokeSession(_ id: String) async throws {
        try await APIClient.shared.deleteVoid("auth/sessions/\(id)")
    }
}

enum PracticeAPI {
    static func start(_ body: SessionStartRequest) async throws -> PracticeSessionOut {
        try await APIClient.shared.post("sessions", body)
    }
    static func session(_ id: String) async throws -> PracticeSessionOut {
        try await APIClient.shared.get("sessions/\(id)")
    }
    static func next(_ id: String) async throws -> NextResult {
        try await APIClient.shared.get("sessions/\(id)/next")
    }
    static func examPaper(_ id: String, count: Int? = nil) async throws -> ExamPaperOut {
        let q = count.map { [URLQueryItem(name: "count", value: String($0))] } ?? []
        return try await APIClient.shared.get("sessions/\(id)/exam-paper", query: q)
    }
    static func answer(_ id: String, _ body: AnswerSubmitRequest) async throws -> AnswerResultOut {
        try await APIClient.shared.post("sessions/\(id)/answer", body)
    }
    static func bulkAnswer(_ id: String, _ body: BulkAnswerSubmitRequest) async throws -> BulkAnswerResultOut {
        try await APIClient.shared.post("sessions/\(id)/bulk-answers", body)
    }
    static func finish(_ id: String) async throws -> SessionSummaryOut {
        try await APIClient.shared.post("sessions/\(id)/finish")
    }
}

enum ProgressAPI {
    static func progress() async throws -> ProgressOut {
        try await APIClient.shared.get("me/progress")
    }
    static func categories() async throws -> StudyOverviewOut {
        try await APIClient.shared.get("me/categories")
    }
    static func dashboard() async throws -> StudentDashboardOut {
        try await APIClient.shared.get("me/dashboard")
    }
}

enum ItemsAPI {
    static func list(
        status: String? = nil, topicId: String? = nil, itemType: String? = nil,
        examType: String? = nil, examPart: String? = nil,
        limit: Int = 50, offset: Int = 0
    ) async throws -> PaginatedItems {
        var q = [URLQueryItem(name: "limit", value: String(limit)),
                 URLQueryItem(name: "offset", value: String(offset))]
        if let status { q.append(.init(name: "status", value: status)) }
        if let topicId { q.append(.init(name: "topic_id", value: topicId)) }
        if let itemType { q.append(.init(name: "item_type", value: itemType)) }
        if let examType { q.append(.init(name: "exam_type", value: examType)) }
        if let examPart { q.append(.init(name: "exam_part", value: examPart)) }
        return try await APIClient.shared.get("items", query: q)
    }
    static func get(_ id: String) async throws -> ItemWithTopics {
        try await APIClient.shared.get("items/\(id)")
    }
    static func create(_ body: ItemCreate) async throws -> ItemWithTopics {
        try await APIClient.shared.post("items", body)
    }
    static func update(_ id: String, _ body: ItemUpdate) async throws -> ItemWithTopics {
        try await APIClient.shared.patch("items/\(id)", body)
    }
    static func delete(_ id: String) async throws {
        try await APIClient.shared.deleteVoid("items/\(id)")
    }
    static func createVersion(_ id: String, _ body: ItemVersionCreate) async throws -> ItemVersionOut {
        try await APIClient.shared.post("items/\(id)/versions", body)
    }
    static func versions(_ id: String) async throws -> [ItemVersionOut] {
        try await APIClient.shared.get("items/\(id)/versions")
    }
}

enum TopicsAPI {
    static func list() async throws -> [TopicOut] {
        try await APIClient.shared.get("topics")
    }
    static func tree() async throws -> [TopicTree] {
        try await APIClient.shared.get("topics/tree")
    }
    static func get(_ id: String) async throws -> TopicOut {
        try await APIClient.shared.get("topics/\(id)")
    }
    static func create(_ body: TopicCreate) async throws -> TopicOut {
        try await APIClient.shared.post("topics", body)
    }
    static func update(_ id: String, _ body: TopicUpdate) async throws -> TopicOut {
        try await APIClient.shared.patch("topics/\(id)", body)
    }
    static func delete(_ id: String) async throws {
        try await APIClient.shared.deleteVoid("topics/\(id)")
    }
}

enum UsersAPI {
    static func list(limit: Int = 50, offset: Int = 0) async throws -> PaginatedUsers {
        try await APIClient.shared.get("users", query: [
            URLQueryItem(name: "limit", value: String(limit)),
            URLQueryItem(name: "offset", value: String(offset)),
        ])
    }
    static func create(_ body: UserCreate) async throws -> UserListItem {
        try await APIClient.shared.post("users", body)
    }
    static func update(_ id: String, _ body: UserUpdate) async throws -> UserListItem {
        try await APIClient.shared.patch("users/\(id)", body)
    }
}

enum InstitutionAPI {
    static func get() async throws -> Institution {
        try await APIClient.shared.get("institution")
    }
    static func update(_ body: InstitutionUpdate) async throws -> Institution {
        try await APIClient.shared.patch("institution", body)
    }
}

enum AnalyticsAPI {
    static func overview() async throws -> AnalyticsOverview {
        try await APIClient.shared.get("analytics/overview")
    }
    static func items() async throws -> ItemStatsResponse {
        try await APIClient.shared.get("analytics/items")
    }
}

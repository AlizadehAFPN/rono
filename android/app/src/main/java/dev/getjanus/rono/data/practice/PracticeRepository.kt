package dev.getjanus.rono.data.practice

import dev.getjanus.rono.core.network.apiCall
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PracticeRepository @Inject constructor(
    private val api: PracticeApi,
) {
    suspend fun start(request: SessionStartRequest): SessionDto = apiCall { api.start(request) }
    suspend fun session(id: String): SessionDto = apiCall { api.session(id) }
    suspend fun next(id: String): NextItemDto = apiCall { api.next(id) }
    suspend fun examPaper(id: String, count: Int? = null): ExamPaperDto = apiCall { api.examPaper(id, count) }
    suspend fun answer(id: String, body: AnswerSubmitRequest): AnswerResultDto = apiCall { api.answer(id, body) }
    suspend fun bulkAnswer(id: String, body: BulkAnswerSubmitRequest): BulkAnswerResultDto =
        apiCall { api.bulkAnswer(id, body) }
    suspend fun finish(id: String): SessionSummaryDto = apiCall { api.finish(id) }
}

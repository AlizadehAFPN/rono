package dev.getjanus.synapse.data.practice

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface PracticeApi {
    @POST("sessions")
    suspend fun start(@Body body: SessionStartRequest): SessionDto

    @GET("sessions/{id}")
    suspend fun session(@Path("id") id: String): SessionDto

    @GET("sessions/{id}/next")
    suspend fun next(@Path("id") id: String): NextItemDto

    @GET("sessions/{id}/exam-paper")
    suspend fun examPaper(@Path("id") id: String, @Query("count") count: Int? = null): ExamPaperDto

    @POST("sessions/{id}/answer")
    suspend fun answer(@Path("id") id: String, @Body body: AnswerSubmitRequest): AnswerResultDto

    @POST("sessions/{id}/bulk-answers")
    suspend fun bulkAnswer(@Path("id") id: String, @Body body: BulkAnswerSubmitRequest): BulkAnswerResultDto

    @POST("sessions/{id}/finish")
    suspend fun finish(@Path("id") id: String): SessionSummaryDto
}

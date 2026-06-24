package dev.getjanus.rono.data.progress

import dev.getjanus.rono.data.study.StudyOverviewDto
import retrofit2.http.GET

interface ProgressApi {
    @GET("me/dashboard")
    suspend fun dashboard(): DashboardDto

    @GET("me/progress")
    suspend fun progress(): ProgressDto

    @GET("me/categories")
    suspend fun categories(): StudyOverviewDto
}

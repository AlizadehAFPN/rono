package dev.getjanus.rono.data.progress

import dev.getjanus.rono.core.network.apiCall
import dev.getjanus.rono.data.study.StudyOverviewDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProgressRepository @Inject constructor(
    private val api: ProgressApi,
) {
    suspend fun dashboard(): DashboardDto = apiCall { api.dashboard() }
    suspend fun progress(): ProgressDto = apiCall { api.progress() }
    suspend fun categories(): StudyOverviewDto = apiCall { api.categories() }
}

package dev.getjanus.synapse.widget

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import dev.getjanus.synapse.core.network.CookieStore
import dev.getjanus.synapse.data.progress.ProgressRepository
import java.util.concurrent.TimeUnit

/** Periodically refreshes the widget snapshot from /me/dashboard when signed in. */
@HiltWorker
class WidgetUpdateWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted params: WorkerParameters,
    private val progressRepository: ProgressRepository,
    private val cookieStore: CookieStore,
    private val widgetUpdater: WidgetUpdater,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        if (!cookieStore.hasSession()) return Result.success()
        return runCatching {
            val dashboard = progressRepository.dashboard()
            widgetUpdater.update(streakDays = dashboard.streakDays, dueNow = dashboard.dueNow)
            Result.success()
        }.getOrElse { Result.retry() }
    }

    companion object {
        private const val UNIQUE = "synapse_widget_refresh"

        fun schedule(context: Context) {
            val request = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(6, TimeUnit.HOURS).build()
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(UNIQUE, ExistingPeriodicWorkPolicy.KEEP, request)
        }

        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(UNIQUE)
        }
    }
}

package dev.getjanus.rono.core.locale

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.getjanus.rono.core.datastore.AppLocale
import dev.getjanus.rono.core.datastore.SettingsRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Single owner of the in-app language. Writing a new locale updates both the
 * UI preference (DataStore) and the synchronous tag attachBaseContext reads,
 * then emits a one-shot recreate signal. Because recreate is driven only by an
 * explicit change here — never by observing state — a cold start never
 * recreates (no flicker), and a user change recreates exactly once.
 */
@Singleton
class LocaleController @Inject constructor(
    @ApplicationContext private val context: Context,
    private val settings: SettingsRepository,
) {
    private val _recreate = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val recreate: SharedFlow<Unit> = _recreate.asSharedFlow()

    suspend fun setLocale(locale: AppLocale) {
        if (LocaleManager.getTag(context) == locale.tag) {
            settings.setLocale(locale)
            return
        }
        settings.setLocale(locale)
        LocaleManager.setTag(context, locale.tag)
        _recreate.tryEmit(Unit)
    }
}

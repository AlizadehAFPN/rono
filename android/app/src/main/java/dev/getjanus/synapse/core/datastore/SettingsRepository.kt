package dev.getjanus.synapse.core.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dev.getjanus.synapse.core.config.ApiEnvironment
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

enum class ThemeMode { LIGHT, DARK, SYSTEM }

enum class AppLocale(val tag: String) {
    TURKISH("tr"),
    ENGLISH("en");

    companion object {
        fun fromTag(tag: String?): AppLocale =
            entries.firstOrNull { it.tag == tag } ?: TURKISH
    }
}

data class AppSettings(
    val themeMode: ThemeMode = ThemeMode.SYSTEM,
    val locale: AppLocale = AppLocale.TURKISH,
    val onboarded: Boolean = false,
    val environment: ApiEnvironment = ApiEnvironment.DEFAULT,
)

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "synapse_settings")

/**
 * Small key/value app preferences (theme, language, onboarding, dev backend).
 * Mirrors the iOS ThemeStore/LocaleStore role. Auth cookies live separately in
 * [dev.getjanus.synapse.core.network.CookieStore].
 */
class SettingsRepository(private val context: Context) {

    private object Keys {
        val THEME = stringPreferencesKey("theme_mode")
        val LOCALE = stringPreferencesKey("locale")
        val ONBOARDED = stringPreferencesKey("onboarded")
        val ENVIRONMENT = stringPreferencesKey("api_environment")
    }

    val settings: Flow<AppSettings> = context.dataStore.data.map { prefs ->
        AppSettings(
            themeMode = prefs[Keys.THEME]?.let { runCatching { ThemeMode.valueOf(it) }.getOrNull() }
                ?: ThemeMode.SYSTEM,
            locale = AppLocale.fromTag(prefs[Keys.LOCALE]),
            onboarded = prefs[Keys.ONBOARDED] == "true",
            environment = prefs[Keys.ENVIRONMENT]
                ?.let { runCatching { ApiEnvironment.valueOf(it) }.getOrNull() }
                ?: ApiEnvironment.DEFAULT,
        )
    }

    suspend fun setThemeMode(mode: ThemeMode) =
        context.dataStore.edit { it[Keys.THEME] = mode.name }

    suspend fun setLocale(locale: AppLocale) =
        context.dataStore.edit { it[Keys.LOCALE] = locale.tag }

    suspend fun setOnboarded(onboarded: Boolean) =
        context.dataStore.edit { it[Keys.ONBOARDED] = onboarded.toString() }

    suspend fun setEnvironment(env: ApiEnvironment) =
        context.dataStore.edit { it[Keys.ENVIRONMENT] = env.name }
}

package dev.getjanus.rono.core.locale

import android.content.Context
import android.content.res.Configuration
import java.util.Locale

/**
 * Applies the chosen in-app language at the Activity level via
 * attachBaseContext (synchronous, so it can run before onCreate). This keeps
 * LocalContext an Activity — required by Hilt's ViewModel factory — unlike a
 * CompositionLocal override, which breaks hiltViewModel().
 */
object LocaleManager {
    private const val PREFS = "rono_locale"
    private const val KEY_TAG = "tag"
    const val DEFAULT_TAG = "fa"

    fun getTag(context: Context): String =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_TAG, DEFAULT_TAG) ?: DEFAULT_TAG

    fun setTag(context: Context, tag: String) {
        // commit (synchronous) so a following Activity.recreate() reads the new
        // value in attachBaseContext on the very next onCreate.
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY_TAG, tag).commit()
    }

    /** Wrap a base context so its resources resolve in the selected language. */
    fun wrap(base: Context): Context {
        val tag = getTag(base)
        val locale = Locale.forLanguageTag(tag)
        Locale.setDefault(locale)
        val config = Configuration(base.resources.configuration)
        config.setLocale(locale)
        return base.createConfigurationContext(config)
    }
}

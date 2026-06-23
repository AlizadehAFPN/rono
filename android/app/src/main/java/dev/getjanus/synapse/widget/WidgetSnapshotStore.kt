package dev.getjanus.synapse.widget

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

private val Context.widgetDataStore: DataStore<Preferences> by preferencesDataStore(name = "synapse_widget")

data class WidgetSnapshot(val streakDays: Int = 0, val dueNow: Int = 0, val signedIn: Boolean = false)

/** Tiny shared snapshot that feeds the home-screen widget (streak + due count). */
class WidgetSnapshotStore(private val context: Context) {

    private object Keys {
        val STREAK = intPreferencesKey("streak")
        val DUE = intPreferencesKey("due")
        val SIGNED_IN = intPreferencesKey("signed_in")
    }

    suspend fun read(): WidgetSnapshot {
        val prefs = context.widgetDataStore.data.first()
        return WidgetSnapshot(
            streakDays = prefs[Keys.STREAK] ?: 0,
            dueNow = prefs[Keys.DUE] ?: 0,
            signedIn = (prefs[Keys.SIGNED_IN] ?: 0) == 1,
        )
    }

    suspend fun write(streakDays: Int, dueNow: Int, signedIn: Boolean = true) {
        context.widgetDataStore.edit {
            it[Keys.STREAK] = streakDays
            it[Keys.DUE] = dueNow
            it[Keys.SIGNED_IN] = if (signedIn) 1 else 0
        }
    }

    suspend fun clear() {
        context.widgetDataStore.edit {
            it[Keys.STREAK] = 0
            it[Keys.DUE] = 0
            it[Keys.SIGNED_IN] = 0
        }
    }
}

package dev.getjanus.rono.widget

import android.content.Context
import androidx.glance.appwidget.updateAll
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/** Writes the widget snapshot and pushes a refresh to all placed widgets. */
@Singleton
class WidgetUpdater @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val store = WidgetSnapshotStore(context)

    suspend fun update(streakDays: Int, dueNow: Int) {
        store.write(streakDays = streakDays, dueNow = dueNow, signedIn = true)
        RonoWidget().updateAll(context)
    }

    suspend fun clear() {
        store.clear()
        RonoWidget().updateAll(context)
    }
}

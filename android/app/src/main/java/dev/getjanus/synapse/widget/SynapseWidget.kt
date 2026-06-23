package dev.getjanus.synapse.widget

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.core.net.toUri
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Home-screen widget: streak + cards-due-today, and a one-tap "start daily
 * review" that deep-links into the app (synapse://daily).
 */
class SynapseWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val snapshot = WidgetSnapshotStore(context).read()
        provideContent {
            GlanceTheme {
                WidgetBody(context, snapshot)
            }
        }
    }
}

private val BrandBlue = Color(0xFF1D9BF0)
private val Amber = Color(0xFFFFB23E)

@Composable
private fun WidgetBody(context: Context, snapshot: WidgetSnapshot) {
    val openDaily = actionStartActivity(
        Intent(Intent.ACTION_VIEW, "synapse://daily".toUri()).setPackage(context.packageName),
    )
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(GlanceTheme.colors.widgetBackground)
            .cornerRadius(20.dp)
            .padding(16.dp)
            .clickable(openDaily),
        verticalAlignment = Alignment.Top,
    ) {
        Text(
            "Synapse",
            style = TextStyle(color = GlanceTheme.colors.onSurface, fontSize = 14.sp, fontWeight = FontWeight.Bold),
        )
        Spacer(GlanceModifier.height(10.dp))
        Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text("🔥", style = TextStyle(fontSize = 22.sp))
            Spacer(GlanceModifier.height(0.dp))
            Text(
                "  ${snapshot.streakDays}",
                style = TextStyle(color = ColorProvider(Amber), fontSize = 24.sp, fontWeight = FontWeight.Bold),
            )
        }
        Spacer(GlanceModifier.height(10.dp))
        Box(
            modifier = GlanceModifier
                .fillMaxWidth()
                .background(ColorProvider(BrandBlue))
                .cornerRadius(12.dp)
                .padding(vertical = 10.dp)
                .clickable(openDaily),
            contentAlignment = Alignment.Center,
        ) {
            val label = if (snapshot.dueNow > 0) "Review ${snapshot.dueNow} due" else "Start review"
            Text(label, style = TextStyle(color = ColorProvider(Color.White), fontSize = 14.sp, fontWeight = FontWeight.Medium))
        }
    }
}

package dev.getjanus.rono.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.ui.graphics.vector.ImageVector
import kotlinx.serialization.Serializable

/** Top-level (bottom-bar) student destinations. */
@Serializable object HomeRoute
@Serializable object StudyRoute
@Serializable object DailyRoute
@Serializable object ProgressRoute
@Serializable object ProfileRoute

/** Pushed (full-screen) destinations. */
@Serializable data class SessionRoute(
    val sessionType: String,
    val topicId: String? = null,
    val topicIds: List<String> = emptyList(),
    val itemsTarget: Int = 10,
    val limitType: String? = null,
    val timeLimitMinutes: Int? = null,
    val selfRatedLevel: String? = null,
    val examType: String? = null,
    val examPart: String? = null,
)

@Serializable data class ExamSetupRoute(val examType: String? = null)
@Serializable data class ExamRoute(
    val examType: String? = null,
    val examPart: String? = null,
    val count: Int = 20,
    val instantFeedback: Boolean = false,
)

@Serializable object SettingsRoute
@Serializable object ChangePasswordRoute
@Serializable object DevicesRoute

/** Unauthenticated destinations. */
@Serializable object LoginRoute
@Serializable object SignupRoute

enum class TopTab(val icon: ImageVector, val labelRes: Int) {
    HOME(Icons.Filled.Home, dev.getjanus.rono.R.string.nav_home),
    STUDY(Icons.Filled.AutoAwesome, dev.getjanus.rono.R.string.nav_study),
    DAILY(Icons.Filled.CalendarMonth, dev.getjanus.rono.R.string.nav_daily),
    PROGRESS(Icons.AutoMirrored.Filled.TrendingUp, dev.getjanus.rono.R.string.nav_progress),
    PROFILE(Icons.Filled.Person, dev.getjanus.rono.R.string.nav_profile),
}

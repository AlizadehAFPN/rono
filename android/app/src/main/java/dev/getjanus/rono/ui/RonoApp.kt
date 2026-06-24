package dev.getjanus.rono.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import android.app.Activity
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.rono.core.datastore.ThemeMode
import dev.getjanus.rono.core.designsystem.theme.RonoTheme
import dev.getjanus.rono.core.session.AuthState
import dev.getjanus.rono.ui.auth.AuthNavHost
import dev.getjanus.rono.ui.common.LaunchScreen
import dev.getjanus.rono.ui.navigation.MainScaffold
import dev.getjanus.rono.ui.onboarding.OnboardingScreen

@Composable
fun RonoApp(
    viewModel: RootViewModel = hiltViewModel(),
) {
    val authState by viewModel.authState.collectAsStateWithLifecycle()
    val settings by viewModel.settings.collectAsStateWithLifecycle()
    val context = LocalContext.current

    // Recreate ONLY on an explicit user language change (emitted by
    // LocaleController). attachBaseContext applies the language on the next
    // onCreate; cold starts never recreate.
    LaunchedEffect(Unit) {
        viewModel.recreateEvents.collect {
            (context as? Activity)?.recreate()
        }
    }

    val dark = when (settings.themeMode) {
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
    }

    RonoTheme(darkTheme = dark) {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            AnimatedContent(
                targetState = authState,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                contentKey = { it::class },
                label = "authPhase",
            ) { state ->
                when (state) {
                    AuthState.Loading -> LaunchScreen()
                    AuthState.Onboarding -> OnboardingScreen(
                        currentLocale = settings.locale,
                        onSetLocale = viewModel::setLocale,
                        onFinish = viewModel::completeOnboarding,
                    )
                    AuthState.Unauthenticated -> AuthNavHost(
                        currentLocale = settings.locale,
                        onSetLocale = viewModel::setLocale,
                    )
                    is AuthState.Authenticated -> MainScaffold()
                }
            }
        }
    }
}

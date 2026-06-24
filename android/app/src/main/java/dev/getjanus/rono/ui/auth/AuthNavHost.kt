package dev.getjanus.rono.ui.auth

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import dev.getjanus.rono.core.datastore.AppLocale
import dev.getjanus.rono.ui.navigation.LoginRoute
import dev.getjanus.rono.ui.navigation.SignupRoute

@Composable
fun AuthNavHost(
    currentLocale: AppLocale,
    onSetLocale: (AppLocale) -> Unit,
) {
    val nav = rememberNavController()
    NavHost(
        navController = nav,
        startDestination = LoginRoute,
        enterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Start) },
        exitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Start) },
        popEnterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.End) },
        popExitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.End) },
    ) {
        composable<LoginRoute> {
            LoginScreen(
                onNavigateToSignup = { nav.navigate(SignupRoute) },
                currentLocale = currentLocale,
                onSetLocale = onSetLocale,
            )
        }
        composable<SignupRoute> {
            SignupScreen(
                onNavigateToLogin = { nav.popBackStack() },
                currentLocale = currentLocale,
                onSetLocale = onSetLocale,
            )
        }
    }
}

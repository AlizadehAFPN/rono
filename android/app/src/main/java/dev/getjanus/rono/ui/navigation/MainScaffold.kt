package dev.getjanus.rono.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import androidx.navigation.toRoute
import dev.getjanus.rono.ui.daily.DailyReviewSetupScreen
import dev.getjanus.rono.ui.dashboard.DashboardScreen
import dev.getjanus.rono.ui.exam.ExamScreen
import dev.getjanus.rono.ui.exam.ExamSetupScreen
import dev.getjanus.rono.ui.profile.ProfileScreen
import dev.getjanus.rono.ui.progress.ProgressScreen
import dev.getjanus.rono.ui.settings.ChangePasswordScreen
import dev.getjanus.rono.ui.settings.DevicesScreen
import dev.getjanus.rono.ui.settings.SettingsScreen
import dev.getjanus.rono.ui.study.SessionScreen
import dev.getjanus.rono.ui.study.StudyScreen

/**
 * Authenticated student shell — Material 3 bottom navigation across the five
 * primary destinations. Full-screen flows (session, exam, settings) are pushed
 * onto this same nav controller in later phases.
 */
@Composable
fun MainScaffold() {
    val nav = rememberNavController()
    val backStack by nav.currentBackStackEntryAsState()
    val currentDestination = backStack?.destination
    val showBottomBar = TopTab.entries.any { currentDestination?.isOnTab(it) == true } ||
        currentDestination == null

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    TopTab.entries.forEach { tab ->
                        val selected = currentDestination?.isOnTab(tab) == true
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                nav.navigate(tab.route()) {
                                    popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, contentDescription = null) },
                            label = { Text(stringResource(tab.labelRes), style = MaterialTheme.typography.labelMedium) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = HomeRoute,
            modifier = Modifier,
        ) {
            composable<HomeRoute> {
                DashboardScreen(
                    onStartStudy = { nav.navigateToTab(StudyRoute) },
                    onReviewNow = { nav.navigateToTab(DailyRoute) },
                    onOpenProgress = { nav.navigateToTab(ProgressRoute) },
                    contentPadding = padding,
                )
            }
            composable<StudyRoute> {
                StudyScreen(
                    contentPadding = padding,
                    onStartSession = { nav.navigate(it) },
                    onOpenDaily = { nav.navigateToTab(DailyRoute) },
                    onOpenExam = { nav.navigate(ExamSetupRoute()) },
                )
            }
            composable<DailyRoute>(
                deepLinks = listOf(navDeepLink { uriPattern = "rono://daily" }),
            ) {
                DailyReviewSetupScreen(
                    contentPadding = padding,
                    onStart = { nav.navigate(it) },
                )
            }
            composable<ProgressRoute> { ProgressScreen(contentPadding = padding) }
            composable<ProfileRoute> {
                ProfileScreen(
                    contentPadding = padding,
                    onOpenSettings = { nav.navigate(SettingsRoute) },
                )
            }

            composable<SettingsRoute> {
                SettingsScreen(
                    onBack = { nav.popBackStack() },
                    onChangePassword = { nav.navigate(ChangePasswordRoute) },
                    onDevices = { nav.navigate(DevicesRoute) },
                )
            }
            composable<ChangePasswordRoute> { ChangePasswordScreen(onBack = { nav.popBackStack() }) }
            composable<DevicesRoute> { DevicesScreen(onBack = { nav.popBackStack() }) }

            composable<SessionRoute> { entry ->
                val route = entry.toRoute<SessionRoute>()
                SessionScreen(
                    onExit = { nav.popBackStack() },
                    onRestart = {
                        nav.popBackStack()
                        nav.navigate(route)
                    },
                )
            }

            composable<ExamSetupRoute> {
                ExamSetupScreen(
                    onBack = { nav.popBackStack() },
                    onStart = { nav.navigate(it) },
                )
            }
            composable<ExamRoute> {
                ExamScreen(onExit = { nav.popBackStack(StudyRoute, inclusive = false) })
            }
        }
    }
}

private fun NavHostController.navigateToTab(route: Any) {
    navigate(route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}

private fun TopTab.route(): Any = when (this) {
    TopTab.HOME -> HomeRoute
    TopTab.STUDY -> StudyRoute
    TopTab.DAILY -> DailyRoute
    TopTab.PROGRESS -> ProgressRoute
    TopTab.PROFILE -> ProfileRoute
}

private fun androidx.navigation.NavDestination.isOnTab(tab: TopTab): Boolean = when (tab) {
    TopTab.HOME -> hasRoute(HomeRoute::class)
    TopTab.STUDY -> hasRoute(StudyRoute::class)
    TopTab.DAILY -> hasRoute(DailyRoute::class)
    TopTab.PROGRESS -> hasRoute(ProgressRoute::class)
    TopTab.PROFILE -> hasRoute(ProfileRoute::class)
}

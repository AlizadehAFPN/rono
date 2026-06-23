package dev.getjanus.synapse.core.session

import dev.getjanus.synapse.core.di.AppScope
import dev.getjanus.synapse.core.datastore.SettingsRepository
import dev.getjanus.synapse.core.network.ApiEnvironmentProvider
import dev.getjanus.synapse.core.network.SessionEvents
import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.getjanus.synapse.data.auth.AuthRepository
import dev.getjanus.synapse.domain.model.User
import dev.getjanus.synapse.widget.WidgetUpdateWorker
import dev.getjanus.synapse.widget.WidgetUpdater
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

sealed interface AuthState {
    data object Loading : AuthState
    data object Onboarding : AuthState
    data object Unauthenticated : AuthState
    data class Authenticated(val user: User) : AuthState
}

/**
 * Single source of truth for the auth phase (mirrors iOS AuthStore.phase). Owns
 * bootstrap (restore cookies → /auth/me), keeps the API environment in sync
 * with settings, and reacts to session-expiry signals from the network layer.
 */
@Singleton
class SessionManager @Inject constructor(
    private val authRepository: AuthRepository,
    private val settings: SettingsRepository,
    private val environmentProvider: ApiEnvironmentProvider,
    private val sessionEvents: SessionEvents,
    private val widgetUpdater: WidgetUpdater,
    @ApplicationContext private val appContext: Context,
    @AppScope private val scope: CoroutineScope,
) {
    private val _state = MutableStateFlow<AuthState>(AuthState.Loading)
    val state: StateFlow<AuthState> = _state.asStateFlow()

    init {
        // Keep the active backend environment current before any request runs.
        scope.launch {
            settings.settings.map { it.environment }.distinctUntilChanged().collect {
                environmentProvider.current = it
            }
        }
        scope.launch {
            sessionEvents.events.collect { onExpired() }
        }
        scope.launch { bootstrap() }
    }

    private suspend fun bootstrap() {
        val current = settings.settings.first()
        environmentProvider.current = current.environment
        if (!current.onboarded) {
            _state.value = AuthState.Onboarding
            return
        }
        if (authRepository.hasPersistedSession()) {
            val user = runCatching { authRepository.me() }.getOrNull()
            if (user != null) {
                _state.value = AuthState.Authenticated(user)
                WidgetUpdateWorker.schedule(appContext)
            } else {
                _state.value = AuthState.Unauthenticated
            }
        } else {
            _state.value = AuthState.Unauthenticated
        }
    }

    fun onOnboardingComplete() {
        scope.launch {
            settings.setOnboarded(true)
            _state.value = AuthState.Unauthenticated
        }
    }

    fun onAuthenticated(user: User) {
        // Logging in implies onboarding is complete.
        scope.launch { settings.setOnboarded(true) }
        _state.value = AuthState.Authenticated(user)
        WidgetUpdateWorker.schedule(appContext)
    }

    fun updateUser(user: User) {
        if (_state.value is AuthState.Authenticated) {
            _state.value = AuthState.Authenticated(user)
        }
    }

    fun signOut() {
        scope.launch {
            authRepository.logout()
            clearWidgets()
            _state.value = AuthState.Unauthenticated
        }
    }

    private fun onExpired() {
        scope.launch {
            runCatching { authRepository.logout() }
            clearWidgets()
            _state.value = AuthState.Unauthenticated
        }
    }

    private suspend fun clearWidgets() {
        WidgetUpdateWorker.cancel(appContext)
        runCatching { widgetUpdater.clear() }
    }
}

package dev.getjanus.synapse.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.synapse.core.config.ApiEnvironment
import dev.getjanus.synapse.core.datastore.AppLocale
import dev.getjanus.synapse.core.datastore.AppSettings
import dev.getjanus.synapse.core.datastore.SettingsRepository
import dev.getjanus.synapse.core.datastore.ThemeMode
import dev.getjanus.synapse.core.locale.LocaleController
import dev.getjanus.synapse.core.session.AuthState
import dev.getjanus.synapse.core.session.SessionManager
import dev.getjanus.synapse.data.auth.AuthRepository
import dev.getjanus.synapse.domain.model.User
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.TimeZone
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository,
    private val authRepository: AuthRepository,
    private val sessionManager: SessionManager,
    private val localeController: LocaleController,
) : ViewModel() {

    val settings: StateFlow<AppSettings> = settingsRepository.settings
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppSettings())

    val user: StateFlow<User?> = sessionManager.state
        .map { (it as? AuthState.Authenticated)?.user }
        .stateIn(viewModelScope, SharingStarted.Eagerly, (sessionManager.state.value as? AuthState.Authenticated)?.user)

    fun setTheme(mode: ThemeMode) {
        viewModelScope.launch { settingsRepository.setThemeMode(mode) }
    }

    fun setLocale(locale: AppLocale) {
        viewModelScope.launch {
            // Updates the pref + synchronous tag and triggers the recreate.
            localeController.setLocale(locale)
            // Persist to the account so the web/iOS clients stay in sync.
            runCatching { authRepository.updateProfile(locale = locale.tag) }
                .onSuccess { sessionManager.updateUser(it) }
        }
    }

    fun setEnvironment(env: ApiEnvironment) {
        viewModelScope.launch { settingsRepository.setEnvironment(env) }
    }

    fun syncTimezone() {
        viewModelScope.launch {
            runCatching { authRepository.updateProfile(timezone = TimeZone.getDefault().id) }
                .onSuccess { sessionManager.updateUser(it) }
        }
    }

    fun logout() = sessionManager.signOut()
}

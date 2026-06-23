package dev.getjanus.synapse.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.synapse.core.datastore.AppLocale
import dev.getjanus.synapse.core.datastore.AppSettings
import dev.getjanus.synapse.core.datastore.SettingsRepository
import dev.getjanus.synapse.core.locale.LocaleController
import dev.getjanus.synapse.core.session.AuthState
import dev.getjanus.synapse.core.session.SessionManager
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RootViewModel @Inject constructor(
    private val sessionManager: SessionManager,
    private val settingsRepository: SettingsRepository,
    private val localeController: LocaleController,
) : ViewModel() {

    val authState: StateFlow<AuthState> = sessionManager.state

    val settings: StateFlow<AppSettings> = settingsRepository.settings
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppSettings())

    /** Emits when the active language changed and the Activity must recreate. */
    val recreateEvents: SharedFlow<Unit> = localeController.recreate

    fun completeOnboarding() = sessionManager.onOnboardingComplete()

    fun setLocale(locale: AppLocale) {
        viewModelScope.launch { localeController.setLocale(locale) }
    }
}

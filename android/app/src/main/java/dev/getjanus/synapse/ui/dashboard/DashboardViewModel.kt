package dev.getjanus.synapse.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.synapse.core.network.ApiException
import dev.getjanus.synapse.core.session.AuthState
import dev.getjanus.synapse.core.session.SessionManager
import dev.getjanus.synapse.core.util.UiState
import dev.getjanus.synapse.data.progress.DashboardDto
import dev.getjanus.synapse.data.progress.ProgressRepository
import dev.getjanus.synapse.domain.model.User
import dev.getjanus.synapse.widget.WidgetUpdater
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: ProgressRepository,
    private val sessionManager: SessionManager,
    private val widgetUpdater: WidgetUpdater,
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<DashboardDto>>(UiState.Loading)
    val state: StateFlow<UiState<DashboardDto>> = _state.asStateFlow()

    private val _refreshing = MutableStateFlow(false)
    val refreshing: StateFlow<Boolean> = _refreshing.asStateFlow()

    val user: User?
        get() = (sessionManager.state.value as? AuthState.Authenticated)?.user

    init { load() }

    fun load() {
        viewModelScope.launch {
            runCatching { repository.dashboard() }
                .onSuccess {
                    _state.value = UiState.Success(it)
                    runCatching { widgetUpdater.update(streakDays = it.streakDays, dueNow = it.dueNow) }
                }
                .onFailure { _state.value = UiState.Error((it as? ApiException)?.detail ?: it.message ?: "Error") }
        }
    }

    fun refresh() {
        _refreshing.update { true }
        viewModelScope.launch {
            runCatching { repository.dashboard() }
                .onSuccess { _state.value = UiState.Success(it) }
                .onFailure { /* keep last good data on refresh failure */ }
            _refreshing.update { false }
        }
    }
}

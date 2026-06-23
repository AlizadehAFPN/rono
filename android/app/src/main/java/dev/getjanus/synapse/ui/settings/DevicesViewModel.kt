package dev.getjanus.synapse.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.synapse.core.network.ApiException
import dev.getjanus.synapse.core.util.UiState
import dev.getjanus.synapse.data.auth.AuthRepository
import dev.getjanus.synapse.data.auth.SessionDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DevicesViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<List<SessionDto>>>(UiState.Loading)
    val state: StateFlow<UiState<List<SessionDto>>> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            runCatching { authRepository.sessions() }
                .onSuccess { _state.value = UiState.Success(it) }
                .onFailure { _state.value = UiState.Error((it as? ApiException)?.detail ?: it.message ?: "Error") }
        }
    }

    fun revoke(id: String) {
        viewModelScope.launch {
            runCatching { authRepository.revokeSession(id) }.onSuccess { load() }
        }
    }

    fun revokeOthers() {
        viewModelScope.launch {
            runCatching { authRepository.revokeOtherSessions() }.onSuccess { load() }
        }
    }
}

package dev.getjanus.synapse.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.synapse.core.network.ApiException
import dev.getjanus.synapse.data.auth.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ChangePasswordState(
    val current: String = "",
    val new: String = "",
    val submitting: Boolean = false,
    val error: String? = null,
    val done: Boolean = false,
)

@HiltViewModel
class ChangePasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ChangePasswordState())
    val state: StateFlow<ChangePasswordState> = _state.asStateFlow()

    fun onCurrent(v: String) = _state.update { it.copy(current = v, error = null) }
    fun onNew(v: String) = _state.update { it.copy(new = v, error = null) }

    fun submit() {
        val s = _state.value
        if (s.submitting || s.current.isBlank() || s.new.length < 8) return
        _state.update { it.copy(submitting = true, error = null) }
        viewModelScope.launch {
            runCatching { authRepository.changePassword(s.current, s.new) }
                .onSuccess { _state.update { it.copy(submitting = false, done = true) } }
                .onFailure { e -> _state.update { it.copy(submitting = false, error = (e as? ApiException)?.detail ?: e.message) } }
        }
    }
}

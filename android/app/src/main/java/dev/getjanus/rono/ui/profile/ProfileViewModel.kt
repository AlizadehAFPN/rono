package dev.getjanus.rono.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.rono.core.network.MediaUrlResolver
import dev.getjanus.rono.core.session.AuthState
import dev.getjanus.rono.core.session.SessionManager
import dev.getjanus.rono.data.auth.AuthRepository
import dev.getjanus.rono.data.progress.ProgressDto
import dev.getjanus.rono.data.progress.ProgressRepository
import dev.getjanus.rono.domain.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val progressRepository: ProgressRepository,
    private val sessionManager: SessionManager,
    private val mediaUrlResolver: MediaUrlResolver,
) : ViewModel() {

    val user: StateFlow<User?> = sessionManager.state
        .map { (it as? AuthState.Authenticated)?.user }
        .stateIn(viewModelScope, SharingStarted.Eagerly, (sessionManager.state.value as? AuthState.Authenticated)?.user)

    private val _saving = MutableStateFlow(false)
    val saving: StateFlow<Boolean> = _saving

    private val _stats = MutableStateFlow<ProgressDto?>(null)
    val stats: StateFlow<ProgressDto?> = _stats

    init {
        viewModelScope.launch { runCatching { progressRepository.progress() }.onSuccess { _stats.value = it } }
    }

    fun avatarUrl(user: User?): String? = mediaUrlResolver.resolve(user?.avatarUrl)

    fun saveName(name: String) {
        if (name.isBlank()) return
        _saving.update { true }
        viewModelScope.launch {
            runCatching { authRepository.updateProfile(fullName = name.trim()) }
                .onSuccess { sessionManager.updateUser(it) }
            _saving.update { false }
        }
    }

    fun uploadAvatar(bytes: ByteArray, mimeType: String, fileName: String) {
        _saving.update { true }
        viewModelScope.launch {
            runCatching { authRepository.uploadAvatar(bytes, mimeType, fileName) }
                .onSuccess { sessionManager.updateUser(it) }
            _saving.update { false }
        }
    }

    fun removeAvatar() {
        _saving.update { true }
        viewModelScope.launch {
            runCatching { authRepository.deleteAvatar() }.onSuccess { sessionManager.updateUser(it) }
            _saving.update { false }
        }
    }
}

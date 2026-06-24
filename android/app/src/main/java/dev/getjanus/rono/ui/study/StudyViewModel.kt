package dev.getjanus.rono.ui.study

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.rono.core.network.ApiException
import dev.getjanus.rono.core.util.UiState
import dev.getjanus.rono.data.progress.ProgressRepository
import dev.getjanus.rono.data.study.CategoryCardDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StudyViewModel @Inject constructor(
    private val repository: ProgressRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<List<CategoryCardDto>>>(UiState.Loading)
    val state: StateFlow<UiState<List<CategoryCardDto>>> = _state.asStateFlow()

    private val _refreshing = MutableStateFlow(false)
    val refreshing: StateFlow<Boolean> = _refreshing.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            runCatching { repository.categories() }
                .onSuccess { _state.value = UiState.Success(it.categories) }
                .onFailure { _state.value = UiState.Error((it as? ApiException)?.detail ?: it.message ?: "Error") }
        }
    }

    fun refresh() {
        _refreshing.update { true }
        viewModelScope.launch {
            runCatching { repository.categories() }.onSuccess { _state.value = UiState.Success(it.categories) }
            _refreshing.update { false }
        }
    }
}

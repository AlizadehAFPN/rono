package dev.getjanus.rono.ui.daily

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.rono.core.network.ApiException
import dev.getjanus.rono.core.util.UiState
import dev.getjanus.rono.data.progress.ProgressRepository
import dev.getjanus.rono.data.study.CategoryCardDto
import dev.getjanus.rono.ui.navigation.SessionRoute
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class BudgetMode { COUNT, TIME }

data class DailyConfig(
    val selected: Set<String> = emptySet(),
    val budgetMode: BudgetMode = BudgetMode.COUNT,
    val countTarget: Int = 20,
    val timeMinutes: Int = 20,
    val selfRatedLevel: String? = null,
)

@HiltViewModel
class DailyReviewViewModel @Inject constructor(
    private val repository: ProgressRepository,
) : ViewModel() {

    private val _categories = MutableStateFlow<UiState<List<CategoryCardDto>>>(UiState.Loading)
    val categories: StateFlow<UiState<List<CategoryCardDto>>> = _categories.asStateFlow()

    private val _config = MutableStateFlow(DailyConfig())
    val config: StateFlow<DailyConfig> = _config.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            runCatching { repository.categories() }
                .onSuccess { overview ->
                    _categories.value = UiState.Success(overview.categories)
                    // Default: all collections selected.
                    _config.update { it.copy(selected = overview.categories.map { c -> c.topicId }.toSet()) }
                }
                .onFailure { _categories.value = UiState.Error((it as? ApiException)?.detail ?: it.message ?: "Error") }
        }
    }

    fun toggle(topicId: String) = _config.update {
        val next = it.selected.toMutableSet().apply { if (!add(topicId)) remove(topicId) }
        it.copy(selected = next)
    }

    fun selectAll() {
        val all = (_categories.value as? UiState.Success)?.data?.map { it.topicId }?.toSet() ?: emptySet()
        _config.update { it.copy(selected = all) }
    }

    fun setBudgetMode(mode: BudgetMode) = _config.update { it.copy(budgetMode = mode) }
    fun setCount(count: Int) = _config.update { it.copy(countTarget = count) }
    fun setTime(minutes: Int) = _config.update { it.copy(timeMinutes = minutes) }
    fun setLevel(level: String?) = _config.update { it.copy(selfRatedLevel = level) }

    fun buildRoute(): SessionRoute {
        val cfg = _config.value
        val all = (_categories.value as? UiState.Success)?.data?.map { it.topicId }?.toSet() ?: emptySet()
        val topicIds = if (cfg.selected == all || cfg.selected.isEmpty()) emptyList() else cfg.selected.toList()
        return SessionRoute(
            sessionType = "daily_review",
            topicIds = topicIds,
            itemsTarget = if (cfg.budgetMode == BudgetMode.COUNT) cfg.countTarget else 200,
            limitType = if (cfg.budgetMode == BudgetMode.COUNT) "count" else "time",
            timeLimitMinutes = if (cfg.budgetMode == BudgetMode.TIME) cfg.timeMinutes else null,
            selfRatedLevel = cfg.selfRatedLevel,
        )
    }
}

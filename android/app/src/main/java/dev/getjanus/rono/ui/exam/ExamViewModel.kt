package dev.getjanus.rono.ui.exam

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.rono.core.haptics.Haptics
import dev.getjanus.rono.core.network.ApiException
import dev.getjanus.rono.data.practice.AnswerResultDto
import dev.getjanus.rono.data.practice.AnswerSubmitRequest
import dev.getjanus.rono.data.practice.BulkAnswerSubmitRequest
import dev.getjanus.rono.data.practice.ExamItemDto
import dev.getjanus.rono.data.practice.PracticeRepository
import dev.getjanus.rono.data.practice.SessionStartRequest
import dev.getjanus.rono.data.practice.SessionSummaryDto
import dev.getjanus.rono.ui.navigation.ExamRoute
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface ExamPhase {
    data object Loading : ExamPhase
    data object Running : ExamPhase
    data object Submitting : ExamPhase
    data class Results(val summary: SessionSummaryDto) : ExamPhase
    data class Failed(val message: String) : ExamPhase
}

data class ExamUiState(
    val phase: ExamPhase = ExamPhase.Loading,
    val paper: List<ExamItemDto> = emptyList(),
    val index: Int = 0,
    val answers: Map<String, String> = emptyMap(),
    val results: Map<String, AnswerResultDto> = emptyMap(),
    val flagged: Set<String> = emptySet(),
    val instantFeedback: Boolean = false,
    val startedAtMs: Long = 0L,
) {
    val current: ExamItemDto? get() = paper.getOrNull(index)
    val answeredCount: Int get() = answers.size
}

@HiltViewModel
class ExamViewModel @Inject constructor(
    private val repository: PracticeRepository,
    private val haptics: Haptics,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val route: ExamRoute = savedStateHandle.toRoute()
    private val _state = MutableStateFlow(ExamUiState(instantFeedback = route.instantFeedback))
    val state: StateFlow<ExamUiState> = _state.asStateFlow()

    private var sessionId: String? = null

    init { start() }

    private fun start() {
        _state.update { it.copy(phase = ExamPhase.Loading) }
        viewModelScope.launch {
            runCatching {
                val session = repository.start(
                    SessionStartRequest(
                        sessionType = "adaptive_practice",
                        examType = route.examType,
                        examPart = route.examPart,
                        itemsTarget = route.count,
                    ),
                )
                sessionId = session.id
                repository.examPaper(session.id, route.count)
            }.onSuccess { paper ->
                _state.update {
                    it.copy(
                        phase = ExamPhase.Running,
                        paper = paper.items,
                        startedAtMs = System.currentTimeMillis(),
                    )
                }
            }.onFailure { fail(it) }
        }
    }

    fun select(optionId: String) {
        val item = _state.value.current ?: return
        if (_state.value.results.containsKey(item.itemId)) return // already locked (instant)
        haptics.select()
        _state.update { it.copy(answers = it.answers + (item.itemId to optionId)) }
        if (_state.value.instantFeedback) submitOne(item.itemId, optionId)
    }

    private fun submitOne(itemId: String, optionId: String) {
        val id = sessionId ?: return
        viewModelScope.launch {
            runCatching { repository.answer(id, AnswerSubmitRequest(itemId = itemId, selectedOptionId = optionId)) }
                .onSuccess { result ->
                    if (result.isCorrect) haptics.success() else haptics.error()
                    _state.update { it.copy(results = it.results + (itemId to result)) }
                }
        }
    }

    fun goTo(i: Int) = _state.update { it.copy(index = i.coerceIn(0, (it.paper.size - 1).coerceAtLeast(0))) }
    fun next() = goTo(_state.value.index + 1)
    fun prev() = goTo(_state.value.index - 1)

    fun toggleFlag() {
        val item = _state.value.current ?: return
        _state.update {
            val f = it.flagged.toMutableSet().apply { if (!add(item.itemId)) remove(item.itemId) }
            it.copy(flagged = f)
        }
    }

    fun submitExam() {
        val id = sessionId ?: return
        if (_state.value.phase == ExamPhase.Submitting) return
        _state.update { it.copy(phase = ExamPhase.Submitting) }
        viewModelScope.launch {
            runCatching {
                // Grade every not-yet-submitted question in one atomic round-trip, then
                // finish. Instant-feedback answers were already graded live, so they're
                // skipped; unanswered questions are submitted as blanks (was_skipped).
                val s = _state.value
                val pending = s.paper.filter { !s.results.containsKey(it.itemId) }
                if (pending.isNotEmpty()) {
                    val payload = pending.map { item ->
                        val sel = s.answers[item.itemId]
                        AnswerSubmitRequest(itemId = item.itemId, selectedOptionId = sel, wasSkipped = sel == null)
                    }
                    val batch = repository.bulkAnswer(id, BulkAnswerSubmitRequest(payload))
                    _state.update { st -> st.copy(results = st.results + batch.results.associateBy { it.itemId }) }
                }
                repository.finish(id)
            }.onSuccess { summary -> _state.update { it.copy(phase = ExamPhase.Results(summary)) } }
                .onFailure { fail(it) }
        }
    }

    fun retry() = start()

    private fun fail(t: Throwable) {
        _state.update { it.copy(phase = ExamPhase.Failed((t as? ApiException)?.detail ?: t.message ?: "Error")) }
    }
}

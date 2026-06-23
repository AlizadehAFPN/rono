package dev.getjanus.synapse.ui.study

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.synapse.core.haptics.Haptics
import dev.getjanus.synapse.core.network.ApiException
import dev.getjanus.synapse.data.practice.AnswerResultDto
import dev.getjanus.synapse.data.practice.AnswerSubmitRequest
import dev.getjanus.synapse.data.practice.NextItemDto
import dev.getjanus.synapse.data.practice.PracticeRepository
import dev.getjanus.synapse.data.practice.SessionStartRequest
import dev.getjanus.synapse.data.practice.SessionSummaryDto
import dev.getjanus.synapse.ui.navigation.SessionRoute
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface SessionStage {
    data object Loading : SessionStage
    data class Question(val item: NextItemDto, val selectedOptionId: String?) : SessionStage
    data class Feedback(
        val item: NextItemDto,
        val result: AnswerResultDto,
        val selectedOptionId: String?,
    ) : SessionStage
    data object Finishing : SessionStage
    data class Finished(val summary: SessionSummaryDto) : SessionStage
    data class Failed(val message: String) : SessionStage
}

data class SessionUiState(
    val stage: SessionStage = SessionStage.Loading,
    val delivered: Int = 0,
    val target: Int? = null,
    val correct: Int = 0,
    val streak: Int = 0,
    val theta: Double? = null,
    val submitting: Boolean = false,
    /** Soft deadline for time-budgeted (daily review) sessions, epoch millis. */
    val deadlineEpochMs: Long? = null,
) {
    val accuracy: Double?
        get() = if (delivered > 0) correct.toDouble() / delivered else null
}

@HiltViewModel
class SessionViewModel @Inject constructor(
    private val repository: PracticeRepository,
    private val haptics: Haptics,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val route: SessionRoute = savedStateHandle.toRoute()

    private val _state = MutableStateFlow(SessionUiState())
    val state: StateFlow<SessionUiState> = _state.asStateFlow()

    private var sessionId: String? = null
    private var questionStartMs: Long = 0L

    init { startSession() }

    private fun startSession() {
        _state.update { it.copy(stage = SessionStage.Loading) }
        viewModelScope.launch {
            val request = SessionStartRequest(
                sessionType = route.sessionType,
                examType = route.examType,
                examPart = route.examPart,
                topicId = route.topicId,
                topicIds = route.topicIds.ifEmpty { null },
                itemsTarget = route.itemsTarget,
                limitType = route.limitType,
                timeLimitMinutes = route.timeLimitMinutes,
                selfRatedLevel = route.selfRatedLevel,
            )
            runCatching { repository.start(request) }
                .onSuccess { session ->
                    sessionId = session.id
                    val deadline = route.timeLimitMinutes
                        ?.takeIf { route.limitType == "time" }
                        ?.let { System.currentTimeMillis() + it * 60_000L }
                    _state.update {
                        it.copy(target = session.itemsTarget, theta = session.thetaStart, deadlineEpochMs = deadline)
                    }
                    loadNext()
                }
                .onFailure { fail(it) }
        }
    }

    private fun loadNext() {
        val id = sessionId ?: return
        _state.update { it.copy(stage = SessionStage.Loading) }
        viewModelScope.launch {
            runCatching { repository.next(id) }
                .onSuccess { next ->
                    if (next.hasItem) {
                        questionStartMs = System.currentTimeMillis()
                        _state.update {
                            it.copy(
                                stage = SessionStage.Question(next, null),
                                delivered = next.itemsDelivered,
                                target = next.itemsTarget ?: it.target,
                                theta = next.selectionTheta ?: it.theta,
                            )
                        }
                    } else {
                        finish()
                    }
                }
                .onFailure { fail(it) }
        }
    }

    fun selectOption(optionId: String) {
        val stage = _state.value.stage
        if (stage is SessionStage.Question) {
            haptics.select()
            _state.update { it.copy(stage = stage.copy(selectedOptionId = optionId)) }
        }
    }

    fun submit() {
        val stage = _state.value.stage
        if (stage !is SessionStage.Question || stage.selectedOptionId == null || _state.value.submitting) return
        answer(stage.item, stage.selectedOptionId, skipped = false)
    }

    fun skip() {
        val stage = _state.value.stage
        if (stage !is SessionStage.Question || _state.value.submitting) return
        answer(stage.item, null, skipped = true)
    }

    private fun answer(item: NextItemDto, optionId: String?, skipped: Boolean) {
        val id = sessionId ?: return
        val itemId = item.itemId ?: return
        _state.update { it.copy(submitting = true) }
        val elapsed = (System.currentTimeMillis() - questionStartMs).toInt().coerceAtLeast(0)
        viewModelScope.launch {
            runCatching {
                repository.answer(
                    id,
                    AnswerSubmitRequest(
                        itemId = itemId,
                        selectedOptionId = optionId,
                        responseTimeMs = elapsed,
                        wasSkipped = skipped,
                    ),
                )
            }.onSuccess { result ->
                if (skipped) haptics.tap() else if (result.isCorrect) haptics.success() else haptics.error()
                _state.update {
                    it.copy(
                        stage = SessionStage.Feedback(item, result, optionId),
                        submitting = false,
                        delivered = result.itemsDelivered,
                        correct = result.itemsCorrect,
                        streak = if (result.isCorrect) it.streak + 1 else 0,
                        theta = result.thetaAfter,
                    )
                }
            }.onFailure {
                _state.update { s -> s.copy(submitting = false) }
                fail(it)
            }
        }
    }

    fun next() = loadNext()

    fun finish() {
        val id = sessionId ?: return
        _state.update { it.copy(stage = SessionStage.Finishing) }
        viewModelScope.launch {
            runCatching { repository.finish(id) }
                .onSuccess { summary -> _state.update { it.copy(stage = SessionStage.Finished(summary)) } }
                .onFailure { fail(it) }
        }
    }

    fun retry() = startSession()

    private fun fail(t: Throwable) {
        _state.update { it.copy(stage = SessionStage.Failed((t as? ApiException)?.detail ?: t.message ?: "Error")) }
    }
}

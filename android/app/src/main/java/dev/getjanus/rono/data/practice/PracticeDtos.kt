package dev.getjanus.rono.data.practice

import kotlinx.serialization.Serializable

@Serializable
data class SessionStartRequest(
    val sessionType: String = "adaptive_practice",
    val examType: String? = null,
    val examPart: String? = null,
    val topicId: String? = null,
    val topicIds: List<String>? = null,
    val itemsTarget: Int? = 10,
    val limitType: String? = null,
    val timeLimitMinutes: Int? = null,
    val selfRatedLevel: String? = null,
    val deviceType: String? = "mobile",
)

@Serializable
data class SessionDto(
    val id: String,
    val sessionType: String,
    val status: String,
    val itemsTarget: Int? = null,
    val itemsDelivered: Int = 0,
    val itemsCorrect: Int = 0,
    val scorePercent: Double? = null,
    val thetaStart: Double? = null,
    val thetaEnd: Double? = null,
    val limitType: String? = null,
    val timeLimitMinutes: Int? = null,
)

@Serializable
data class OptionDto(
    val id: String,
    val key: String,
    val content: String,
    val displayOrder: Int = 0,
)

/** A shared reading passage / scenario (متن مشترک) attached to a question. The
 * full passage travels with each question so it can be re-read at any time. */
@Serializable
data class StimulusDto(
    val id: String,
    val content: String,
    val imageUrl: String? = null,
    val groupNo: Int? = null,
    val orderInGroup: Int? = null,
    val totalInGroup: Int? = null,
)

/**
 * Merged shape for GET /next, which returns either NextItemOut or NoMoreItems.
 * [itemId] is null when the candidate pool is exhausted ([hasItem] == false).
 */
@Serializable
data class NextItemDto(
    val sessionId: String,
    val itemId: String? = null,
    val itemVersionId: String? = null,
    val content: String? = null,
    val imageUrl: String? = null,
    val options: List<OptionDto> = emptyList(),
    val primaryTopicId: String? = null,
    val stimulus: StimulusDto? = null,
    val selectionTheta: Double? = null,
    val itemIrtA: Double? = null,
    val itemIrtB: Double? = null,
    val fisherInformation: Double? = null,
    val itemsDelivered: Int = 0,
    val itemsTarget: Int? = null,
    val detail: String? = null,
) {
    val hasItem: Boolean get() = itemId != null && content != null
}

@Serializable
data class ExamItemDto(
    val itemId: String,
    val itemVersionId: String,
    val content: String,
    val imageUrl: String? = null,
    val options: List<OptionDto> = emptyList(),
    val primaryTopicId: String? = null,
    val stimulus: StimulusDto? = null,
)

@Serializable
data class ExamPaperDto(
    val sessionId: String,
    val items: List<ExamItemDto> = emptyList(),
    val count: Int = 0,
)

@Serializable
data class AnswerSubmitRequest(
    val itemId: String,
    val selectedOptionId: String? = null,
    val responseTimeMs: Int? = null,
    val wasSkipped: Boolean = false,
    val isTimedOut: Boolean = false,
)

@Serializable
data class CardScheduleDto(
    val rating: Int = 0,
    val state: String = "",
    val stability: Double = 0.0,
    val difficulty: Double = 0.0,
    val dueAt: String? = null,
    val scheduledIntervalDays: Double = 0.0,
    val reps: Int = 0,
    val lapses: Int = 0,
)

@Serializable
data class AnswerResultDto(
    val responseId: Long = 0,
    val itemId: String,
    val isCorrect: Boolean = false,
    val wasSkipped: Boolean = false,
    val correctOptionId: String? = null,
    val explanation: String? = null,
    val thetaBefore: Double = 0.0,
    val thetaAfter: Double = 0.0,
    val thetaSeAfter: Double = 0.0,
    val topicThetaAfter: Double? = null,
    val card: CardScheduleDto = CardScheduleDto(),
    val itemsDelivered: Int = 0,
    val itemsCorrect: Int = 0,
) {
    val thetaDelta: Double get() = thetaAfter - thetaBefore
}

@Serializable
data class BulkAnswerSubmitRequest(
    val answers: List<AnswerSubmitRequest>,
)

@Serializable
data class BulkAnswerResultDto(
    val results: List<AnswerResultDto> = emptyList(),
)

@Serializable
data class SessionSummaryDto(
    val id: String,
    val status: String = "completed",
    val itemsDelivered: Int = 0,
    val itemsCorrect: Int = 0,
    val itemsSkipped: Int = 0,
    val itemsWrong: Int = 0,
    val scorePercent: Double? = null,
    val netScore: Double? = null,
    val penaltyPerWrong: Double? = null,
    val thetaStart: Double? = null,
    val thetaEnd: Double? = null,
    val thetaDelta: Double? = null,
    val timeSpentSeconds: Int? = null,
)

package dev.getjanus.rono.data.study

import kotlinx.serialization.Serializable

@Serializable
data class CategoryCardDto(
    val topicId: String,
    val topicName: String,
    val level: Int = 0,
    val examType: String? = null,
    val totalQuestions: Int = 0,
    val answered: Int = 0,
    val newCount: Int = 0,
    val dueCount: Int = 0,
    val masteryLevel: String = "none",
    val topicTheta: Double? = null,
    val accuracyRate: Double? = null,
    val journeyState: String = "not_started",
    val recommendedMode: String? = null,
) {
    /** Coverage fraction (answered / total) for the card's progress ring. */
    val coverage: Float
        get() = if (totalQuestions > 0) (answered.toFloat() / totalQuestions).coerceIn(0f, 1f) else 0f
}

@Serializable
data class StudyOverviewDto(
    val categories: List<CategoryCardDto> = emptyList(),
)

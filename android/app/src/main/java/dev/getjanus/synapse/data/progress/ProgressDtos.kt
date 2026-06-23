package dev.getjanus.synapse.data.progress

import kotlinx.serialization.Serializable

@Serializable
data class TopicMasteryDto(
    val topicId: String,
    val topicName: String,
    val masteryLevel: String,
    val theta: Double? = null,
    val totalResponses: Int = 0,
    val correctResponses: Int = 0,
    val accuracyRate: Double? = null,
)

@Serializable
data class SessionBriefDto(
    val id: String,
    val sessionType: String,
    val status: String,
    val itemsDelivered: Int = 0,
    val itemsCorrect: Int = 0,
    val scorePercent: Double? = null,
    val netScore: Double? = null,
    val startedAt: String? = null,
    val completedAt: String? = null,
)

@Serializable
data class ProgressDto(
    val globalTheta: Double? = null,
    val globalThetaSe: Double? = null,
    val totalResponses: Int = 0,
    val totalCorrect: Int = 0,
    val accuracy: Double? = null,
    val topics: List<TopicMasteryDto> = emptyList(),
    val recentSessions: List<SessionBriefDto> = emptyList(),
)

@Serializable
data class AbilityDto(
    val theta: Double? = null,
    val thetaSe: Double? = null,
    val level: String = "beginner",
)

@Serializable
data class ActivityPointDto(val date: String, val count: Int = 0)

@Serializable
data class ThetaPointDto(val at: String, val theta: Double)

@Serializable
data class SubjectRefDto(
    val topicId: String,
    val topicName: String,
    val accuracyRate: Double? = null,
)

@Serializable
data class DashboardDto(
    val ability: AbilityDto = AbilityDto(),
    val answered: Int = 0,
    val correct: Int = 0,
    val accuracy: Double? = null,
    val sessions: Int = 0,
    val libraryTotal: Int = 0,
    val librarySeen: Int = 0,
    val libraryNew: Int = 0,
    val dueNow: Int = 0,
    val cardsLearning: Int = 0,
    val cardsReview: Int = 0,
    val topicsActive: Int = 0,
    val topicsMastered: Int = 0,
    val mastery: Map<String, Int> = emptyMap(),
    val streakDays: Int = 0,
    val activity: List<ActivityPointDto> = emptyList(),
    val thetaTrend: List<ThetaPointDto> = emptyList(),
    val strongest: SubjectRefDto? = null,
    val focus: SubjectRefDto? = null,
    val recentSessions: List<SessionBriefDto> = emptyList(),
)

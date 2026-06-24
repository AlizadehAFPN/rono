package dev.getjanus.rono.domain.model

/**
 * Per-topic / global mastery band. Strings match the backend `mastery_level`
 * (beginner|developing|proficient|advanced); [NONE] = no data yet. Bands are
 * derived from ability θ server-side (β<-0.5, <0.5, <1.5, ≥1.5).
 */
enum class MasteryLevel {
    NONE, BEGINNER, DEVELOPING, PROFICIENT, ADVANCED;

    companion object {
        fun fromApi(value: String?): MasteryLevel = when (value?.lowercase()) {
            "beginner" -> BEGINNER
            "developing" -> DEVELOPING
            "proficient" -> PROFICIENT
            "advanced" -> ADVANCED
            else -> NONE
        }

        /** Map a θ value to a band client-side (mirrors backend thresholds). */
        fun fromTheta(theta: Double?): MasteryLevel = when {
            theta == null -> NONE
            theta < -0.5 -> BEGINNER
            theta < 0.5 -> DEVELOPING
            theta < 1.5 -> PROFICIENT
            else -> ADVANCED
        }
    }
}

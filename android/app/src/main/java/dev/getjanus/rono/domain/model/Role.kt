package dev.getjanus.rono.domain.model

/**
 * Membership role. The Android app is student-facing, but /auth/me may report
 * any role; [rank] lets us gate the (very few) staff-only affordances out.
 */
enum class Role(val api: String, val rank: Int) {
    STUDENT("student", 0),
    CONTENT_AUTHOR("content_author", 1),
    INSTRUCTOR("instructor", 2),
    COORDINATOR("coordinator", 3),
    INSTITUTION_ADMIN("institution_admin", 4),
    SYSTEM_ADMIN("system_admin", 5);

    fun gte(other: Role): Boolean = rank >= other.rank

    companion object {
        fun fromApi(value: String?): Role =
            entries.firstOrNull { it.api == value } ?: STUDENT
    }
}

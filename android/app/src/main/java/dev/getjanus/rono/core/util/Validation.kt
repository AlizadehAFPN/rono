package dev.getjanus.rono.core.util

object Validation {
    private val EMAIL = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")

    fun isEmailValid(email: String): Boolean = EMAIL.matches(email.trim())

    /** Backend policy: ≥8 chars, at least one upper, one lower, one digit. */
    fun passwordIssue(password: String): PasswordIssue? = when {
        password.length < 8 -> PasswordIssue.TOO_SHORT
        !password.any { it.isUpperCase() } ||
            !password.any { it.isLowerCase() } ||
            !password.any { it.isDigit() } -> PasswordIssue.RULES
        else -> null
    }

    enum class PasswordIssue { TOO_SHORT, RULES }
}

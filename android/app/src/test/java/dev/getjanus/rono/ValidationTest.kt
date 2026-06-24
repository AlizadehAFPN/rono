package dev.getjanus.rono

import dev.getjanus.rono.core.util.Validation
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ValidationTest {

    @Test
    fun emails() {
        assertTrue(Validation.isEmailValid("student@rono-demo.edu"))
        assertTrue(Validation.isEmailValid("  a@b.co "))
        assertFalse(Validation.isEmailValid("nope"))
        assertFalse(Validation.isEmailValid("a@b"))
        assertFalse(Validation.isEmailValid("a b@c.com"))
    }

    @Test
    fun passwords() {
        assertEquals(Validation.PasswordIssue.TOO_SHORT, Validation.passwordIssue("Ab1"))
        assertEquals(Validation.PasswordIssue.RULES, Validation.passwordIssue("alllowercase1"))
        assertEquals(Validation.PasswordIssue.RULES, Validation.passwordIssue("NoDigitsHere"))
        assertNull(Validation.passwordIssue("Study1234!"))
        assertNull(Validation.passwordIssue("Abcdefg1"))
    }
}

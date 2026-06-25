"""Unit tests for exam negative-marking scoring.

The penalty is a *reporting* figure layered on top of binary outcomes; it must
never alter the underlying skill estimate or review scheduling. These tests pin
the "منفی یک‌سوم" rule (1/3-point per wrong answer) and the net-score arithmetic
used by finish_session.
"""

from app.services.practice_service import THIRD, penalty_for_exam


def test_employment_exams_use_one_third_penalty():
    assert penalty_for_exam("education") == THIRD
    assert penalty_for_exam("executive") == THIRD
    assert penalty_for_exam("bank") == THIRD
    assert penalty_for_exam("social_security") == THIRD


def test_unlisted_exams_default_to_zero():
    assert penalty_for_exam("tus") == 0.0
    assert penalty_for_exam(None) == 0.0
    assert penalty_for_exam("") == 0.0


def _net_score(delivered: int, correct: int, skipped: int, penalty: float) -> float:
    """Mirror of the formula in finish_session — blanks excluded from penalty."""
    wrong = max(delivered - correct - skipped, 0)
    return round(correct - wrong * penalty, 3)


def test_net_score_deducts_only_wrong_answers():
    # 120 delivered: 80 correct, 30 wrong, 10 skipped -> 80 - 30*(1/3) = 70.0
    assert _net_score(120, 80, 10, penalty_for_exam("education")) == 70.0


def test_skips_are_never_penalised():
    # All-skipped attempt scores zero, not negative.
    assert _net_score(50, 0, 50, penalty_for_exam("education")) == 0.0


def test_no_penalty_means_net_equals_correct():
    assert _net_score(100, 60, 0, penalty_for_exam("tus")) == 60

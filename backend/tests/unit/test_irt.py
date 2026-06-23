"""
Unit tests for the IRT 2PL engine.

These tests pin down correctness two ways:
  1. **Reference values** — quantities a human can compute by hand from the 2PL
     formula, asserted to tight tolerance.
  2. **Invariants** — structural properties the model must always satisfy
     (monotonicity, symmetry, information peaks at θ=b, EAP convergence, SE
     shrinkage). Invariants catch whole classes of bugs that a few point checks
     would miss.

No database, no async — pure math.
"""

import math

import pytest

from app.services.irt.engine import (
    DEFAULT_A,
    DEFAULT_B,
    ItemParams,
    ResponsePoint,
    estimate_theta_eap,
    fisher_information,
    prob_correct,
    select_next_item,
)

# ---------------------------------------------------------------------------
# prob_correct — reference values
# ---------------------------------------------------------------------------


def test_prob_at_difficulty_is_one_half():
    # When θ == b, the exponent is 0 → P = 0.5 for any discrimination.
    for a in (0.5, 1.0, 2.5):
        assert prob_correct(theta=0.0, a=a, b=0.0) == pytest.approx(0.5)
        assert prob_correct(theta=1.3, a=a, b=1.3) == pytest.approx(0.5)


def test_prob_reference_value():
    # a=1, θ=1, b=0 → 1/(1+e^-1) = 0.7310585786...
    assert prob_correct(1.0, a=1.0, b=0.0) == pytest.approx(0.7310585786, abs=1e-9)
    # a=2, θ=0, b=1 → z=-2 → 1/(1+e^2) = 0.1192029220...
    assert prob_correct(0.0, a=2.0, b=1.0) == pytest.approx(0.1192029220, abs=1e-9)


def test_prob_is_monotonic_in_theta():
    thetas = [-3, -1, 0, 0.5, 2, 4]
    probs = [prob_correct(t, a=1.2, b=0.3) for t in thetas]
    assert probs == sorted(probs)  # strictly non-decreasing in θ


def test_prob_symmetry_about_difficulty():
    # P(b + d) = 1 - P(b - d) by logistic symmetry.
    a, b = 1.7, 0.4
    for d in (0.1, 1.0, 2.5):
        assert prob_correct(b + d, a, b) == pytest.approx(1.0 - prob_correct(b - d, a, b))


def test_prob_numerically_stable_at_extremes():
    # Must not raise OverflowError and must saturate to (0, 1).
    assert prob_correct(50.0, a=3.0, b=0.0) == pytest.approx(1.0, abs=1e-9)
    assert prob_correct(-50.0, a=3.0, b=0.0) == pytest.approx(0.0, abs=1e-9)
    assert 0.0 < prob_correct(-50.0, a=3.0, b=0.0) <= 1.0


def test_higher_discrimination_is_steeper():
    # Above b, more discriminating item gives higher P; below b, lower P.
    assert prob_correct(0.5, a=2.5, b=0.0) > prob_correct(0.5, a=0.5, b=0.0)
    assert prob_correct(-0.5, a=2.5, b=0.0) < prob_correct(-0.5, a=0.5, b=0.0)


# ---------------------------------------------------------------------------
# fisher_information
# ---------------------------------------------------------------------------


def test_information_reference_value():
    # I(θ=b) = a² · 0.5 · 0.5 = a²/4.
    assert fisher_information(0.0, a=1.0, b=0.0) == pytest.approx(0.25)
    assert fisher_information(2.0, a=2.0, b=2.0) == pytest.approx(1.0)


def test_information_peaks_at_difficulty():
    a, b = 1.4, 0.6
    peak = fisher_information(b, a, b)
    for offset in (0.2, 0.8, 2.0, 3.0):
        assert fisher_information(b + offset, a, b) < peak
        assert fisher_information(b - offset, a, b) < peak


def test_information_is_symmetric_about_difficulty():
    a, b = 1.1, -0.3
    for d in (0.25, 1.0, 2.0):
        assert fisher_information(b + d, a, b) == pytest.approx(fisher_information(b - d, a, b))


def test_information_nonnegative():
    for t in (-4, -1, 0, 2, 5):
        assert fisher_information(t, a=1.0, b=0.0) >= 0.0


# ---------------------------------------------------------------------------
# select_next_item — maximum information selection
# ---------------------------------------------------------------------------


def test_select_picks_item_matched_to_ability():
    # A student at θ=1.0 should get the item whose difficulty is closest to 1.0
    # (all equal discrimination → info peaks at θ==b).
    candidates = [
        ItemParams("easy", a=1.0, b=-2.0),
        ItemParams("match", a=1.0, b=1.0),
        ItemParams("hard", a=1.0, b=3.0),
    ]
    chosen = select_next_item(1.0, candidates)
    assert chosen is not None and chosen.item_id == "match"


def test_select_prefers_higher_discrimination_when_difficulty_tied():
    candidates = [
        ItemParams("low_a", a=0.7, b=0.0),
        ItemParams("high_a", a=2.0, b=0.0),
    ]
    chosen = select_next_item(0.0, candidates)
    assert chosen is not None and chosen.item_id == "high_a"


def test_select_empty_pool_returns_none():
    assert select_next_item(0.0, []) is None


def test_select_is_deterministic_on_ties():
    # Two items with identical information must resolve to the same one every call.
    candidates = [
        ItemParams("zzz", a=1.0, b=0.0),
        ItemParams("aaa", a=1.0, b=0.0),
    ]
    picks = {select_next_item(0.0, candidates).item_id for _ in range(20)}
    assert picks == {"aaa"}  # lexicographically smallest id wins the tie


# ---------------------------------------------------------------------------
# estimate_theta_eap
# ---------------------------------------------------------------------------


def test_eap_no_responses_returns_prior():
    est = estimate_theta_eap([])
    assert est.theta == pytest.approx(0.0, abs=1e-6)
    assert est.se == pytest.approx(1.0, abs=1e-3)  # prior SD recovered on the grid
    assert est.n_responses == 0


def test_eap_all_correct_pushes_theta_positive():
    responses = [ResponsePoint(a=1.0, b=0.0, correct=True) for _ in range(5)]
    est = estimate_theta_eap(responses)
    assert est.theta > 0.5
    assert est.n_responses == 5


def test_eap_all_incorrect_pushes_theta_negative():
    responses = [ResponsePoint(a=1.0, b=0.0, correct=False) for _ in range(5)]
    est = estimate_theta_eap(responses)
    assert est.theta < -0.5


def test_eap_se_shrinks_with_more_information():
    # More responses about ability => tighter posterior => smaller SE.
    few = estimate_theta_eap(
        [ResponsePoint(a=1.5, b=0.0, correct=i % 2 == 0) for i in range(4)]
    )
    many = estimate_theta_eap(
        [ResponsePoint(a=1.5, b=0.0, correct=i % 2 == 0) for i in range(40)]
    )
    assert many.se < few.se
    assert many.se < 1.0  # must be more certain than the prior


def test_eap_recovers_known_ability():
    # Simulate an examinee whose TRUE ability is +1.0 answering a spread of items
    # deterministically (correct iff true_theta beats difficulty by the median).
    # With many informative items, EAP should land near the true θ.
    true_theta = 1.0
    difficulties = [(-2 + 0.1 * k) for k in range(41)]  # -2.0 .. +2.0
    responses = [
        ResponsePoint(a=1.5, b=b, correct=prob_correct(true_theta, 1.5, b) >= 0.5)
        for b in difficulties
    ]
    est = estimate_theta_eap(responses)
    assert est.theta == pytest.approx(true_theta, abs=0.4)


def test_eap_is_order_independent():
    # The posterior is a product over responses → invariant to ordering.
    rs = [
        ResponsePoint(a=1.0, b=-1.0, correct=True),
        ResponsePoint(a=2.0, b=0.5, correct=False),
        ResponsePoint(a=1.3, b=1.0, correct=True),
    ]
    a = estimate_theta_eap(rs)
    b = estimate_theta_eap(list(reversed(rs)))
    assert a.theta == pytest.approx(b.theta, abs=1e-9)
    assert a.se == pytest.approx(b.se, abs=1e-9)


def test_eap_monotonic_in_correctness():
    # Getting a hard item right should not lower your estimated ability.
    base = [ResponsePoint(a=1.0, b=0.0, correct=True)]
    got_hard_right = base + [ResponsePoint(a=1.5, b=2.0, correct=True)]
    got_hard_wrong = base + [ResponsePoint(a=1.5, b=2.0, correct=False)]
    assert (
        estimate_theta_eap(got_hard_right).theta
        > estimate_theta_eap(got_hard_wrong).theta
    )


def test_defaults_are_neutral():
    assert DEFAULT_A == 1.0
    assert DEFAULT_B == 0.0
    assert math.isclose(prob_correct(0.0), 0.5)

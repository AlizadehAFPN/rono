"""Unit tests for 2PL item calibration."""

import numpy as np

from app.services.irt.engine import calibrate_2pl, prob_correct


def _simulate(a: float, b: float, n: int, seed: int = 0):
    """Generate (theta, correct) data from a known 2PL item."""
    rng = np.random.default_rng(seed)
    thetas = rng.normal(0.0, 1.5, n)
    points = []
    for th in thetas:
        p = prob_correct(float(th), a, b)
        points.append((float(th), bool(rng.random() < p)))
    return points


def test_too_few_responses_returns_none():
    assert calibrate_2pl(_simulate(1.0, 0.0, 10), min_responses=30) is None


def test_all_correct_returns_none():
    pts = [(float(t), True) for t in np.linspace(-2, 2, 40)]
    assert calibrate_2pl(pts) is None


def test_recovers_difficulty_sign():
    # A hard item (b高) should calibrate to a positive b; an easy one negative.
    hard = calibrate_2pl(_simulate(1.2, 1.5, 600, seed=1))
    easy = calibrate_2pl(_simulate(1.2, -1.5, 600, seed=2))
    assert hard is not None and easy is not None
    assert hard.b > easy.b
    assert hard.b > 0 and easy.b < 0


def test_estimates_within_bounds():
    res = calibrate_2pl(_simulate(1.0, 0.5, 500, seed=3))
    assert res is not None
    assert 0.2 <= res.a <= 3.0
    assert -4.0 <= res.b <= 4.0
    # Should land in the right ballpark of the true parameters.
    assert abs(res.b - 0.5) < 0.6

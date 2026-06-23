"""
Item Response Theory (IRT) — 2-Parameter Logistic (2PL) engine.

This module is the mathematical core of adaptive question selection and ability
estimation. It is intentionally **pure**: no database, no I/O, no framework
imports. Every function is deterministic and unit-testable in isolation, which is
what lets us assert "the IRT math is correct" with confidence.

The 2PL model
-------------
The probability that a student with latent ability ``theta`` (θ) answers an item
correctly is::

    P(correct | θ) = 1 / (1 + exp(-a · (θ - b)))

where
    a = discrimination (irt_a) — how sharply the item separates ability levels
    b = difficulty     (irt_b) — the θ at which P = 0.5

Ability estimation uses **EAP** (Expected A Posteriori): the mean of the
posterior distribution of θ given the student's responses and a N(0, 1) prior.
EAP is stable for short tests (unlike MLE, which diverges on all-correct or
all-incorrect response patterns) and yields a posterior standard deviation that
we persist as ``theta_se``.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

# ---------------------------------------------------------------------------
# Defaults for uncalibrated items
# ---------------------------------------------------------------------------
# New items that have never been calibrated get neutral parameters so they can
# still participate in selection: average difficulty, unit discrimination.
DEFAULT_A: float = 1.0
DEFAULT_B: float = 0.0

# A discrimination floor avoids divide-by-zero / degenerate information when an
# item's calibrated ``a`` collapses toward 0.
MIN_A: float = 1e-3

# Prior on ability for EAP. Standard normal is the conventional choice and keeps
# θ on the familiar logit scale where 0 is "average".
PRIOR_MEAN: float = 0.0
PRIOR_SD: float = 1.0

# Quadrature grid for EAP integration. 81 nodes across ±4 SD captures essentially
# all posterior mass while staying cheap. Fixed grid => fully deterministic.
_GRID_MIN: float = -4.0
_GRID_MAX: float = 4.0
_GRID_NODES: int = 81


@dataclass(frozen=True)
class ItemParams:
    """IRT parameters for a single item, with its identity for selection."""

    item_id: object
    a: float
    b: float


@dataclass(frozen=True)
class ResponsePoint:
    """A single graded response feeding ability estimation."""

    a: float
    b: float
    correct: bool


@dataclass(frozen=True)
class ThetaEstimate:
    """Result of an EAP ability estimation."""

    theta: float
    se: float
    n_responses: int


# ---------------------------------------------------------------------------
# Core 2PL functions
# ---------------------------------------------------------------------------


def prob_correct(theta: float, a: float = DEFAULT_A, b: float = DEFAULT_B) -> float:
    """
    2PL probability of a correct response.

    Numerically stable across extreme θ: the logistic is computed via a branch
    that never overflows ``exp``.
    """
    a = max(a, MIN_A)
    z = a * (theta - b)
    # Stable logistic: avoid exp() overflow for large |z|.
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    ez = math.exp(z)
    return ez / (1.0 + ez)


def fisher_information(theta: float, a: float = DEFAULT_A, b: float = DEFAULT_B) -> float:
    """
    Fisher information of a 2PL item at ability ``theta``::

        I(θ) = a² · P(θ) · (1 - P(θ))

    Information is maximised when P = 0.5 (i.e. θ == b), which is exactly the
    item that most reduces uncertainty about this student's ability — the basis
    for adaptive selection.
    """
    a = max(a, MIN_A)
    p = prob_correct(theta, a, b)
    return (a * a) * p * (1.0 - p)


# ---------------------------------------------------------------------------
# Adaptive item selection
# ---------------------------------------------------------------------------


def select_next_item(
    theta: float,
    candidates: list[ItemParams],
) -> ItemParams | None:
    """
    Choose the candidate item that maximises Fisher information at ``theta``.

    This is maximum-information adaptive selection: serve the question whose
    outcome is least predictable for this student, extracting the most signal
    about their ability per question.

    Ties are broken deterministically by ``item_id`` string ordering so the same
    pool + θ always yields the same pick (important for reproducible tests).
    Returns ``None`` if there are no candidates.
    """
    if not candidates:
        return None

    def sort_key(item: ItemParams) -> tuple[float, str]:
        # Negative information => higher information sorts first; id breaks ties.
        return (-fisher_information(theta, item.a, item.b), str(item.item_id))

    return min(candidates, key=sort_key)


# ---------------------------------------------------------------------------
# Ability estimation — EAP
# ---------------------------------------------------------------------------


def _grid() -> tuple[np.ndarray, np.ndarray]:
    """θ nodes and their normal-prior weights for EAP quadrature (cached shape)."""
    nodes = np.linspace(_GRID_MIN, _GRID_MAX, _GRID_NODES)
    # Normal prior density at each node (unnormalised is fine — we normalise the
    # posterior below). Trapezoidal spacing is uniform so it cancels.
    prior = np.exp(-0.5 * ((nodes - PRIOR_MEAN) / PRIOR_SD) ** 2)
    return nodes, prior


def estimate_theta_eap(
    responses: list[ResponsePoint],
    prior_mean: float = PRIOR_MEAN,
    prior_sd: float = PRIOR_SD,
) -> ThetaEstimate:
    """
    Expected A Posteriori (EAP) estimate of ability θ from graded responses.

    posterior(θ) ∝ prior(θ) · Π_i P_i(θ)^{x_i} · (1 - P_i(θ))^{1 - x_i}

    θ̂   = E[θ | responses]      (posterior mean)
    se   = sqrt(Var[θ | responses])  (posterior standard deviation)

    With **no responses** this returns the prior mean and prior SD, which is the
    correct cold-start behaviour. EAP never diverges, so all-correct or
    all-incorrect patterns simply push θ toward the grid edge with a wider SE.
    """
    nodes = np.linspace(_GRID_MIN, _GRID_MAX, _GRID_NODES)
    # Log-prior for the (possibly overridden) normal prior.
    log_post = -0.5 * ((nodes - prior_mean) / prior_sd) ** 2

    for r in responses:
        a = max(r.a, MIN_A)
        z = a * (nodes - r.b)
        # log P and log(1-P) via stable softplus: log(1+e^{-z}) and log(1+e^{z}).
        log_p = -np.logaddexp(0.0, -z)
        log_q = -np.logaddexp(0.0, z)
        log_post += log_p if r.correct else log_q

    # Normalise in a numerically stable way.
    log_post -= log_post.max()
    post = np.exp(log_post)
    total = post.sum()
    post /= total

    mean = float((nodes * post).sum())
    var = float(((nodes - mean) ** 2 * post).sum())
    se = math.sqrt(max(var, 0.0))

    return ThetaEstimate(theta=mean, se=se, n_responses=len(responses))


# ---------------------------------------------------------------------------
# Item calibration — 2PL parameters from accumulated responses
# ---------------------------------------------------------------------------
# Minimum graded responses before an item is worth calibrating. 30 is the
# conventional floor for stable-ish 2PL estimates.
MIN_CALIBRATION_N: int = 30

# Bounds keep estimates sane under sparse data / quasi-separation.
_A_MIN, _A_MAX = 0.2, 3.0
_B_MIN, _B_MAX = -4.0, 4.0


@dataclass(frozen=True)
class CalibrationResult:
    a: float
    b: float
    n_responses: int


def calibrate_2pl(
    points: list[tuple[float, bool]],
    min_responses: int = MIN_CALIBRATION_N,
) -> CalibrationResult | None:
    """
    Estimate 2PL item parameters (a, b) from (ability, correct) observations.

    Each point is ``(theta_at_response, is_correct)`` — we treat the student
    abilities recorded at answer time as fixed anchors and fit a logistic
    regression ``P(correct) = logistic(slope·θ + intercept)`` by ridge-penalised
    IRLS (Newton). Then ``a = slope`` and ``b = -intercept / slope``.

    This is a pragmatic, anchored calibration (not full marginal-MLE), but it is
    deterministic, dependency-light, and converts real responses into the item
    difficulty/discrimination the selector needs.

    Returns ``None`` when there is too little data, no outcome variation, or the
    item shows no positive discrimination (degenerate fit).
    """
    if len(points) < min_responses:
        return None

    thetas = np.array([p[0] for p in points], dtype=float)
    y = np.array([1.0 if p[1] else 0.0 for p in points], dtype=float)
    if y.sum() == 0 or y.sum() == len(y):
        return None  # all-correct or all-incorrect → undefined difficulty

    X = np.column_stack([np.ones_like(thetas), thetas])
    beta = np.zeros(2)
    ridge = 1e-3
    for _ in range(50):
        z = np.clip(X @ beta, -30.0, 30.0)
        p = 1.0 / (1.0 + np.exp(-z))
        w = p * (1.0 - p) + 1e-9
        grad = X.T @ (p - y) + ridge * beta
        hess = X.T @ (X * w[:, None]) + ridge * np.eye(2)
        try:
            step = np.linalg.solve(hess, grad)
        except np.linalg.LinAlgError:
            return None
        beta = beta - step
        if np.max(np.abs(step)) < 1e-6:
            break

    intercept, slope = float(beta[0]), float(beta[1])
    if slope <= 1e-3:
        return None  # non-discriminating (or inversely scored) item

    a = float(min(max(slope, _A_MIN), _A_MAX))
    b = float(min(max(-intercept / slope, _B_MIN), _B_MAX))
    return CalibrationResult(a=a, b=b, n_responses=len(points))

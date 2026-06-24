"""
Role hierarchy for the Rono platform.

Roles are stored as plain strings in the Membership table (String(30)).
All authorization checks go through role_gte() — never compare role strings inline.
"""

ROLE_HIERARCHY: dict[str, int] = {
    "student": 0,
    "content_author": 1,
    "instructor": 2,
    "coordinator": 3,
    "institution_admin": 4,
    "system_admin": 5,
}


class Role:
    STUDENT = "student"
    CONTENT_AUTHOR = "content_author"
    INSTRUCTOR = "instructor"
    COORDINATOR = "coordinator"
    INSTITUTION_ADMIN = "institution_admin"
    SYSTEM_ADMIN = "system_admin"


def role_gte(user_role: str, minimum_role: str) -> bool:
    """Return True if user_role is at least as privileged as minimum_role."""
    user_rank = ROLE_HIERARCHY.get(user_role, -1)
    min_rank = ROLE_HIERARCHY.get(minimum_role, 0)
    return user_rank >= min_rank

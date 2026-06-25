"""Canonical taxonomy for Iran's employment exams (آزمون استخدامی).

Single source of truth for exam codes, parts, and option-key display. Adding a
new exam or part is a one-line edit here — every validator, importer and seed
reads from these maps, so the taxonomy stays extensible (topics/subjects are
plain rows in the `topics` table and can be added or removed at any time).

See RONO_EXAM_TAXONOMY.md (repo root) for the full decision record.
"""

# item.exam_type -> human (Persian) label
EXAM_TYPES: dict[str, str] = {
    "executive": "آزمون استخدامی متمرکز دستگاه‌های اجرایی",
    "education": "آزمون استخدامی آموزش و پرورش",
    "bank": "آزمون‌های استخدامی بانک‌ها",
    "social_security": "آزمون استخدامی سازمان تأمین اجتماعی",
    "phd": "آزمون دکتری (نیمه‌متمرکز)",
}

# item.exam_part -> human (Persian) label
EXAM_PARTS: dict[str, str] = {
    "general": "عمومی",
    "specialized": "تخصصی",
}

# Valid values for Curriculum.target_exam mirror the exam-type codes.
TARGET_EXAMS = EXAM_TYPES

# Internal (DB) option key -> Persian display letter. UI maps with this; the
# database always stores Latin keys so answer logic stays stable.
OPTION_KEY_LABELS: dict[str, str] = {
    "A": "الف",
    "B": "ب",
    "C": "ج",
    "D": "د",
    "E": "ه",  # reserved; employment exams use 4 options (A–D)
}

# Default content language for this deployment.
DEFAULT_CONTENT_LANGUAGE = "fa"


def is_valid_exam_type(value: str | None) -> bool:
    return value is None or value in EXAM_TYPES


def is_valid_exam_part(value: str | None) -> bool:
    return value is None or value in EXAM_PARTS

"""
Import a question set (JSON) into the live database.

Designed for official past papers of Iran's employment exams (آزمون استخدامی).
Each question becomes an Item + ItemVersion + Options, tagged with exam_type,
exam_part, provenance, the explanation (پاسخ تشریحی), and linked to its subject
topic by slug (global taxonomy — see RONO_EXAM_TAXONOMY.md).

Idempotent: a question is keyed by (source_reference, q_no) via an ItemTag, so
re-running skips already-imported questions.

JSON shape (4 options A–D; `subject` is the topic slug directly):
{
  "exam_type": "education",
  "exam_part": "general",
  "source": "sanjesh",
  "source_reference": "آزمون استخدامی آموزش و پرورش ۱۴۰۱ / دفترچه عمومی",
  "exam_year": 1401,
  "exam_session": null,
  "language": "fa",
  "passages": [
    {"key": "p1", "content": "متن درک مطلب ...", "group_no": 1, "image": "p1.png"}
  ],
  "questions": [
    {"no": 1, "subject": "gen-persian-qarabat", "stem": "...",
     "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
     "answer": "C", "explanation": "...", "void": false,
     "status": "draft", "passage": "p1", "passage_order": 1}
  ]
}

Shared passages (متن مشترک): list each reading passage / scenario once in
`passages` (a local `key`, the `content`, an optional `image` filename, and a
`group_no` — the passage's number in the source booklet, REQUIRED for idempotent
re-runs). A question joins a passage via `passage` (the key) + `passage_order`
(1-based position within the passage's run). Many questions may share one key.

Per-question `status`: optional override (e.g. "draft" so a figure-dependent
question is not served live until its image is added). Defaults to "active"
(or "retired" when `void`).

Usage (inside the backend container):
    PYTHONPATH=src uv run python scripts/import_questions.py scripts/data/<file>.json
"""

import asyncio
import json
import sys
import uuid

import structlog

sys.path.insert(0, "src")

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.institution import Institution
from app.models.item import Item
from app.models.item_tag import ItemTag
from app.models.item_topic_link import ItemTopicLink
from app.models.item_version import ItemVersion
from app.models.option import Option
from app.models.stimulus import Stimulus
from app.models.topic import Topic
from app.models.user import User

log = structlog.get_logger()


async def _import(path: str) -> None:
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)

    meta = {k: data.get(k) for k in (
        "exam_type", "exam_part", "source", "source_reference",
        "exam_year", "exam_session", "language",
    )}
    src_ref = meta["source_reference"]
    questions = data["questions"]
    passages_by_key = {p["key"]: p for p in data.get("passages", [])}

    async with AsyncSessionLocal() as db:
        institution = (await db.execute(select(Institution).limit(1))).scalar_one()
        author = (
            await db.execute(select(User).where(User.email.ilike("admin@%")).limit(1))
        ).scalar_one_or_none()
        author_id = author.id if author else None

        # Resolve a passage key to a Stimulus row, creating it on first use and
        # reusing it across re-runs via (institution, source_reference, group_no).
        stimulus_cache: dict[str, Stimulus] = {}

        async def _resolve_stimulus(key: str) -> Stimulus | None:
            if key in stimulus_cache:
                return stimulus_cache[key]
            p = passages_by_key.get(key)
            if p is None:
                log.warning("import.passage_missing", passage_key=key)
                return None
            group_no = p.get("group_no")
            existing = None
            if group_no is not None:
                existing = (
                    await db.execute(
                        select(Stimulus).where(
                            Stimulus.institution_id == institution.id,
                            Stimulus.source_reference == src_ref,
                            Stimulus.group_no == group_no,
                        )
                    )
                ).scalar_one_or_none()
            if existing is None:
                media = [{"url": p["image"]}] if p.get("image") else None
                existing = Stimulus(
                    institution_id=institution.id,
                    content=p["content"],
                    media_attachments=media,
                    language=meta.get("language") or "fa",
                    source_reference=src_ref,
                    group_no=group_no,
                )
                db.add(existing)
                await db.flush()
            stimulus_cache[key] = existing
            return existing

        # All global topics, keyed by slug — the JSON `subject` field IS the slug.
        topics = (
            await db.execute(select(Topic).where(Topic.institution_id.is_(None)))
        ).scalars().all()
        topic_by_slug = {t.slug: t for t in topics}

        created = skipped = 0
        for q in questions:
            qno = q["no"]
            # idempotency: skip if this (src_ref, qno) already imported
            exists = (
                await db.execute(
                    select(ItemTag).where(
                        ItemTag.tag_key == "q_no",
                        ItemTag.tag_value == f"{src_ref}#{qno}",
                    )
                )
            ).scalar_one_or_none()
            if exists is not None:
                skipped += 1
                continue

            # "void" (حذف‌شده) is the new key; "iptal" kept as a legacy alias.
            is_void = bool(q.get("void") or q.get("iptal"))
            # Optional explicit status (e.g. "draft" for figure-pending questions
            # so they aren't served live). Void always wins → "retired".
            status = "retired" if is_void else (q.get("status") or "active")
            answer = (q.get("answer") or "").strip().upper()

            item = Item(
                institution_id=institution.id,
                item_type="single_best_answer",
                exam_type=meta["exam_type"],
                exam_part=meta["exam_part"],
                language=meta.get("language") or "fa",
                source=meta["source"],
                source_reference=src_ref,
                exam_year=meta["exam_year"],
                exam_session=meta["exam_session"],
                status=status,
                created_by_id=author_id,
            )
            db.add(item)
            await db.flush()

            version = ItemVersion(
                item_id=item.id,
                version_number=1,
                content=q["stem"],
                explanation=q.get("explanation"),
                authored_by_id=author_id,
                is_published=(status == "active"),
            )
            db.add(version)
            await db.flush()

            for i, key in enumerate(["A", "B", "C", "D", "E"]):
                if key not in q["options"]:
                    continue
                db.add(Option(
                    item_version_id=version.id,
                    key=key,
                    content=q["options"][key],
                    is_correct=(key == answer and not is_void),
                    display_order=i,
                ))

            item.current_version_id = version.id

            # Link to a shared passage (متن مشترک), if the question references one.
            passage_key = q.get("passage")
            if passage_key:
                stimulus = await _resolve_stimulus(passage_key)
                if stimulus is not None:
                    item.stimulus_id = stimulus.id
                    item.stimulus_order = q.get("passage_order")

            subject_slug = q.get("subject")
            topic = topic_by_slug.get(subject_slug) if subject_slug else None
            if subject_slug and topic is None:
                log.warning("import.topic_missing", subject=subject_slug, q_no=qno)
            if topic is not None:
                db.add(ItemTopicLink(
                    item_id=item.id, topic_id=topic.id, is_primary=True, created_by_id=author_id
                ))

            # provenance tags (also the idempotency key)
            db.add(ItemTag(item_id=item.id, tag_key="q_no", tag_value=f"{src_ref}#{qno}"))
            await db.flush()
            created += 1

        await db.commit()
        log.info("import.done", created=created, skipped=skipped, total=len(questions))
        print(f"created={created} skipped={skipped} total={len(questions)}")


if __name__ == "__main__":
    asyncio.run(_import(sys.argv[1]))

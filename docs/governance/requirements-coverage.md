# Requirements coverage

Definitions for portal coverage metrics on `/requirements` and `/health`.

These metrics are **quality signals**, not hard gates for every requirement type. Missing ADR or contract links are not automatically treated as errors.

---

## Architecture coverage

A requirement has architecture coverage when it references at least one LikeC4 **architecture** or **flow** view ID in frontmatter (`architecture:` / `flows:`), where that linkage is applicable.

Business requirements may reasonably omit direct view links when they are covered via dependent functional requirements.

Portal filter: **Missing architecture**.

---

## Test coverage

A requirement has test coverage when it lists at least one test specification ID under `tests:`, referencing files in `requirements/tests/`.

Do **not** require every Business Requirement to map directly to a test ID. Prefer mapping critical financial, payment, settlement, security, and integration behaviours.

Portal filter: **Missing test**.

---

## Decision coverage

A requirement has decision coverage when material architectural choices that affect it are linked via:

- `adrs:` — Accepted ADRs, and/or
- `openDecisions:` — stable `OD-###` open decisions

Not every requirement needs both. Link open decisions when unresolved choices block or shape the requirement.

Portal filter: **Blocked** (has one or more `openDecisions`).

---

## Acceptance criteria

Accepted requirements should include an `## Acceptance Criteria` section. The portal counts accepted requirements missing that heading as a coverage gap; it does not fail validation solely for that gap.

---

## Implemented but not verified

Requirements with status `implemented` that are not yet `verified`. Useful for tracking unfinished proof against tests/acceptance.

Portal filter: **Unverified**.

Do not use `implemented` for Phase A foundation. Use `implementationStatus: foundation_implemented`.

---

## Foundation implemented

Optional `implementationStatus: foundation_implemented` means platform infrastructure evidence exists; product behaviour is not claimed. Portal coverage lists a count of these requirements.

---

## MVP vs Future

`mvp: true|false` is an intentional product scoping flag. Coverage filters can be combined with the MVP filter.

---

## What is not an error

- Missing contract path when the requirement is not API-facing
- Missing ADR when no material architecture decision applies
- Empty `tests:` on high-level business requirements (when covered downstream)

# Requirements Governance

**Status:** Current  
**Owner:** Architecture (TBD) / Product (TBD)  
**Last Reviewed:** 2026-08-13  
**Related:** [architecture change process](architecture-change-process.md), [ADR template](../decisions/ADR-TEMPLATE.md), [requirements/](../../requirements/README.md)

Git remains the workflow. No database, CMS, online editor, or external ALM integration in Portal Phase 2.

---

## Proposing a requirement

1. Copy [REQUIREMENT-TEMPLATE.md](../../requirements/templates/REQUIREMENT-TEMPLATE.md).
2. Assign the next unused stable ID in the correct prefix (do not reuse rejected IDs casually; gaps are fine).
3. Set `status: draft` or `proposed`.
4. Add only resolvable traceability links (LikeC4 view IDs, ADR files, doc/contract paths).
5. Open a PR. Run `npm run requirements:validate`.

---

## Approval (conceptual)

| Role | Responsibility |
| --- | --- |
| Product (TBD) | Business intent, MVP vs future, priority |
| Architecture (TBD) | Traceability to views/ADRs/contracts; conflict with Accepted ADRs |
| Security (TBD) | NFR-SEC / privacy where applicable |

Exact people/teams remain TBD. Merge to `main` with `status: accepted` implies architectural commitment for the stated scope.

---

## Status progression

```text
draft → proposed → accepted → implemented → verified
                 ↘ deferred
                 ↘ rejected
```

- **accepted** may precede product implementation.
- **implemented** is claimed when platform code lands (not inferred by this repo).
- **verified** requires demonstrated acceptance/tests (e.g. FIN-INV-*).
- Do not skip to `verified` without evidence in the PR description or linked platform CI.

---

## Changing requirements after implementation

1. Prefer a new requirement or explicit amendment PR over silent edits that change meaning.
2. If behaviour change conflicts with an Accepted ADR, follow the [architecture change process](architecture-change-process.md) and update/supersede ADRs as needed.
3. Update traceability (`architecture`, `flows`, `adrs`, `tests`) in the same PR.
4. Keep IDs stable; change `title`/body, not the ID.

---

## Deletion / deprecation

- Prefer `status: rejected` or `status: deferred` with `mvp: false` over deleting history.
- Deletion is allowed only for never-accepted drafts that have no inbound `dependsOn`/`related` references (validator will fail on dangling refs).

---

## Relationship to ADRs

- ADRs record **binding architecture decisions**.
- Requirements record **required behaviour/quality** and may reference ADRs.
- An Accepted ADR without a requirement is possible; a requirement that contradicts an Accepted ADR must not be `accepted`.

---

## Relationship to architecture change process

Behavioural changes that alter LikeC4 views, dynamic flows, or contracts must update:

1. Relevant requirements (or add new ones)
2. Architecture/views as needed
3. ADRs when decisions change
4. Traceability metadata

See also portal matrix: `/requirements/traceability` (generated from requirement frontmatter). ADR-focused matrix remains [architecture-traceability.md](../implementation/architecture-traceability.md).

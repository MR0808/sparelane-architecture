---
id: FUN-ADM-007
title: Durable dead-letter inspection
type: functional
area: admin
status: accepted
implementationStatus: designed
priority: must
mvp: true
architecture:
  - dlqReplay
  - adminReadOnlyControlPlane
adrs:
  - ADR-032
  - ADR-034
contracts:
  - docs/operations/dead-letter-handling.md
  - docs/security/admin-access.md
modules:
  - Operations
  - Admin Control Plane
tests:
  - ADM-DLQ-001
  - ADM-DLQ-002
designs:
  - SEQ-OPS-003
---
# FUN-ADM-007 — Durable dead-letter inspection

## Requirement

Platform admins with `admin.dlq.view` must inspect durable `DeadLetterItem` records (`dlq_…`) showing safe operational metadata and replay eligibility, without raw secrets or PII dumps.

## Rationale

ADR-034; replaces in-memory-only DLQ as operator evidence.

## Acceptance Criteria

- Dead-letter rows persist across process restart.
- List/detail under `/admin/dlq` via `/admin/v1/dead-letters`.
- Unique `(work_type, source_identity)` prevents duplicate active logical rows from redelivery.
- Financial and notification DLQ items are inspectable when persisted; replay action absent where prohibited.
- No webhook signing secrets, contact emails, provider tokens, bank refs, or raw PSP payloads in admin views.

## Notes

implementationStatus: designed — platform H2 not started.

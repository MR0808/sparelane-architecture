---
id: NFR-PRIV-006
title: Dead-letter and replay data minimisation
type: non-functional
area: privacy
status: accepted
implementationStatus: designed
priority: must
mvp: true
architecture:
  - dlqReplay
adrs:
  - ADR-034
contracts:
  - docs/data/privacy-design.md
  - docs/security/data-classification.md
modules:
  - Operations
  - Admin Control Plane
tests:
  - ADM-DLQ-002
---
# NFR-PRIV-006 — Dead-letter and replay data minimisation

## Requirement

Durable DLQ and operator replay records must not introduce new PII or secret exposure. Admin list/detail and audit must use pointers and safe metadata only.

## Rationale

ADR-034 privacy binding; aligns with H0/H1 admin minimisation.

## Acceptance Criteria

- No consumer email, auth subject, webhook signing secret, provider token, bank ref, PAN/CVV, or API credential in DLQ admin views or replay audit payloads.
- Replay references point at authoritative domain rows rather than duplicating sensitive bodies.

---
id: CON-NOT-001
title: Consumer notification G2 contract
type: contract
status: verified
implementationProgress: product_verified
relatedRequirements:
  - FUN-NOT-001
  - FUN-NOT-002
  - FUN-NOT-003
  - FUN-NOT-004
  - FUN-NOT-005
  - NFR-PRIV-002
  - NFR-OPS-005
mvp: true
---

# CON-NOT-001 — Consumer notification G2 contract

## Purpose

Platform G2 tests prove ADR-031 contact, catalogue, delivery, and privacy boundaries on **FakeEmailProvider** local evidence.

## Preconditions

- ADR-031 Accepted
- FakeEmailProvider available in local/test

## Scenarios — verified locally

| # | Scenario | Expected | Platform evidence |
| --- | --- | --- | --- |
| 1 | Identity email only (no contact row) | Payment event → SKIPPED; no send | `g2-consumer-notifications.test.ts` |
| 2 | Explicit contact add + verify | ACTIVE default; payment notification delivers | same |
| 3 | Cross-consumer isolation | Consumer B never receives A's notification | portal verify 404 |
| 4 | Duplicate source event replay | One logical `ConsumerNotification` row | duplicate projection |
| 5 | Template variables | No forbidden fields in provider payload | contract + redaction |
| 6 | Fake provider failure modes | Retry then FAILED; no financial mutation | retry exhaustion test |
| 7 | Crash after provider accept | Same idempotency key; no duplicate logical send | crash replay test |
| 8 | Consumer anonymisation | Future sends blocked | anonymisation test |
| 9 | Production composition without provider | Fail closed | sandbox compose test |
| 10 | Log/metric scan | No raw email in observability | redact test |
| 11 | Contact revoked before retry | No provider call; SKIPPED | revoked-during-retry test |

## Implementation status

**Verified locally** — `sparelane-platform` `npm run test:phase-g2`. Does **not** claim production email vendor behaviour (OD-035 open).

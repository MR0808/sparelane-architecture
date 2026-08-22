---
id: E2E-SET-002
title: Settlement failure
type: e2e
status: specified
implementationEvidence: |
  Local Fake reject/failed finality evidence (F1/F2/exit). No payout journal. Not real-provider product_verified.
relatedRequirements:
  - FUN-SET-004
  - FUN-SET-006
relatedFlows:
  - settlementFailure
mvp: true
---

# E2E-SET-002 — Settlement failure

## Purpose

Verify settlement lifecycle path `settlementFailure` ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md), [ADR-029](../../docs/decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)).

## Preconditions

- Collected funds posted to ledger where required.
- Fake settlement partner scripted for definitive failure (submit reject and/or reconcile `failed`).

## Scenario

1. Reach SUBMITTED (or ELIGIBLE reject path) with Fake provider.
2. Reconcile / provider reports canonical `failed` (or F1 `rejected`).
3. Assert Settlement → FAILED; no payout discharge journal; payable undischarged; payment remains COLLECTED.
4. Assert no SETTLED; F2 does not create replacement instruction / RETRY_PENDING.

## Expected result

Settlement state machine and reconciliation behaviour match ADRs (merchant ineligibility ≠ FAILED; FAILED is external-execution path; no payout journal on failure).

## Implementation status

`specified` — **local Fake settlement evidence** (F1 reject / F2 failed finality). Not real-provider `product_verified`.

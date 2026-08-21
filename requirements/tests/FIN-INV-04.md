---
id: FIN-INV-04
title: Failed collection not settlement-eligible
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-001
  - BUS-004
mvp: true
---

# FIN-INV-04 — Failed collection not settlement-eligible

## Purpose

Failed collection cannot become settlement eligible. Confirmed collection creates at most one Settlement obligation ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise under success, replay, and restart:

- FAILED / non-COLLECTED workflow → no Settlement
- COLLECTED without CONFIRMED posting → no Settlement
- CONFIRMED collection → exactly one Settlement; duplicate confirmation idempotent
- Concurrent confirmation → one Settlement (`payment_workflow_id` unique)
- Amount/currency match journal payable CREDIT; merchant isolation
- Blocked merchant/KYB → Settlement PENDING (not ELIGIBLE, not FAILED)
- F0 path creates no SettlementInstruction and mutates no ledger

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Architecture policy frozen (ADR-027). Platform F0 not yet implemented. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).

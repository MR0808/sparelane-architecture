---
id: FIN-INV-02
title: One collection one ledger posting
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-005
mvp: true
---

# FIN-INV-02 — One collection one ledger posting

## Purpose

One successful collection yields exactly one ledger posting.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.
- Collection journal template per [ADR-026](../../docs/decisions/ADR-026-collection-ledger-posting-minimal-coa.md).

## Scenario

Exercise under:

- primary collection success
- backup collection success
- scheduled-retry then collection
- Retry Now then collection
- duplicate `PaymentCollected` delivery
- concurrent `PaymentCollected` handlers
- crash after journal before `CONFIRMED`, then redelivery
- conflicting journal substance for same `business_reference` (must not CONFIRMED)

## Expected result

- Exactly one collection `JournalTransaction` with `business_reference = payment-collection:{paymentWorkflowPublicId}`
- ADR-026 legs only; balanced
- `ledger_posting_status = CONFIRMED` only when that journal exists
- Failed / UNKNOWN / ACTION_REQUIRED workflows: zero collection journals
- Invariant holds; test fails the release if violated

## Implementation status

`specified` — Architecture template frozen (ADR-026). Platform Phase E1 not yet implemented. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).

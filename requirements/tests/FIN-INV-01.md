---
id: FIN-INV-01
title: No duplicate collection
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-PAY-008
mvp: true
---

# FIN-INV-01 — No duplicate collection

## Purpose

Same payment cannot be collected twice.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — **local FakePSP orchestration evidence** in `sparelane-platform/tests/e2e/phase-d/financial-invariants.test.ts` (and concurrency / Retry Now races).

Does **not** set `implementationProgress: product_verified`. Real provider idempotency and ledger halves remain unverified. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md) Phase D section.

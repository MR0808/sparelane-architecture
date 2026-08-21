---
id: FIN-INV-08
title: Cross-merchant settlement isolation
type: financial-invariant
status: specified
relatedRequirements:
  - NFR-SEC-001
mvp: true
---

# FIN-INV-08 — Cross-merchant settlement isolation

## Purpose

Merchant A can never settle against Merchant B data.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise under success, replay, and restart:

- Settlement `merchant_id` must equal workflow/journal merchant
- Merchant A journal must not create Settlement for Merchant B
- Eligibility evaluation must not read/write cross-tenant settlement rows

Full payout-path isolation completes with instruction/reconciliation phases; F0 must already enforce create/eligibility isolation ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Architecture policy frozen for F0 create/eligibility isolation. Full product verification Phase F+. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).

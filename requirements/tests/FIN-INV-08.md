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

Full payout-path isolation completes with instruction phase ([ADR-028](../../docs/decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)):

- Settlement / destination / instruction / provider request must share merchant scope
- Cross-merchant destination public id must be rejected (financial-integrity failure)
- F0 must already enforce create/eligibility isolation ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md))

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — **Local Fake evidence: VERIFIED_LOCAL_FAKE** (Track 1A / Phase I platform suite). Architecture policy frozen for F0–F2 isolation. Still **not** `product_verified` / live-provider verified. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).

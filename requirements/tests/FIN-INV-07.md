---
id: FIN-INV-07
title: Compensating corrections only
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-007
  - FUN-SET-008
  - FUN-ADM-009
  - NFR-SEC-012
mvp: true
---

# FIN-INV-07 — Compensating corrections only

## Purpose

Ledger correction does not mutate historical entry (compensating only).

## Architecture policy

Binding: [ADR-036](../../docs/decisions/ADR-036-financial-compensating-correction-policy.md). Sequence: [SEQ-MONEY-007](../../docs/design/money/ledger-compensating-correction.md).

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.
- Privileged admin composition with Fake MFA (ADR-035) for local evidence.
- Compensating correction workflow implemented per ADR-036.

## Scenario

Executable contract (platform MUST implement):

1. Source journal cannot be updated.
2. Source journal cannot be deleted.
3. Correction creates a distinct append-only journal (`transaction_type = correction`).
4. Compensating journal references source via `corrects_journal_transaction_id`.
5. Compensating journal balances.
6. Debit/credit sides reverse source collection legs for amount `A`.
7. Duplicate execute of same `par_…` is idempotent (one journal).
8. Concurrent corrections cannot over-correct (remaining capacity).
9. Cross-merchant / foreign `jt_…` cannot correct.
10. Unauthorized principal cannot correct.
11. Audit evidence emitted for execute success.
12. PaymentWorkflow / Settlement statuses unchanged by correction.
13. Failed correction leaves original history unchanged.
14. Partial corrections: cumulative ≤ original; further beyond remaining rejected.
15. Restart/redelivery cannot create duplicate compensation for same `par_…`.
16. Correction blocked when Settlement is SUBMITTED/PROCESSING/SETTLED.
17. Settlement instruction create/execute blocked when remaining collection capacity is 0.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

**`VERIFIED_LOCAL_FAKE`** (Track 1F architecture promotion — 2026-08-25).

Platform evidence (Track 1C implementation + Track 1E validation):

- ADR-036 Option A workflow (`admin.ledger.correct`, append-only correction journals)
- Focused suite: `npm run test:mvp-track1c` — **18** FIN-INV-07 E2E scenarios PASS
- Migration `20260824160000_adr036_ledger_compensating_correction` in full **20-migration** chain
- `npm run db:migrate:test:from-zero` **PASS ×2**
- Post-from-zero: Track 1C, Phase I, Phase H, integration **PASS**
- Regression: ledger E0, H1/H2, F0/F1/F2, portal, architecture:check, typecheck/lint/format/validate, build, smoke:production **PASS**

Still **not** `product_verified` / live-provider verified.

See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md) and [mvp-acceptance-gap-plan](../../docs/implementation/mvp-acceptance-gap-plan.md).

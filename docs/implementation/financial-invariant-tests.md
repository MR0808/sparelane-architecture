# Financial Invariant Tests

**Release-critical.** Failures block production release.

1. Same payment cannot be collected twice.
2. One successful collection yields exactly one ledger posting.
3. Journal transaction always balances.
4. Failed collection cannot become settlement eligible.
5. Settlement cannot be submitted twice (same instruction identity).
6. Unknown payout outcome cannot trigger blind duplicate submission.
7. Ledger correction does not mutate historical entry (compensating only).
8. Merchant A can never settle against Merchant B data.
9. Replay of event is idempotent (no duplicate financial effect).
10. Worker restart cannot create duplicate financial effect.

Implement as automated integration/e2e tests with deterministic fixtures and fake provider adapters.

## Implementation evidence (Phase A)

**None of FIN-INV-01–10 are product-verified.** Payment, ledger, and settlement behaviour has not been implemented.

| ID | Phase A |
| --- | --- |
| FIN-INV-01–08 | Unverified. Requires product financial behaviour. |
| FIN-INV-09 Idempotent replay | Foundation prerequisite demonstrated on a non-financial synthetic fixture. Spec remains `specified`. |
| FIN-INV-10 Worker restart | Same: foundation prerequisite only; not a financial E2E. |

See [phase-a-status](phase-a-status.md).

## Implementation evidence (Phase B)

**None of FIN-INV-01–10 are product-verified.** Phase B moves no money. Payment, ledger, and settlement behaviour has not been implemented.

Phase B established safe **Consumer-owned payment-method reference** ownership and configuration as a prerequisite for future collection — that is not FIN-INV verification.

| ID | Phase A | Phase B |
| --- | --- | --- |
| FIN-INV-01–08 | Unverified | Unverified — no financial behaviour |
| FIN-INV-09 Idempotent replay | Foundation prerequisite on non-financial fixture | Unchanged — not financial E2E |
| FIN-INV-10 Worker restart | Foundation prerequisite on non-financial fixture | Unchanged — not financial E2E |

See [phase-b-status](phase-b-status.md).

## Implementation evidence (Phase C)

**None of FIN-INV-01–10 are product-verified.** Phase C accepts bills and creates workflows; it does **not** execute collection, ledger posting, or settlement.

Phase C established durable bill + **exactly one** PaymentWorkflow + idempotent Merchant API accept + transactional `BillAccepted` outbox as prerequisites for Phase D — that is **not** FIN-INV verification.

| ID | Phase A | Phase B | Phase C |
| --- | --- | --- | --- |
| FIN-INV-01–08 | Unverified | Unverified | Unverified — no collection/ledger/settlement |
| FIN-INV-09 Idempotent replay | Foundation prerequisite | Unchanged | Bill API idempotency proven locally — still not financial E2E |
| FIN-INV-10 Worker restart | Foundation prerequisite | Unchanged | Unchanged — not financial E2E |

See [phase-c-status](phase-c-status.md).

## Implementation evidence (Phase D)

**None of FIN-INV-01–10 are fully `product_verified` against a real PSP or ledger.** Phase D proves **collection orchestration** against FakePSP and leaves ledger posting at `PENDING`.

| ID | Spec | Phase D |
| --- | --- | --- |
| FIN-INV-01 | Same payment cannot be collected twice | **Local FakePSP evidence** (orchestration) — not real-PSP `product_verified` |
| FIN-INV-02 | One collection → one ledger posting | **Not yet testable in product** — template frozen by ADR-026; platform E1 pending |
| FIN-INV-03 | Journal always balances | **Partial local (E0 mechanics)** — collection journals pending E1; not `product_verified` |
| FIN-INV-04 | Failed collection not settlement-eligible | **Partial prerequisite** — FAILED creates no Settlement |
| FIN-INV-05 | Settlement not submitted twice | **Not yet testable** — Phase F+ |
| FIN-INV-06 | Unknown payout → no blind resubmit | **Local evidence (collection UNKNOWN block)** — payout later |
| FIN-INV-07 | Compensating corrections only | **Not yet testable** — Phase E |
| FIN-INV-08 | Tenant isolation of settlement | **Partial prerequisite** — payment tenant isolation; settlement later |
| FIN-INV-09 | Replay idempotent | **Local collection evidence** + prior foundation prerequisite |
| FIN-INV-10 | Worker restart no duplicate effect | **Local collection evidence** + prior foundation prerequisite |

See [phase-d-status](phase-d-status.md). Platform detail: `sparelane-platform/docs/development/phase-d-exit-gate.md`.

## Architecture gate (collection CoA)

[ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md) freezes the MVP collection journal template (accounts, sides, codes, amount source, `business_reference`, PENDING→CONFIRMED). Platform Phase E1 may implement against that ADR. This does **not** mark FIN-INV-02/03 product_verified.

## Architecture gate (settlement obligation)

[ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md) freezes MVP settlement obligation cardinality (1:1 workflow), amount source (gross payable CREDIT), PENDING→ELIGIBLE, merchant/KYB gates. Platform F0 may implement against that ADR. This does **not** mark FIN-INV-04/05/08 product_verified; F0 proves domain obligation uniqueness and eligibility holds — not bank-transfer exactly-once.

## Architecture gate (settlement execution)

[ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md) freezes MVP execution: no batching; payout destination token; 1:1 instruction; provider taxonomy; Fake F1 ends at SUBMITTED. Platform F1 may implement against that ADR. Evidence expectations:

| ID | F1 expectation |
| --- | --- |
| FIN-INV-04 | Regression — instruction must not duplicate Settlement obligation |
| FIN-INV-05 | Local Fake: one instruction → one logical transfer under duplicate/concurrent/crash replay — **not** real-bank exactly-once |
| FIN-INV-06 | Unknown → OUTCOME_UNKNOWN hold; no blind resubmit |
| FIN-INV-08 | Destination + instruction + provider request merchant isolation |

This does **not** mark those invariants `product_verified`.

## Architecture gate (settlement finality)

[ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md) freezes MVP finality taxonomy, evidence hierarchy, not_found/unknown rules, trigger model (no poll cadence), and payout journal CoA. Platform F2 may implement against that ADR. Evidence expectations:

| ID | F2 expectation |
| --- | --- |
| FIN-INV-03 | Payout journal balances |
| FIN-INV-05 | Local Fake: one instruction → one transfer → one payout journal → one SETTLED under duplicate/concurrent/crash reconcile |
| FIN-INV-06 | Unknown / not_found → no blind resubmit |
| FIN-INV-02 | Collection journal unchanged; separate `settlement-payout` journal |
| FIN-INV-08 | Merchant isolation on reconcile/SETTLED |
| FIN-INV-09 / FIN-INV-10 | Reconcile replay / worker restart → no duplicate journal or SETTLED |

This does **not** mark those invariants `product_verified`.

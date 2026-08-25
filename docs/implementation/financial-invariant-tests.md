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

## Implementation evidence (Phase F)

**None of FIN-INV-01–10 are fully `product_verified` against a real PSP, real settlement partner, or bank.** Phase F proves **settlement lifecycle** against FakeSettlementProvider (gross MVP).

| ID | Spec | Phase F (local Fake) |
| --- | --- | --- |
| FIN-INV-01 | Same payment cannot be collected twice | Regression — Phase D local FakePSP evidence unchanged |
| FIN-INV-02 | One collection → one ledger posting | **Locally evidenced** — one collection journal + one payout journal per settled obligation |
| FIN-INV-03 | Journal always balances | **Locally evidenced** — collection + payout journals via E0 builders |
| FIN-INV-04 | Failed collection not settlement-eligible | **Locally evidenced** — FAILED payment → no Settlement; FAILED settlement → no payout journal |
| FIN-INV-05 | Settlement not submitted twice | **Locally evidenced (Fake)** — 1 instruction → 1 transfer → 1 payout journal → 1 SETTLED under dup/concurrent/crash; **not** real-bank exactly-once |
| FIN-INV-06 | Unknown payout → no blind resubmit | **Locally evidenced (Fake)** — unknown/not_found hold; no automatic poller |
| FIN-INV-07 | Compensating corrections only | **Not testable yet** |
| FIN-INV-08 | Tenant isolation of settlement | **Locally evidenced (partial)** — cross-merchant destination/instruction isolation (Fake) |
| FIN-INV-09 | Replay idempotent | **Locally evidenced (partial)** — Fake duplicate reconcile/execute |
| FIN-INV-10 | Worker restart no duplicate effect | **Locally evidenced (partial)** — Fake crash-after-journal / crash-after-accept |

See [phase-f-status](phase-f-status.md). Platform: `sparelane-platform/docs/development/phase-f-test-evidence.md`.

## Implementation evidence (Phase I — local Fake consolidation)

**None of FIN-INV-01–10 become `product_verified` from Phase I Fake evidence alone.**

| ID | Phase I local classification | Platform evidence |
| --- | --- | --- |
| FIN-INV-01 | VERIFIED_LOCAL_FAKE | I1 happy path + Phase D FakePSP idempotency |
| FIN-INV-02 | VERIFIED_LOCAL_FAKE | I1 single collection journal |
| FIN-INV-03 | VERIFIED_LOCAL_FAKE | I1 balanced collection + payout journals |
| FIN-INV-04 | VERIFIED_LOCAL_FAKE | I1 one Settlement; Phase F FAILED paths |
| FIN-INV-05 | VERIFIED_LOCAL_FAKE | I1 one instruction/transfer/journal/SETTLED |
| FIN-INV-06 | VERIFIED_LOCAL_FAKE | Phase F2 unknown/not_found hold |
| FIN-INV-07 | **VERIFIED_LOCAL_FAKE** | Track 1C + Track 1E: 18 E2E scenarios; from-zero ×2 (20 migrations); post-zero Track 1C / Phase I / Phase H / integration — **not** `product_verified` |
| FIN-INV-08 | VERIFIED_LOCAL_FAKE | Track 1A + I1/I3 tenant isolation (Fake) — **not** `product_verified` |
| FIN-INV-09 | VERIFIED_LOCAL_FAKE | Track 1A + I1/I2 replay drills (Fake) — **not** `product_verified` |
| FIN-INV-10 | VERIFIED_LOCAL_FAKE | Track 1A + I2 restart drills (Fake) — **not** `product_verified` |

See [phase-i-status](phase-i-status.md), [mvp-acceptance-gap-plan](mvp-acceptance-gap-plan.md). Platform: `phase-i1-financial-invariant-evidence.md`, Track 1A/1C/1E evidence, `npm run test:phase-i1` / `test:mvp-track1a` / `test:mvp-track1c` / `db:migrate:test:from-zero`.

## Architecture gate (compensating correction)

[ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md) freezes the MVP compensating correction model (Option A). Platform Track 1C implements the workflow; Track 1E proved from-zero + regression. Architecture Track 1F promotes FIN-INV-07 to **`VERIFIED_LOCAL_FAKE`**. Still **not** `product_verified`.

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

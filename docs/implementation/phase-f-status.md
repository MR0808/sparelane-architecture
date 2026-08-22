# Phase F — Settlement

**Status:** Current  
**Owner:** Engineering / Architecture  
**Last Reviewed:** 2026-08-22  
**Related ADRs:** ADR-027, ADR-028, ADR-029 (Accepted); ADR-026 (collection payable source); OD-009, OD-011 remain open  
**Related Views:** Settlement / money designs (STATE-MONEY-001+)

## Status

**PASS WITH DOCUMENTED NON-BLOCKING RISKS**

Recorded from `sparelane-platform` Phase F exit evidence (F0–F2 + exit gate). This is **local Fake settlement** verification — **not** real-provider / real-bank / fee-net / production money verification, and **not** overall MVP acceptance.

## Purpose

Phase F implements settlement lifecycle: obligation from confirmed collection, eligibility, payout destination + instruction, Fake settlement provider execution, reconciliation taxonomy, payout journal, and `SETTLED` confirmation.

Phase F does **NOT** implement:

- real settlement partner / banking adapter (OD-009)
- commercial fee/net payout legs
- `SettlementBatch` production aggregation (OD-011)
- automatic reconciliation polling cadence
- business retry / superseding instructions after `FAILED`
- bank-cash / statement reconciliation
- wallet settlement
- public mark-settled / execute-settlement HTTP APIs

## F0–F2 summary (engineering decomposition)

These are **platform engineering sub-phases** decomposing canonical Phase F. They are **not** additional canonical architecture phases unless listed in [build-phases](build-phases.md).

| Slice | Purpose | Platform evidence | Status |
| --- | --- | --- | --- |
| F0 | Settlement obligation + eligibility | `docs/development/phase-f0-traceability.md` | PASS |
| F1 | SettlementInstruction + Fake provider → SUBMITTED | `docs/development/phase-f1-traceability.md` | PASS |
| F2 | Reconcile → payout journal → SETTLED | `docs/development/phase-f2-traceability.md` | PASS |
| Exit | Evidence gate | `docs/development/phase-f-final-status.md` | PASS WITH DOCUMENTED NON-BLOCKING RISKS |

Canonical Phase F remains [build-phases](build-phases.md) — **Settlement**.

## Capabilities implemented (local Fake)

| Capability | Notes |
| --- | --- |
| 1 confirmed collection → 1 Settlement | Unique `paymentWorkflowId` |
| Amount = ADR-026 payable credit | Gross; not aggregate balance |
| PENDING → ELIGIBLE | Merchant LIVE + Fake KYB approval |
| 1 Settlement → 1 Instruction | No SettlementBatch in MVP path |
| Fake submit outcomes | accepted → SUBMITTED; unknown hold; rejected → FAILED |
| Reconciliation taxonomy | pending / settled / failed / not_found / unknown |
| Payout journal | Dr merchant payable / Cr settlement clearing |
| SETTLED | Only after durable payout journal + `SettlementSettled` once |

## End-to-end proof (Fake settlement local)

Bill → COLLECTED → collection journal CONFIRMED → Settlement ELIGIBLE → Instruction → Fake submit → SUBMITTED → Reconcile settled → payout journal → SETTLED.

Platform: `npm run test:phase-f`, `npm run test:scenario:phase-f`, `docs/development/phase-f-test-evidence.md`.

## Status semantics (formal)

| Entity | Status | Means | Does not mean |
| --- | --- | --- | --- |
| Settlement | SUBMITTED | Provider accepted or unknown submit parked | Payout completed / SETTLED |
| Settlement | SETTLED | Finality `settled` + matching + payout journal | Bank-cash reconciled |
| Settlement | FAILED | Provider rejected ack or failed finality | Automatic replacement instruction |
| Instruction | OUTCOME_UNKNOWN | Must reconcile; no second submit | Terminal failure |

## Non-blocking risks

| Risk | Classification |
| --- | --- |
| A. OD-009 real settlement partner open | sandbox / production |
| B. Fake idempotency ≠ real provider guarantee | production |
| C. Fee/net payout policy unresolved | production commercial |
| D. SettlementBatch / cadence deferred (OD-011) | production aggregation |
| E. Automatic reconciliation polling deferred | operations |
| F. Business retry / superseding instructions deferred | product |
| G. Bank-cash / statement control deferred | financial control |
| H. Prisma/deepmerge npm advisory (no force-fix) | dependency |
| I. Local in-memory queue/broker ≠ production broker | infrastructure |

## Architecture drift resolved in this gate

Older Settlement FSM tables omitted `ELIGIBLE → FAILED` for F1 provider rejection. **ADR-028** and platform code allow that edge. Schema/docs updated to match Accepted ADR-028 (documented alignment — not a new decision).

## Next canonical phase

[build-phases](build-phases.md): **Phase G — Notifications & Webhooks**.

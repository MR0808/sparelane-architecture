# Phase D — Payment Reliability Engine

**Status:** Current  
**Owner:** Engineering / Architecture  
**Last Reviewed:** 2026-08-21  
**Related ADRs:** ADR-003, ADR-016, ADR-017, ADR-024, ADR-025 (Accepted); ADR-001, ADR-002, ADR-010  
**Related Views:** Payment Reliability Engine / payment lifecycle designs (SEQ-PAY-003+)

## Status

**PASS WITH DOCUMENTED NON-BLOCKING RISKS**

Recorded from `sparelane-platform` Phase D exit evidence (D0–D7). This is **payment collection reliability** implementation status against FakePSP — **not** MVP product acceptance, **not** ledger posting, and **not** real-PSP verification.

## Purpose

Phase D implements the Payment Reliability Engine: workflow state machine, ordered payment attempts, method selection, decline classification, PSP adapter execution (FakePSP for local), ADR-024 recovery ordering, ADR-025 retry timing/budget/cutoff/Retry Now, and durable `PaymentCollected` / `PaymentFailed` outbox events.

**Phase D collects at the provider (FakePSP) but does NOT post to the ledger.**

Phase D does **NOT** implement:

- journal / ledger posting / derived balances
- settlement or bank reconciliation
- automatic UNKNOWN-outcome reconciliation worker
- real PSP vendor integration (OD-008 / OD-010)
- wallet financial mutation
- signed merchant webhook product delivery / notification consumers

## D0–D6 summary (engineering decomposition)

These are **platform engineering sub-phases** decomposing canonical Phase D. They are **not** additional canonical architecture phases.

| Phase | Purpose | Implementation evidence (platform) | Status |
| --- | --- | --- | --- |
| D0 | Workflow state machine | `docs/development/phase-d0-traceability.md` | PASS |
| D1 | Payment attempt domain | `docs/development/phase-d1-traceability.md` | PASS |
| D2 | Reliability Engine / selection | `docs/development/phase-d2-traceability.md` | PASS |
| D3 | PSP adapter + FakePSP | `docs/development/phase-d3-traceability.md` | PASS |
| D4 | Decline + recovery (ADR-024) | `docs/development/phase-d4-traceability.md` | PASS |
| D5 | Retry / Retry Now / cutoff (ADR-025) | `docs/development/phase-d5-traceability.md` | PASS |
| D6 | E2E orchestration / concurrency | `docs/development/phase-d6-traceability.md` | PASS |
| D7 | Exit gate & architecture evidence | `docs/development/phase-d-final-status.md` | PASS WITH DOCUMENTED NON-BLOCKING RISKS |

Canonical Phase D remains [build-phases](build-phases.md) — **Payment Reliability Engine**.

## Capabilities implemented

| Capability | Notes |
| --- | --- |
| One workflow per bill | Driven from Phase C bill → workflow |
| Primary / backup selection | Deterministic priority + eligibility |
| Ordered PaymentAttempts | Persisted; Execute outboxed with create |
| Provider abstraction + FakePSP | Production fail-closed without real provider |
| ADR-024 recovery | Backup-before-soft-retry; UNKNOWN blocks |
| ADR-025 retries | Max 3; 6h/24h/48h; dueDate+7d@09:00 frozen TZ |
| Retry Now | Portal `POST .../retry-now` + command |
| COLLECTED | Sets `ledgerPostingStatus=PENDING`; emits `PaymentCollected` once |
| ACTION_REQUIRED | Non-terminal; remediation before cutoff |
| FAILED | Cutoff / canonical terminal only; emits `PaymentFailed` once |

## End-to-end proof (FakePSP local)

Bill → workflow → startPaymentCollection → selection → attempt → FakePSP → result → backup / schedule / Retry Now / cutoff → COLLECTED or FAILED.

Platform evidence: `sparelane-platform/tests/e2e/phase-d/`, `npm run test:scenario:phase-d`, `docs/development/phase-d-test-evidence.md`.

## Status semantics (formal)

| Entity | Status | Means | Does not mean |
| --- | --- | --- | --- |
| PaymentWorkflow | COLLECTED | Provider capture succeeded | Ledger posted / merchant settled |
| ledgerPostingStatus | PENDING | Phase E may post | Journal exists |
| PaymentWorkflow | ACTION_REQUIRED | Auto recovery paused; window may still be open | Terminal failure |
| PaymentWorkflow | FAILED | Recovery window closed / terminal trigger | Single decline failed the bill |
| Attempt | UNKNOWN / SUBMITTED park | Blocks alternate charges | Outcome will auto-resolve |

## PaymentCollected → Phase E handoff

```
PaymentAttempt CAPTURED
  → PaymentWorkflow COLLECTED
  → ledgerPostingStatus = PENDING
  → PaymentCollected (outbox)
  → STOP
```

No `JournalTransaction` / `JournalEntry` / `Settlement` in Phase D. **Phase E — Ledger** starts from this durable event/state.

## Requirements evidence (architecture)

Conservative `implementationStatus: implemented` (architecture `status` remains `accepted`) for Phase D product slices of:

- FUN-PAY-001, FUN-PAY-003, FUN-PAY-004, FUN-PAY-005, FUN-PAY-006
- FUN-CON-006
- FUN-PAY-007 / FUN-PAY-008 marked **partial** in platform requirements evidence (notifications / real-PSP+ledger)

FUN-PAY-002 pre-auth remains foundation-only. INT-PSP requirements remain foundation/partial (FakePSP adapter; OD-008/010 open).

E2E-PAY-001–005: local FakePSP product evidence documented in body; **not** `implementationProgress: product_verified`.

## Test evidence

See platform `phase-d-test-evidence.md` and [financial-invariant-tests](financial-invariant-tests.md).

## FIN-INV status (Phase D)

| ID | Phase D |
| --- | --- |
| FIN-INV-01 | Local FakePSP evidence (orchestration) — not real-PSP `product_verified` |
| FIN-INV-02, 03, 05, 07 | Not yet testable |
| FIN-INV-04, 08 | Partial prerequisite |
| FIN-INV-06, 09, 10 | Local collection evidence / partial prerequisite |

## Non-blocking risks

| Risk | Local | Sandbox | Pilot | Production |
| --- | --- | --- | --- | --- |
| A. Real PSP not selected/verified | OK (FakePSP) | Blocks live card | Blocks | Blocks money |
| B. UNKNOWN automatic reconciliation missing | Parks | Parks | Parks | Production blocker |
| C. FakePSP idempotency local only | Proven | Re-run | Re-run | Live needed |
| D. Production broker/queue (OD-017) | Soft | Soft | Partial | Required |
| E. Prisma CLI deepmerge-ts advisory | Track | Track | Track | Track |
| F. In-memory DLQ in local/test | OK | Topology | Decision | Hardening |
| G. Retry Now portal HTTP thinner than E2E | Documented | Same | Expand | Expand |
| H. Secrets/KMS/provider config | Dev | Secrets | OD-025 | Required |
| I. Backup cardinality OD-003 | Soft | Soft | Decide | Decide |

## Open decisions (unchanged by D7 alone)

- **OD-003** — backup cardinality
- **OD-008** — PSP selection
- **OD-010** — provider capability matrix
- **OD-013** — PCI validation / SAQ
- **OD-017** — broker
- **OD-025** — secrets / KMS

ADR-024 / ADR-025 remain **Accepted** — no contradiction found.

## Architecture drift

Platform `phase-d6-architecture-drift.md`: D6 wiring gaps **resolved**; reconciliation **future risk**; ledger **Phase E**. No material Accepted-ADR contradiction.

## Explicitly NOT implemented

Ledger, settlement, wallet money movement, UNKNOWN reconciliation worker, real PSP, merchant webhook delivery.

## Next phase

[Phase E — Ledger](build-phases.md) is **NOT STARTED**. Delivers: journal, collection posting, derived balances, financial invariant tests. Depends on Phase D successful collection path (`PaymentCollected` / `ledgerPostingStatus=PENDING`).

## Platform evidence (do not copy)

- `sparelane-platform/docs/development/phase-d-final-status.md`
- `sparelane-platform/docs/development/phase-d-traceability.md`
- `sparelane-platform/docs/development/phase-d-requirements.md`
- `sparelane-platform/docs/development/phase-d-test-evidence.md`
- `sparelane-platform/docs/development/phase-d-exit-gate.md`
- `sparelane-platform/tests/e2e/phase-d/`

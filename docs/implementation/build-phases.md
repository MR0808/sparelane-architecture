# Build Phases

Recommended MVP implementation sequence for `sparelane-platform`. Architecture repo remains SoT for design.

Dependencies: later phases assume earlier phases deliver their foundation. Do not start Phase F before Phase E gating works.

---

## Phase A — Platform Foundation

**Platform implementation:** [PASS WITH DOCUMENTED NON-BLOCKING RISKS](phase-a-status.md) (A0–A9). Foundation only — not MVP product acceptance.

**Delivers:** repo scaffold, CI, config/secrets patterns, observability scaffolding, auth foundation, merchant tenancy model, DB foundation (operational + ledger logical schemas).

**Depends on:** nothing (architecture Accepted).

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local development | Soft | Queue/broker can be in-memory/fake; cloud not required |
| Sandbox | Soft | Cloud hosting choice |
| Pilot | Partial | Secrets product, IdP, observability vendor |
| Production money | Yes-ish | Secrets manager product, cloud topology |

---

## Phase B — Merchant + Consumer Core

**Platform implementation:** [PASS WITH DOCUMENTED NON-BLOCKING RISKS](phase-b-status.md) (B0–B6). Merchant + consumer core only — **no money movement**, not MVP acceptance.

**Delivers:** merchants, consumers, connections, payment method token refs, merchant portal basics.

**Depends on:** A.

Engineering may further decompose this same scope (identity composition, merchant domain, consumer profile, connections, token-reference priority, UI foundations, B exit gate). That granularity is planning detail only; it does not replace this phase’s deliverables.

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local | Soft | IdP can be stub/dev auth |
| Sandbox | Partial | Identity provider for real sandbox sessions |
| Pilot | Partial | Admin MFA / passkey approach |
| Production | Partial | Production IdP + MFA |

---

## Phase C — Bill Ingestion

**Platform implementation:** [PASS WITH DOCUMENTED NON-BLOCKING RISKS](phase-c-status.md) (C0–C5). Bill ingestion only — **no money movement**, not MVP acceptance.

**Delivers:** Merchant API (`CreateBill`), idempotency, bills, 1:1 workflow creation, outbox write path.

**Depends on:** B (merchant + connection).

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local | No | Outbox publisher can poll locally |
| Sandbox | Soft | Broker TBD; sandbox webhook endpoints for merchants |
| Pilot | Partial | Idempotency key retention TTL; due-date local clock default |
| Production | Partial | Due-date clock + timezone-change policy |

---

## Phase D — Payment Reliability Engine

**Platform implementation:** [PASS WITH DOCUMENTED NON-BLOCKING RISKS](phase-d-status.md) (D0–D7). Payment reliability / FakePSP collection only — **no ledger posting**, not MVP acceptance, not real-PSP verified.

**Delivers:** workflow state machine, attempts, reliability engine, retry scheduler, PSP adapter interface (+ fake).

**Depends on:** C.

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local | No | Fake PSP adapter |
| Sandbox | **Yes** for live card sandbox | PSP selection + sandbox credentials |
| Pilot | **Yes** | PSP + capability matrix (pre-auth, idempotency) |
| Production money | **Yes** | Live PSP + PCI validation approach |

Product config (backup cardinality) is **Partial** — [OD-003](../decisions/open/OD-003-backup-cardinality.md) remains open. **Qualitative** recovery ordering/exhaustion: [ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md). **Numeric** retry timings/cutoff/due clock/Retry Now: [ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md).

---

## Phase E — Ledger

**Platform implementation:** E0 (domain/invariants) **PASS**; E1 (PaymentCollected → journal) **blocked until ADR-026** — now **unblocked** by Accepted [ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md). Full Phase E not complete until collection posting + FIN-INV evidence land.

**Delivers:** journal, collection posting, derived balances, financial invariant tests.

**Depends on:** D (successful collection path).

**Binding collection CoA:** ADR-026 (Dr processor clearing / Cr merchant payable; gross Bill amount; PENDING→CONFIRMED).

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local–Pilot | Soft | Shared vs separate ledger DB topology ([OD-019](../decisions/open/OD-019-db-topology.md)) |
| Production | Partial | Physical DB topology confirmed; broader CoA beyond collection still TBD |

---

## Phase F — Settlement

**Delivers:** settlement lifecycle, settlement adapter (+ fake), reconciliation, failure/unknown outcome handling.

**Depends on:** E (posting confirmed before eligibility).

**Binding obligation/eligibility:** [ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md). Gate: [phase-f0-settlement-decision-gate](./phase-f0-settlement-decision-gate.md).

**Binding execution/instruction:** [ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md). Gate: [phase-f1-settlement-execution-decision-gate](./phase-f1-settlement-execution-decision-gate.md).

**Binding finality / payout accounting:** [ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md). Gate: [phase-f2-settlement-finality-decision-gate](./phase-f2-settlement-finality-decision-gate.md).

**Engineering sub-phases (local):**

| Slice | Scope |
| --- | --- |
| **F0** | `LedgerPostingConfirmed` → create Settlement PENDING → evaluate → ELIGIBLE; unique per workflow; no batch/instruction/bank |
| **F1** | Payout destination + 1:1 SettlementInstruction + FakeSettlementProvider; ELIGIBLE → SUBMITTED; no batch; no SETTLED; no settlement CoA |
| **F2** | `ReconcileSettlement` → finality → payout journal → SETTLED; unknown/not_found hold; no poll cadence; no fee netting |

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local F0 | No | Fake KYB / `APPROVED_FOR_SETTLEMENT` |
| Local F1 | No | Fake settlement adapter + Fake destinations ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)) |
| Local F2 | No | Fake finality + gross payout journal ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)) |
| Sandbox | **Yes** for live payout sandbox | Settlement/banking partner ([OD-009](../decisions/open/OD-009-settlement-partner.md)) |
| Pilot / Production money | **Yes** | Partner + fee/net (if commercial net required) + live reconcile adapters; batch cadence ([OD-011](../decisions/open/OD-011-settlement-batching.md)) only if aggregation enabled |

**Platform status:** [phase-f-status](./phase-f-status.md) — **PASS WITH DOCUMENTED NON-BLOCKING RISKS** (local Fake settlement only).

---

## Phase G — Notifications & Webhooks

**Delivers:** curated merchant events, delivery/retry, email/SMS adapters.

**Depends on:** C+ (events exist); ideally D/F for payment/settlement events.

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local | No | Fake email/SMS |
| Sandbox | Soft | Email/SMS provider; webhook retry schedule defaults |
| Pilot | Soft | Consumer notification copy |
| Production | Soft | Vendor selection |

---

## Phase H — Security/Admin Hardening

**Delivers:** admin workflows, audit completeness, security controls, operational tooling (DLQ replay UI).

**Depends on:** A–G core paths exist.

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Pilot | Partial | Admin MFA, dual-control for privileged financial ops |
| Production | Partial | SIEM, break-glass, PCI program evidence |

---

## Phase I — Pilot Readiness

**Delivers:** runbooks, alerts, sandbox end-to-end, load/recovery testing, pen-test/security validation, reconciliation testing.

**Depends on:** A–H for scoped pilot features.

**Open decisions that block production money movement**

1. PSP + settlement partner
2. Identity provider + admin MFA
3. Secrets manager / KMS
4. Queue/broker + DB hosting topology
5. Legal retention (+ wallet licensing **if** wallet enabled)
6. Due-date local clock default + timezone-change policy

**Wallet go-live** additionally blocked by regulatory custody/safeguarding decision — not required for non-wallet MVP.

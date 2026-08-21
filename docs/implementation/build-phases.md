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

**Delivers:** workflow state machine, attempts, reliability engine, retry scheduler, PSP adapter interface (+ fake).

**Depends on:** C.

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local | No | Fake PSP adapter |
| Sandbox | **Yes** for live card sandbox | PSP selection + sandbox credentials |
| Pilot | **Yes** | PSP + capability matrix (pre-auth, idempotency) |
| Production money | **Yes** | Live PSP + PCI validation approach |

Product config (retry windows, backup cardinality) is **Partial** — ship with safe defaults.

---

## Phase E — Ledger

**Delivers:** journal, collection posting, derived balances, financial invariant tests.

**Depends on:** D (successful collection path).

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local–Pilot | Soft | Shared vs separate ledger DB topology |
| Production | Partial | Physical DB topology confirmed |

---

## Phase F — Settlement

**Delivers:** settlement lifecycle, settlement adapter (+ fake), reconciliation, failure/unknown outcome handling.

**Depends on:** E (posting confirmed before eligibility).

**Open decisions**

| Stage | Blocks? | Items |
| --- | --- | --- |
| Local | No | Fake settlement adapter |
| Sandbox | **Yes** for live payout sandbox | Settlement/banking partner |
| Pilot / Production money | **Yes** | Partner + schedule/batching rules |

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

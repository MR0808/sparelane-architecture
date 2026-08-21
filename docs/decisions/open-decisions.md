# Open Decisions

Unresolved items that are **not** Accepted ADRs. Organised separately from vendor-neutral architecture decisions.

**Source of truth:** individual files under [`docs/decisions/open/`](./open/). This index is a catalogue only — do not duplicate decision substance here.

Stable IDs (`OD-###`) are never renumbered after assignment.

Implementation phase detail: [`docs/implementation/build-phases.md`](../implementation/build-phases.md). Phase A foundation status: [`docs/implementation/phase-a-status.md`](../implementation/phase-a-status.md). Phase B merchant/consumer core: [`docs/implementation/phase-b-status.md`](../implementation/phase-b-status.md). Phase C bill ingestion: [`docs/implementation/phase-c-status.md`](../implementation/phase-c-status.md).

Portal: `/decisions` and `/decisions/open/:id`.

---

## Phase A impact

Phase A implemented **abstractions and local fakes**. It did **not** resolve vendor or production-topology ODs.

| Effect | Open decisions |
| --- | --- |
| Remains OPEN | All catalogue items unless listed below |
| Implementation evidence; still OPEN | OD-018 — local **polling** outbox publisher exists; CDC vs polling is not decided |
| Local fakes constrain nothing | OD-008 PSP, OD-009 settlement partner, OD-023 IdP, OD-017 broker, OD-019 DB topology, OD-025 KMS, OD-016 cloud, OD-021 SIEM |
| Does not block local Phase B | Stub/dev auth and fakes are allowed by [build-phases](../implementation/build-phases.md) |

No OD is marked resolved by Phase A.

---

## Phase B impact

Phase B implemented **merchant/consumer core with local fakes**. It did **not** resolve vendor, production-topology, or money-movement ODs.

| Effect | Open decisions |
| --- | --- |
| Remains OPEN | All catalogue items unless listed below |
| Local fakes / stubs; still OPEN | OD-023 IdP, OD-008 PSP / hosted tokenisation, OD-015 KYB, OD-017 broker, OD-025 KMS, OD-019 topology |
| Phase B drift clarifications (not resolved) | OD-003 backup cardinality — default priority convention exists; caps/wallet ordering still open. Reconnect-after-revoke semantics — unique pair constraint; no OD created (product/schema clarification) |
| Does not block local Phase C | Stub `/v1`, fake auth, token-reference path per [build-phases](../implementation/build-phases.md) |

No OD is marked resolved by Phase B.

---

## Phase C impact

Phase C implemented **bill ingestion with local fakes**. It did **not** resolve vendor, production-topology, retention, or money-movement ODs.

| Effect | Open decisions |
| --- | --- |
| Remains OPEN | All catalogue items unless listed below |
| Implementation evidence; still OPEN | OD-030 — idempotency keys are stored and exercised; **retention TTL not chosen**. OD-029 — in-memory rate limit exists; distributed limits not chosen. OD-018 — polling outbox remains local convention |
| Drift clarifications (not new ODs) | OpenAPI **201** is SoT for CreateBill (SEQ-PAY-001 corrected). Canonical internal event **BillAccepted** (design/LikeC4 aligned). GET Bill uses `merchant_machine` without inventing `bills.read`. Concurrent same-key may return **503** then replay with same key |
| Does not block local Phase D | Fake PSP adapter allowed by [build-phases](../implementation/build-phases.md) |

No OD is marked resolved by Phase C alone.

---

## Phase D impact (architecture decision gate)

Architecture [ADR-024](./ADR-024-payment-recovery-ordering-and-exhaustion.md) resolves the **qualitative** recovery-policy questions that blocked platform D4.

Architecture [ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md) resolves the **numeric** retry/cutoff/clock questions that blocked platform D5:

| Effect | Detail |
| --- | --- |
| Resolved (no separate OD) | Soft-declined method before vs after backups — **MVP default: try eligible backups immediately first** (ADR-024) |
| Resolved (no separate OD) | Automatic method/retry-budget exhaustion → **`ACTION_REQUIRED`**; **`FAILED`** when recovery window/cutoff closed (ADR-024) |
| **Resolved** | [OD-001](./open/OD-001-retry-timing.md) → ADR-025 (3 retries; 6h/24h/48h; no quiet hours; 7-day cutoff) |
| **Resolved** | [OD-002](./open/OD-002-due-date-local-clock.md) → ADR-025 (09:00 merchant-local) |
| **Resolved** | [OD-006](./open/OD-006-timezone-change-policy.md) → ADR-025 (keep stored UTC schedules; freeze workflow TZ) |
| Remains OPEN | [OD-003](./open/OD-003-backup-cardinality.md) backup cardinality / wallet ordering caps |

Do not create duplicate ODs for soft-before-backup, ACTION_REQUIRED-vs-FAILED, or MVP retry timings — those are Accepted ADR-024 / ADR-025.

### Phase D exit (D7) — still open after local FakePSP pass

| Item | Status |
| --- | --- |
| Platform Phase D gate | [PASS WITH DOCUMENTED NON-BLOCKING RISKS](../implementation/phase-d-status.md) |
| Remains OPEN (blocks sandbox/pilot money) | [OD-008](./open/OD-008-psp-selection.md) PSP selection; [OD-010](./open/OD-010-provider-capability-matrix.md) capability matrix |
| Remains OPEN | OD-003 backup cardinality; OD-017 broker; OD-013 PCI validation; OD-025 secrets/KMS |
| Deferred product (not new ODs) | UNKNOWN automatic reconciliation worker; notification consumers (OD-005) |

No OD is marked resolved merely because FakePSP local evidence exists.

---

## Phase E accounting decision gate

Architecture [ADR-026](./ADR-026-collection-ledger-posting-minimal-coa.md) freezes the **MVP collection journal CoA slice** that blocked platform E1:

| Effect | Detail |
| --- | --- |
| **Resolved (no prior OD id)** | Collection debit/credit legs, account codes, amount source (Bill gross), fees excluded, `business_reference`, PENDING→CONFIRMED, `LedgerPostingConfirmed` |
| Remains OPEN (broader CoA) | Settlement, fee recognition, refunds, chargebacks, wallet, tax, FX, suspense — still TBD |
| Remains OPEN | [OD-019](./open/OD-019-db-topology.md) physical ledger DB topology; [OD-008](./open/OD-008-psp-selection.md) PSP selection (`providerCode` values) |

Do not treat ADR-026 as freezing the final enterprise Chart of Accounts.

---

## Phase F0 settlement decision gate

Architecture [ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md) freezes settlement **obligation and eligibility** that blocked platform F0:

| Effect | Detail |
| --- | --- |
| **Resolved (no prior OD id)** | 1:1 Settlement per confirmed collection; amount = ADR-026 payable CREDIT (gross); PENDING→ELIGIBLE; merchant status table; KYB/`APPROVED_FOR_SETTLEMENT`; business identity; uniqueness |
| Narrowed (not resolved) | [OD-011](./open/OD-011-settlement-batching.md) — **role** of batching = optional later execution grouping; cadence/schedule still open |
| Remains OPEN | [OD-009](./open/OD-009-settlement-partner.md) partner; fee/reserve netting; settlement execution CoA; [OD-015](./open/OD-015-kyb-evidence-retention.md) evidence retention |

Do not treat ADR-027 as selecting a banking partner or inventing fee netting.

---

## Phase F1 settlement execution decision gate

Architecture [ADR-028](./ADR-028-settlement-execution-payout-destination-instruction-idempotency.md) freezes MVP **execution / destination / instruction** policy that blocked platform F1:

| Effect | Detail |
| --- | --- |
| **Resolved (no prior OD id)** | No MVP batching; MerchantPayoutDestination token model; default per merchant+currency; 1:1 instruction; gross amount; idempotency key; provider taxonomy; SUBMITTED end; unknown hold; Fake-only F1; no settlement journal in F1 |
| Narrowed (not resolved) | [OD-011](./open/OD-011-settlement-batching.md) — F1 does not batch; future production aggregation cadence still open |
| Remains OPEN | [OD-009](./open/OD-009-settlement-partner.md) real partner; fee/reserve netting; settlement execution CoA (blocks production money); reconciliation → SETTLED (F2+); [OD-015](./open/OD-015-kyb-evidence-retention.md) |

Do not treat ADR-028 as selecting a banking partner, inventing payout CoA, or marking SETTLED on provider ack.

---

## Catalogue

### product

| ID | Decision | Blocking stage | Status |
| --- | --- | --- | --- |
| [OD-001](./open/OD-001-retry-timing.md) | Exact retry timing, windows, maxima, quiet hours | development | resolved |
| [OD-002](./open/OD-002-due-date-local-clock.md) | Exact due-date local capture clock time | pilot | resolved |
| [OD-003](./open/OD-003-backup-cardinality.md) | Payment-method backup cardinality / wallet ordering | development | open |
| [OD-004](./open/OD-004-wallet-product-rules.md) | Wallet product rules (enablement, funding, spend) | wallet-only | open |
| [OD-005](./open/OD-005-notification-rules.md) | Consumer notification rules and copy | non-blocking | open |
| [OD-006](./open/OD-006-timezone-change-policy.md) | Merchant timezone change handling policy | pilot | resolved |
| [OD-007](./open/OD-007-multi-workflow-per-bill.md) | Multi-workflow-per-bill (future) | non-blocking | deferred |

### payments

| ID | Decision | Blocking stage | Status |
| --- | --- | --- | --- |
| [OD-008](./open/OD-008-psp-selection.md) | PSP selection | sandbox | open |
| [OD-009](./open/OD-009-settlement-partner.md) | Settlement / banking partner | sandbox | open |
| [OD-010](./open/OD-010-provider-capability-matrix.md) | Provider capability matrix (pre-auth, idempotency keys) | pilot | open |
| [OD-011](./open/OD-011-settlement-batching.md) | Settlement schedule / batching rules | non-blocking | open |

### regulatory

| ID | Decision | Blocking stage | Status |
| --- | --- | --- | --- |
| [OD-012](./open/OD-012-wallet-custody-licensing.md) | Wallet custody / safeguarding / licensing | wallet-only | open |
| [OD-013](./open/OD-013-pci-validation.md) | PCI validation approach / SAQ level | production | open |
| [OD-014](./open/OD-014-legal-retention.md) | Legal data retention periods | production | open |
| [OD-015](./open/OD-015-kyb-evidence-retention.md) | KYC/KYB evidence retention | development | open |

### infrastructure

| ID | Decision | Blocking stage | Status |
| --- | --- | --- | --- |
| [OD-016](./open/OD-016-cloud-provider.md) | Cloud provider | development | open |
| [OD-017](./open/OD-017-queue-broker.md) | Queue / event broker | production | open |
| [OD-018](./open/OD-018-outbox-publish.md) | Outbox publish mechanism (polling vs CDC) | development | open |
| [OD-019](./open/OD-019-db-topology.md) | Physical DB topology (shared vs separate ledger DB) | production | open |
| [OD-020](./open/OD-020-worker-runtime.md) | Worker runtime (K8s/ECS/serverless/…) | development | open |
| [OD-021](./open/OD-021-observability-siem.md) | Observability / SIEM vendors | non-blocking | open |
| [OD-022](./open/OD-022-regions-ha.md) | Regions / HA / numeric RPO-RTO | production | open |

### security

| ID | Decision | Blocking stage | Status |
| --- | --- | --- | --- |
| [OD-023](./open/OD-023-identity-provider.md) | Identity provider | sandbox | open |
| [OD-024](./open/OD-024-mfa-passkey.md) | MFA / passkey implementation | pilot | open |
| [OD-025](./open/OD-025-secrets-kms.md) | Secrets product / KMS/HSM | pilot | open |
| [OD-026](./open/OD-026-dual-control-break-glass.md) | Dual-control / break-glass workflows | non-blocking | open |
| [OD-027](./open/OD-027-rls-vs-app-tenancy.md) | PostgreSQL RLS vs app-only tenancy | non-blocking | open |
| [OD-028](./open/OD-028-oauth-mtls-merchant-api.md) | OAuth/mTLS for enterprise merchant API | non-blocking | open |

### api

| ID | Decision | Blocking stage | Status |
| --- | --- | --- | --- |
| [OD-029](./open/OD-029-rate-limits.md) | Numeric rate limits | non-blocking | open |
| [OD-030](./open/OD-030-idempotency-ttl.md) | Idempotency key retention TTL | development | open |
| [OD-031](./open/OD-031-webhook-retry-bounds.md) | Webhook retry schedule / attempt bounds | development | open |
| [OD-032](./open/OD-032-public-id-prefixes.md) | Public ID prefix final spelling | non-blocking | open |
| [OD-033](./open/OD-033-attempt-api-visibility.md) | Payment-attempt merchant API visibility | non-blocking | open |
| [OD-034](./open/OD-034-webhook-endpoint-api.md) | Webhook endpoint management via API | non-blocking | open |


## Highest-priority before production cutover

1. OD-008 PSP + OD-009 settlement partner (live money movement)
2. OD-023 Identity provider + OD-024 admin MFA
3. OD-025 Secrets manager product
4. OD-017 Queue/broker + OD-019 DB hosting topology
5. OD-014 Legal retention + OD-012 wallet regulatory posture (if wallet enabled)
6. ~~OD-002 Due-date local clock + OD-006 timezone-change policy~~ → **resolved by ADR-025**

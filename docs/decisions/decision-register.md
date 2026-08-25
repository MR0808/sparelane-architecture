# Architecture Decision Register

Quick-reference governance index for ADR-001 through ADR-039.

**Accepted** ADRs are binding implementation constraints unless superseded by a later ADR.

| ADR | Decision | Status | Architecture Area | Key Dependencies | Implementation Consequence |
| --- | --- | --- | --- | --- | --- |
| [ADR-001](./ADR-001-psp-tokenisation.md) | PSP tokenisation; no raw card vault in Sparelane | Accepted | Payments / PCI | AP-03, AP-04; PSP vendor TBD | Store token refs + safe metadata only |
| [ADR-002](./ADR-002-payment-orchestrator.md) | Dedicated Payment Orchestrator | Accepted | Payments | ADR-003 | Orchestrator coordinates; does not own ledger/settlement |
| [ADR-003](./ADR-003-payment-workflow-vs-attempt.md) | Separate workflow vs attempt; MVP Bill 1→1 Workflow, 1→N Attempts | Accepted | Payments | State machine docs | Unique `bill_id` on workflows; attempts append-only |
| [ADR-004](./ADR-004-double-entry-ledger.md) | Double-entry ledger as financial SoT | Accepted | Money | ADR-013, ADR-016, ADR-021 | Append-only balanced journals |
| [ADR-005](./ADR-005-collection-before-settlement.md) | Collection before settlement | Accepted | Money | ADR-006 | No settlement without COLLECTED (+ ledger confirm) |
| [ADR-006](./ADR-006-separate-settlement-lifecycle.md) | Separate settlement lifecycle | Accepted | Money | ADR-005 | Distinct settlement states/services |
| [ADR-007](./ADR-007-merchant-billing-system-of-record.md) | Merchant remains billing SoR | Accepted | Integrations / Product | AP-01 | Sparelane stores bill projection only |
| [ADR-008](./ADR-008-idempotent-merchant-api.md) | Idempotent merchant mutations | Accepted | Integrations / API | OpenAPI; retention TBD | Idempotency-Key + fingerprint storage |
| [ADR-009](./ADR-009-signed-at-least-once-webhooks.md) | Signed at-least-once webhooks | Accepted | Integrations | ADR-017, ADR-023 | Stable event IDs; merchant-side idempotency |
| [ADR-010](./ADR-010-pci-boundary.md) | Raw CHD remains in PSP trust boundary | Accepted | Security / PCI | ADR-001; SAQ TBD | Explicit scope boundary; no CVV persistence |
| [ADR-011](./ADR-011-centralised-secrets-management.md) | Centralised secrets management | Accepted | Security / Ops | Vendor TBD | No secrets in source control |
| [ADR-012](./ADR-012-privileged-admin-audit.md) | Privileged admin actions auditable | Accepted | Security | Audit store | Durable audit; no secret/CHD in logs |
| [ADR-013](./ADR-013-ledger-operational-separation.md) | Ledger independent of operational workflow data | Accepted | Data / Money | ADR-004, ADR-016 | Separate logical SoTs |
| [ADR-014](./ADR-014-merchant-tenant-isolation.md) | Merchant tenant isolation mandatory | Accepted | Security / Data | RLS optional TBD | Explicit merchant context everywhere |
| [ADR-015](./ADR-015-analytics-not-source-of-truth.md) | Analytics is derived, not transactional SoT | Accepted | Data / Ops | ADR-019 | Analytics outage must not stop payments |
| [ADR-016](./ADR-016-operational-ledger-consistency.md) | Transactional outbox + idempotent ledger posting | Accepted | Ops / Money | ADR-013, ADR-017 | Settlement after posting confirmed; polling vs CDC TBD |
| [ADR-017](./ADR-017-at-least-once-async-processing.md) | At-least-once async; idempotent consumers | Accepted | Ops | ADR-009, ADR-016 | No reliance on exactly-once infra alone |
| [ADR-018](./ADR-018-logical-vs-physical-services.md) | Logical services may share deployables | Accepted | Ops / Deployment | Deployable units docs | No forced microservice-per-service |
| [ADR-019](./ADR-019-financial-workload-isolation.md) | Isolate financial workloads from non-critical | Accepted | Ops | ADR-015 | Separate pools/queues/limits as needed |
| [ADR-020](./ADR-020-opaque-public-identifiers.md) | Opaque public identifiers | Accepted | Schema / API | OpenAPI | Public ≠ internal ≠ merchant ≠ provider IDs |
| [ADR-021](./ADR-021-money-representation.md) | Decimal-safe money; no float | Accepted | Schema / API | OpenAPI; currency exponent map | API decimal string; DB minor units |
| [ADR-022](./ADR-022-versioned-external-contracts.md) | Versioned external contracts | Accepted | API / Webhooks | `/v1` OpenAPI | Breaking changes need new major |
| [ADR-023](./ADR-023-curated-external-events.md) | Curated external webhook events | Accepted | Integrations | ADR-009 | Not raw internal domain events |
| [ADR-024](./ADR-024-payment-recovery-ordering-and-exhaustion.md) | MVP recovery ordering + exhaustion (backup-before-soft-retry; ACTION_REQUIRED before FAILED) | Accepted | Payments | ADR-002, ADR-003; timings in ADR-025 | D4 orchestrator decision table; D5 schedules when |
| [ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md) | MVP retry timings, budget, due clock, cutoff, Retry Now, timezone freeze | Accepted | Payments | ADR-024; resolves OD-001/002/006 | D5 Retry Service / ScheduledJob / cutoff |
| [ADR-026](./ADR-026-collection-ledger-posting-minimal-coa.md) | MVP collection journal CoA slice (Dr processor clearing / Cr merchant payable) | Accepted | Money / Ledger | ADR-004/005/013/016/021 | Platform E1 PaymentCollected → journal → CONFIRMED |
| [ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md) | MVP settlement obligation 1:1 workflow; gross payable amount; PENDING→ELIGIBLE; KYB gate | Accepted | Money / Settlement | ADR-005/006/026 | Platform F0 LedgerPostingConfirmed → Settlement |
| [ADR-028](./ADR-028-settlement-execution-payout-destination-instruction-idempotency.md) | MVP settlement execution: no batching; payout destination token; 1:1 instruction; provider taxonomy; Fake F1 ends SUBMITTED | Accepted | Money / Settlement | ADR-006/017/026/027 | Platform F1 ELIGIBLE → instruction → Fake submit |
| [ADR-029](./ADR-029-settlement-finality-reconciliation-payout-accounting.md) | MVP settlement finality + payout CoA (Dr payable / Cr settlement clearing); journal before SETTLED | Accepted | Money / Settlement / Ledger | ADR-026/027/028 | Platform F2 ReconcileSettlement → journal → SETTLED |
| [ADR-030](./ADR-030-merchant-webhook-contract-signing-and-delivery.md) | MVP merchant webhook catalogue, envelope, HMAC-SHA256, SSRF, delivery identity, OD-031 retry; G2+ consumer notifications sequenced | Accepted | Integrations / Security | ADR-009/023/017/022; resolves OD-031 | Platform G0/G1 merchant webhooks |
| [ADR-031](./ADR-031-consumer-notification-contact-channel-and-delivery-policy.md) | Consumer notification contact, email MVP, G2 catalogue, templates, delivery/idempotency; SMS/prefs deferred | Accepted | Notifications / Privacy | ADR-019/030; resolves OD-005 core | Platform G2 consumer email + Fake provider |
| [ADR-032](./ADR-032-platform-admin-authority-read-only-control-plane.md) | Platform admin authority + H0 read-only control plane; no mutations/replay/grant UI | Accepted | Security / Admin | ADR-012/014; OD-024/026 open for prod/H1 | Platform H0 admin BFF + `/admin` shell; H1 mutations deferred |
| [ADR-033](./ADR-033-privileged-admin-grant-management-and-approval.md) | H1 Option A: grant create/revoke only; dual control + recent MFA; PrivilegedActionRequest | Accepted | Security / Admin | ADR-012/032; OD-024 policy narrowed; OD-026 grants resolved; break-glass deferred | Platform H1 grant management; replay/suspend deferred H2+ |
| [ADR-034](./ADR-034-durable-dead-letter-and-operator-replay-policy.md) | H2 Option A: durable DLQ + closed webhook replay only; financial/notification replay prohibited/deferred | Accepted | Security / Ops / Admin | ADR-017/030/031/032/033; OD-024 MFA reuse; OD-026 webhook dual-control not required | Platform H2 durable DLQ + webhook replay; Phase H local complete for H0–H2 |
| [ADR-035](./ADR-035-pilot-readiness-local-evidence-policy.md) | Phase I local Fake-provider pilot readiness evidence; live sandbox/prod thresholds deferred | Accepted | Operations / Pilot | ADR-012…034; OD-008/009/021/023/024/025/035 remain open for live/prod | Unblocks platform I0–I3 Fake evidence; does not close MVP or live-partner readiness |
| [ADR-036](./ADR-036-financial-compensating-correction-policy.md) | MVP Option A: privileged append-only compensating journals; accounting-evidence only; dual control | Accepted | Money / Ledger / Admin | ADR-004/012/013/033; OD-026 corrections resolved; OD-024 MFA provider open | Unblocks platform FIN-INV-07 implementation; not verified until tests pass |
| [ADR-037](./ADR-037-collection-funds-flow-merchant-of-record.md) | Option C connected/sub-merchant; merchant MoR; Sparelane NO_CUSTODY; Phase F reinterpretation | Accepted | Money / Payments / Regulatory | Resolves OD-036; constrains OD-008/009; clarifies ADR-026/029 economics | Unblocks OD-008 resume; no vendor selected |
| [ADR-038](./ADR-038-mvp-payment-service-provider-selection.md) | MVP PSP = Stripe Connect direct charges; platform pm_ + clone; acct_ as providerAccountRef | Accepted | Payments / Integrations | Resolves OD-008; ADR-037; OD-009 further narrowed | Unblocks Stripe adapter design; not live evidence |
| [ADR-039](./ADR-039-mvp-settlement-provider-selection.md) | MVP SettlementProvider = Stripe Connect manual payouts; gross via fees_collector=application; SETTLED on paid | Accepted | Money / Settlement | Resolves OD-009/010; ADR-027/028/029/037/038 | Unblocks settlement adapter design; not live evidence |

## Complementary pairs (not duplicates)

| Pair | Distinction |
| --- | --- |
| ADR-001 / ADR-010 | Tokenisation product choice vs explicit PCI trust/scope boundary |
| ADR-004 / ADR-013 | Ledger as financial SoT vs separation from operational workflow stores |
| ADR-009 / ADR-023 | Delivery semantics/security vs curation of external event contract |
| ADR-009 / ADR-030 | At-least-once signed webhooks principle vs frozen catalogue/signing/SSRF/retry |
| ADR-023 / ADR-030 | Curation principle vs closed MVP merchant type list and envelope |
| ADR-030 / ADR-031 | Merchant outbound HTTPS webhooks vs consumer email notifications |
| ADR-012 / ADR-032 | Privileged audit principle vs H0 read-only control plane scope (mutations H1+) |
| ADR-032 / ADR-033 | H0 read-only control plane vs H1 grant-management dual-control slice |
| ADR-033 / ADR-034 | Grant dual-control mutations vs durable DLQ + closed webhook transport replay |
| ADR-030 / ADR-034 | Automatic webhook delivery/retry vs operator manual replay policy |
| ADR-034 / ADR-035 | Admin/ops hardening (H2) vs pilot readiness local evidence scope (I) |
| ADR-004 / ADR-036 | Append-only ledger principle vs MVP compensating correction workflow policy |
| ADR-038 / ADR-039 | Stripe Connect collection (direct charges) vs Stripe Connect settlement (manual payouts) |
| ADR-029 / ADR-039 | Payout journal / SETTLED mechanics vs concrete Stripe `paid` finality binding |
| ADR-029 / ADR-037 | Payout journal mechanics vs provider-mediated settlement (no Sparelane custody) |
| ADR-033 / ADR-036 | Grant dual-control vs ledger-correction dual-control (same PrivilegedActionRequest pattern) |
| ADR-013 / ADR-016 | Logical separation vs consistency mechanism between the stores |
| ADR-026 / ADR-027 | Collection journal CoA vs settlement obligation/eligibility policy |
| ADR-027 / ADR-028 | Settlement obligation/eligibility vs instruction execution / destination / idempotency |
| ADR-028 / ADR-029 | Instruction execution / SUBMITTED vs finality / payout journal / SETTLED |

## None superseded or rejected

No ADRs in 001–039 are Superseded or Rejected at this gate. ADR-038 resolves OD-008; ADR-039 resolves OD-009 and closes OD-010 capability matrix for selected vendors. **Stripe PSP + settlement adapters and LIVE_EVIDENCE remain pending.** Independent EXTERNAL_VENDOR_DECISION blockers: OD-023, OD-025. Track 2B OD-009 PASS documented.

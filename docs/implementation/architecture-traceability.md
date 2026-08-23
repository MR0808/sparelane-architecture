# Architecture Traceability Matrix

Maps Accepted ADRs → design docs → implementation modules → verification.

**Complementary artefacts:**

- Requirement-centric traceability is generated from requirement markdown frontmatter in the portal (`/requirements/traceability`). Prefer updating requirement metadata for behaviour↔view↔test links; keep this document focused on **ADR → module → verification**.
- Platform **foundation** evidence for Phase A is recorded in [phase-a-status](phase-a-status.md) and [implementation-status](implementation-status.md). Path references point at `sparelane-platform`; this repo does not copy those tests.
- Platform **Phase B** merchant/consumer core evidence is recorded in [phase-b-status](phase-b-status.md). Phase B does not move money.
- Platform **Phase C** bill ingestion evidence is recorded in [phase-c-status](phase-c-status.md). Phase C does not move money.
- Platform **Phase D** payment reliability evidence is recorded in [phase-d-status](phase-d-status.md). Phase D collects via FakePSP; ledger posting remains PENDING.

Distinguish:

Architecture decision → Requirement → Design → Implementation phase → Implementation evidence → Test evidence

| Layer | Phase A example | Phase B example | Phase C example | Phase D example |
| --- | --- | --- | --- | --- |
| Architecture decision | ADR-016 / ADR-017 (outbox + at-least-once) | ADR-014 (tenant isolation); ADR-001/010 (PCI token refs) | ADR-007 / ADR-008 (billing SoR + idempotent Merchant API) | ADR-024 / ADR-025 (recovery + retry window) |
| Requirement | NFR-REL-001 (`status: accepted`) | FUN-CON-003 (`status: accepted`; partial implementation) | FUN-BIL-001 / FUN-MER-003 / FUN-MER-004 (`implementationStatus: implemented`) | FUN-PAY-001/003–006, FUN-CON-006 (`implementationStatus: implemented` local FakePSP) |
| Design | Outbox blueprint, async processing | PCI boundary, tenant isolation, connection security | SEQ-PAY-001, OpenAPI POST/GET bills | SEQ-PAY-003…007, STATE-PAY-001/002 |
| Implementation phase | A5 / A9 | B3 / B4 / B6 | C0–C5 | D0–D7 |
| Implementation evidence | Foundation outbox + idempotent consumer | Explicit connection + token refs; no payment execution | Machine auth + CreateBill + workflow + BillAccepted; no payment execution | Bill → workflow → selection → attempt → FakePSP → recovery → retry → COLLECTED/FAILED |
| Test evidence | FIN-INV-09 remains `specified`; foundation prerequisite | SEC-TEN-001 local product isolation evidence; not `product_verified` | INT-API-001 local evidence; FIN-INV / E2E-PAY not verified | E2E-PAY-001–005 local FakePSP; FIN-INV-01 local; not real-PSP `product_verified` |

**Phase D handoff:** `PaymentCollected` → Phase E ledger posting (`ledgerPostingStatus=PENDING`).

**Implemented** and **verified** in requirement `status` mean **product** claims. Phase A uses `implementationStatus: foundation_implemented` instead.

See also [requirements README](../../requirements/README.md).

| ADR | Design docs | Implementation module(s) | Verification |
| --- | --- | --- | --- |
| ADR-001 PSP tokenisation | [pci-boundary](../security/pci-boundary.md), [payment-method-selection](../payments/payment-method-selection.md) | Payment Methods, PSP adapter | No PAN/CVV stored; token ref only; PCI security tests |
| ADR-002 Payment orchestrator | [docs/payments/](../payments/) | Payment Workflows, Reliability Engine | Orchestration e2e; method selection unit |
| ADR-003 Workflow vs attempt | [payment-lifecycle](../payments/payment-lifecycle.md), [state-transitions](../schema/state-transitions.md) | Payment Workflows, Payment Attempts | 1 bill → 1 workflow; N attempts |
| ADR-004 Double-entry ledger | [ledger-model](../money/ledger-model.md), [ledger-blueprint](ledger-blueprint.md) | Ledger | Balanced journal; invariant #3 |
| ADR-005 Collection before settlement | [settlement-state-machine](../money/settlement-state-machine.md) | Settlement, Ledger | Invariant #4; settlement gating |
| ADR-006 Separate settlement lifecycle | [settlement-state-machine](../money/settlement-state-machine.md), [reconciliation](../money/reconciliation.md) | Settlement, Reconciliation | Settlement lifecycle e2e |
| ADR-007 Merchant billing SoR | [merchant-api](../integrations/merchant-api.md), [merchant-onboarding](../integrations/merchant-onboarding.md) | Bills, Merchant Integrations | Merchant submits bill; Sparelane ≠ billing SoR — Phase C evidence |
| ADR-008 Idempotent Merchant API | [merchant-api](../integrations/merchant-api.md), OpenAPI | Bills, API layer | Duplicate bill submission — Phase C INT-API-001 local evidence |
| ADR-009 Signed at-least-once webhooks | [webhooks](../integrations/webhooks.md), [webhook-security](../security/webhook-security.md) | Webhooks | Webhook retry e2e; signature security; ADR-030 freezes package |
| ADR-010 PCI boundary | [pci-boundary](../security/pci-boundary.md) | Payment Methods, PSP adapter | Security tests; no CHD in logs |
| ADR-011 Centralised secrets | [secrets-management](../security/secrets-management.md) | config/secrets, Integrations | Secret handling acceptance |
| ADR-012 Privileged admin audit | [audit](../security/audit.md), [admin-access](../security/admin-access.md) | Audit, Admin surfaces | Admin privileged action audited |
| ADR-013 Ledger/operational separation | [data-stores](../data/data-stores.md), [relational-model](../schema/relational-model.md) | Ledger vs operational packages | Separate schemas/access paths |
| ADR-014 Merchant tenant isolation | [tenant-isolation](../data/tenant-isolation.md) | All merchant-scoped modules | Invariant #8; IDOR security |
| ADR-015 Analytics not SoT | [analytics](../data/analytics.md) | Analytics (derived only) | Analytics outage ≠ payment failure |
| ADR-016 Operational↔ledger consistency | [transactional-outbox](../operations/transactional-outbox.md), [outbox-blueprint](outbox-blueprint.md) | Outbox, Ledger | Invariants #2,#9,#10; ledger recovery flow |
| ADR-017 At-least-once async | [async-processing](../operations/async-processing.md), [workers](workers.md) | Workers, Outbox | Idempotent consumers; restart safety |
| ADR-018 Logical ≠ physical services | [deployment-units](../operations/deployment-units.md), [deployable-mapping](deployable-mapping.md) | Monorepo apps/* | Deployable mapping review |
| ADR-019 Financial workload isolation | [resilience-patterns](../operations/resilience-patterns.md) | payment/settlement workers | Notification failure ≠ payment failure |
| ADR-020 Opaque public IDs | [identifier-strategy](../schema/identifier-strategy.md), OpenAPI | contracts, API | Contract tests |
| ADR-021 Money representation | [contracts/money](../contracts/money.md) | domain money helpers, DB minor units | Money maths unit; API decimal strings |
| ADR-022 Versioned external contracts | [api-versioning](../contracts/api-versioning.md) | API, contracts package | OpenAPI lint in CI |
| ADR-023 Curated external events | [webhook-events](../contracts/webhook-events.md), [event-envelope](../contracts/event-envelope.md) | Webhooks | No raw internal dump to merchants |
| ADR-030 Merchant webhook contract | [webhooks](../integrations/webhooks.md), [webhook-signing](../contracts/webhook-signing.md), SEQ-INT-003/004 | notification-worker; ProjectMerchantWebhook; DeliverMerchantWebhook | Platform G0/G1; OD-031 resolved |
| ADR-031 Consumer notification policy | [consumer-notification-contact](../notifications/consumer-notification-contact.md), [notification-templates](../contracts/notification-templates.md), SEQ-NOT-001…004 | notification-worker; Notifications; EmailProvider | Platform G2; OD-005 core resolved; OD-035 blocks prod email |
| ADR-032 Platform admin read-only control plane | [admin-access](../security/admin-access.md), [admin-read-only-control-plane](../design/security/admin-read-only-control-plane.md), SEQ-SEC-005 | Identity (PlatformAdminGrant); Admin Control Plane BFF | Platform H0 PASS; OD-024 provider blocks prod admin; H1 grant slice — ADR-033 |
| ADR-033 Privileged admin grant management | [admin-access](../security/admin-access.md), [admin-grant-dual-control](../design/security/admin-grant-dual-control.md), SEQ-SEC-006; [authorisation](../security/authorisation.md), [audit](../security/audit.md) | Identity (PlatformAdminGrant lifecycle); PrivilegedActionRequest/Approval; Admin BFF | H1 gate PASS; platform H1 not started; FUN-ADM-005/006; NFR-SEC-009/010; ADM-PRIV/DUAL/GRANT tests |
| ADR-024 Recovery ordering / exhaustion | [payment-method-selection](../payments/payment-method-selection.md), [retry-policy](../payments/retry-policy.md), SEQ-PAY-004/005/006 | Payment Orchestrator, Decline Classification, Reliability Engine, Retry Service (D5 timing) | D4 decision table; E2E-PAY-002/003/004; no blind UNKNOWN retry |
| ADR-025 Retry timing / budget / cutoff | [retry-policy](../payments/retry-policy.md), [due-dates](../contracts/due-dates.md), SEQ-PAY-005/006/007 | Retry Service, DurableScheduler, Orchestrator due/cutoff/Retry Now | D5; E2E-PAY-003/004/005; OD-001/002/006 resolved |
| ADR-026 Collection CoA / posting template | [ledger-model](../money/ledger-model.md), SEQ-MONEY-001, SEQ-OPS-002 | Ledger consumer; ConfirmLedgerPosting | Unblocks platform E1; FIN-INV-02/03 mapping |
| ADR-027 Settlement obligation / eligibility | [settlement-state-machine](../money/settlement-state-machine.md), SEQ-MONEY-002, STATE-MONEY-001 | settlement-worker; CreateSettlement; EvaluateSettlementEligibility | Platform F0 + Phase F exit; FIN-INV-04/08 local Fake |
| ADR-028 Settlement execution / destination / instruction | [settlement-idempotency](../money/settlement-idempotency.md), SEQ-MONEY-002/005, STATE-MONEY-001 | settlement-worker; Create/ExecuteSettlementInstruction; FakeSettlementProvider | Platform F1 + Phase F exit; FIN-INV-05 local Fake (≠ real bank) |
| ADR-029 Settlement finality / payout CoA | [reconciliation](../money/reconciliation.md), [ledger-model](../money/ledger-model.md), SEQ-MONEY-003/005, STATE-MONEY-001 | settlement-worker; ReconcileSettlement; append settlement-payout journal | Platform F2 + Phase F exit; FIN-INV-05/06/03/09/10 local Fake |

Cross-cutting: [financial-invariant-tests](financial-invariant-tests.md), [mvp-acceptance-criteria](mvp-acceptance-criteria.md), [build-phases](build-phases.md).

## Gaps / notes

| Item | Status |
| --- | --- |
| All ADR-001–033 | Covered above — no missing ADR rows |
| Phase A platform foundation | Recorded — [phase-a-status](phase-a-status.md). Not product implementation. |
| Phase B merchant/consumer core | Recorded — [phase-b-status](phase-b-status.md). No money movement; payment/ledger/settlement not implemented. |
| Phase C bill ingestion | Recorded — [phase-c-status](phase-c-status.md). No money movement; payment attempts/PSP/ledger/settlement not implemented. |
| Phase D payment reliability | Recorded — [phase-d-status](phase-d-status.md). FakePSP collection; real PSP still open. |
| Phase E ledger (E0–E1) | Collection journal ADR-026 locally evidenced; not bank-cash verified. |
| Phase F settlement (F0–F2) | Recorded — [phase-f-status](phase-f-status.md). Local Fake settlement; OD-009 / fees / batch / poll / retry / bank-cash remain open. |
| Phase G notifications & webhooks (G0–G2) | Recorded — [phase-g-status](phase-g-status.md). Local webhook sink + Fake email; OD-025/OD-035/OD-034 open; G3+ deferred. |
| Phase H H0 admin gate | [phase-h0-admin-decision-gate](phase-h0-admin-decision-gate.md) **PASS** — ADR-032; platform H0 **PASS** |
| Phase H H1 admin gate | [phase-h1-admin-decision-gate](phase-h1-admin-decision-gate.md) **PASS** — ADR-033 Option A (grant management only); platform H1 **not started**; canonical Phase H still **not complete** |
| Automated product tests | Specs in this repo; product suites in `sparelane-platform`. FIN-INV local Fake evidence ≠ `product_verified` real rails. |
| Wallet licensing | Open decision — blocks wallet go-live only; ADR path TBD if custody model changes architecture |
| Vendor adapters | Interfaces specified; concrete PSP/bank adapters await open decisions |
| Numeric product knobs (retry windows, rate limits) | Config/open decisions — not ADR gaps |

No Accepted ADR currently lacks a design doc, implementation module, or verification target.

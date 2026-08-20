# Architecture Traceability Matrix

Maps Accepted ADRs → design docs → implementation modules → verification.

**Complementary artefacts:**

- Requirement-centric traceability is generated from requirement markdown frontmatter in the portal (`/requirements/traceability`). Prefer updating requirement metadata for behaviour↔view↔test links; keep this document focused on **ADR → module → verification**.
- Platform **foundation** evidence for Phase A is recorded in [phase-a-status](phase-a-status.md) and [implementation-status](implementation-status.md). Path references point at `sparelane-platform`; this repo does not copy those tests.
- Platform **Phase B** merchant/consumer core evidence is recorded in [phase-b-status](phase-b-status.md). Phase B does not move money.

Distinguish:

Architecture decision → Requirement → Design → Implementation phase → Implementation evidence → Test evidence

| Layer | Phase A example | Phase B example |
| --- | --- | --- |
| Architecture decision | ADR-016 / ADR-017 (outbox + at-least-once) | ADR-014 (tenant isolation); ADR-001/010 (PCI token refs) |
| Requirement | NFR-REL-001 (`status: accepted`) | FUN-CON-003 (`status: accepted`; partial implementation) |
| Design | Outbox blueprint, async processing | PCI boundary, tenant isolation, connection security |
| Implementation phase | A5 / A9 | B3 / B4 / B6 |
| Implementation evidence | Foundation outbox + idempotent consumer | Explicit connection + token refs; no payment execution |
| Test evidence | FIN-INV-09 remains `specified`; foundation prerequisite | SEC-TEN-001 local product isolation evidence; not `product_verified` |

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
| ADR-007 Merchant billing SoR | [merchant-api](../integrations/merchant-api.md), [merchant-onboarding](../integrations/merchant-onboarding.md) | Bills, Merchant Integrations | Merchant submits bill; Sparelane ≠ billing SoR |
| ADR-008 Idempotent Merchant API | [merchant-api](../integrations/merchant-api.md), OpenAPI | Bills, API layer | Duplicate bill submission e2e |
| ADR-009 Signed at-least-once webhooks | [webhooks](../integrations/webhooks.md), [webhook-security](../security/webhook-security.md) | Webhooks | Webhook retry e2e; signature security |
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

Cross-cutting: [financial-invariant-tests](financial-invariant-tests.md), [mvp-acceptance-criteria](mvp-acceptance-criteria.md), [build-phases](build-phases.md).

## Gaps / notes

| Item | Status |
| --- | --- |
| All ADR-001–023 | Covered above — no missing ADR rows |
| Phase A platform foundation | Recorded — [phase-a-status](phase-a-status.md). Not product implementation. |
| Phase B merchant/consumer core | Recorded — [phase-b-status](phase-b-status.md). No money movement; payment/ledger/settlement not implemented. |
| Automated product tests | Specs in this repo; product suites in `sparelane-platform`. FIN-INV not verified. |
| Wallet licensing | Open decision — blocks wallet go-live only; ADR path TBD if custody model changes architecture |
| Vendor adapters | Interfaces specified; concrete PSP/bank adapters await open decisions |
| Numeric product knobs (retry windows, rate limits) | Config/open decisions — not ADR gaps |

No Accepted ADR currently lacks a design doc, implementation module, or verification target.

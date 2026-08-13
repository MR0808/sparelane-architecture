# Architecture Decision Register

Quick-reference governance index for ADR-001 through ADR-023.

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

## Complementary pairs (not duplicates)

| Pair | Distinction |
| --- | --- |
| ADR-001 / ADR-010 | Tokenisation product choice vs explicit PCI trust/scope boundary |
| ADR-004 / ADR-013 | Ledger as financial SoT vs separation from operational workflow stores |
| ADR-009 / ADR-023 | Delivery semantics/security vs curation of external event contract |
| ADR-013 / ADR-016 | Logical separation vs consistency mechanism between the stores |

## None superseded or rejected

No ADRs in 001–023 are Superseded or Rejected at this gate.

# Architecture Decision Records

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-13  
**Related ADRs:** ADR-001–027  
**Related Views:** —

## Accepted vs open

| Kind | Meaning | Where |
| --- | --- | --- |
| **Accepted ADRs** | Binding design constraints for implementation | [Decision register](decision-register.md) + ADR files below |
| **Open decisions** | Unresolved product/vendor/regulatory/infra items — **not** ADRs | [Open decisions](open-decisions.md) |

Do not treat open decisions as Accepted architecture. Do not implement against a Proposed ADR as if Accepted.

## Process

- [ADR template](ADR-TEMPLATE.md)
- Status lifecycle: Proposed → Accepted → Superseded (or Rejected)
- Architecture change: [governance/architecture-change-process.md](../governance/architecture-change-process.md)

## Indexes

- [Decision register](decision-register.md) — ADR-001–027 status and consequences
- [Open decisions](open-decisions.md) — TBDs with blocker summary
- [Architecture traceability](../implementation/architecture-traceability.md) — ADR → docs → modules → tests

## ADR list (all Accepted)

| ADR | Title | Status |
| --- | --- | --- |
| [ADR-001](./ADR-001-psp-tokenisation.md) | PSP Tokenisation Instead of Raw Card Storage | Accepted |
| [ADR-002](./ADR-002-payment-orchestrator.md) | Dedicated Payment Orchestrator | Accepted |
| [ADR-003](./ADR-003-payment-workflow-vs-attempt.md) | Separate Payment Workflow from Payment Attempt | Accepted |
| [ADR-004](./ADR-004-double-entry-ledger.md) | Double-entry Ledger | Accepted |
| [ADR-005](./ADR-005-collection-before-settlement.md) | Collection Before Settlement | Accepted |
| [ADR-006](./ADR-006-separate-settlement-lifecycle.md) | Separate Settlement Lifecycle | Accepted |
| [ADR-007](./ADR-007-merchant-billing-system-of-record.md) | Merchant Remains Billing System of Record | Accepted |
| [ADR-008](./ADR-008-idempotent-merchant-api.md) | Idempotent Merchant API Mutations | Accepted |
| [ADR-009](./ADR-009-signed-at-least-once-webhooks.md) | Signed At-Least-Once Webhooks | Accepted |
| [ADR-010](./ADR-010-pci-boundary.md) | Raw Card Data Remains Outside Sparelane | Accepted |
| [ADR-011](./ADR-011-centralised-secrets-management.md) | Centralised Secrets Management | Accepted |
| [ADR-012](./ADR-012-privileged-admin-audit.md) | Privileged Admin Actions Are Auditable | Accepted |
| [ADR-013](./ADR-013-ledger-operational-separation.md) | Financial Ledger Independent of Operational Workflow Data | Accepted |
| [ADR-014](./ADR-014-merchant-tenant-isolation.md) | Merchant Tenant Isolation Is Mandatory | Accepted |
| [ADR-015](./ADR-015-analytics-not-source-of-truth.md) | Derived Analytics Is Not Transactional Source of Truth | Accepted |
| [ADR-016](./ADR-016-operational-ledger-consistency.md) | Operational ↔ Ledger Consistency via Transactional Outbox | Accepted |
| [ADR-017](./ADR-017-at-least-once-async-processing.md) | At-Least-Once Async Processing | Accepted |
| [ADR-018](./ADR-018-logical-vs-physical-services.md) | Logical Services May Share Deployables | Accepted |
| [ADR-019](./ADR-019-financial-workload-isolation.md) | Financial Workloads Isolated from Non-Critical Workloads | Accepted |
| [ADR-020](./ADR-020-opaque-public-identifiers.md) | Opaque Public Identifiers | Accepted |
| [ADR-021](./ADR-021-money-representation.md) | Decimal-Safe Monetary Representation | Accepted |
| [ADR-022](./ADR-022-versioned-external-contracts.md) | Versioned External Contracts | Accepted |
| [ADR-023](./ADR-023-curated-external-events.md) | External Events Are Curated Contracts | Accepted |
| [ADR-024](./ADR-024-payment-recovery-ordering-and-exhaustion.md) | Payment Recovery Ordering and Exhaustion Policy | Accepted |
| [ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md) | Payment Retry Timing, Budget and Recovery Window | Accepted |
| [ADR-026](./ADR-026-collection-ledger-posting-minimal-coa.md) | Collection Ledger Posting and Minimal Chart of Accounts | Accepted |
| [ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md) | Settlement Obligation, Eligibility and Cardinality Policy | Accepted |

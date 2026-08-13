# Open Decisions

Unresolved items that are **not** Accepted ADRs. Organised separately from vendor-neutral architecture decisions.

**Source of truth:** individual files under [`docs/decisions/open/`](./open/). This index is a catalogue only — do not duplicate decision substance here.

Stable IDs (`OD-###`) are never renumbered after assignment.

Implementation phase detail: [`docs/implementation/build-phases.md`](../implementation/build-phases.md).

Portal: `/decisions` and `/decisions/open/:id`.

---

## Catalogue

### product

| ID | Decision | Blocking stage | Status |
| --- | --- | --- | --- |
| [OD-001](./open/OD-001-retry-timing.md) | Exact retry timing, windows, maxima, quiet hours | development | open |
| [OD-002](./open/OD-002-due-date-local-clock.md) | Exact due-date local capture clock time | pilot | open |
| [OD-003](./open/OD-003-backup-cardinality.md) | Payment-method backup cardinality / wallet ordering | development | open |
| [OD-004](./open/OD-004-wallet-product-rules.md) | Wallet product rules (enablement, funding, spend) | wallet-only | open |
| [OD-005](./open/OD-005-notification-rules.md) | Consumer notification rules and copy | non-blocking | open |
| [OD-006](./open/OD-006-timezone-change-policy.md) | Merchant timezone change handling policy | pilot | open |
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
6. OD-002 Due-date local clock + OD-006 timezone-change policy

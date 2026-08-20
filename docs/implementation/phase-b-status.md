# Phase B — Merchant + Consumer Core

**Status:** Current  
**Owner:** Engineering / Architecture  
**Last Reviewed:** 2026-08-20  
**Related ADRs:** ADR-001, ADR-007, ADR-010, ADR-012, ADR-014, ADR-020  
**Related Views:** `02 Experience / experienceApi`, `05 Integrations / merchantIntegration`, `06 Security / pciBoundaryView`

## Status

**PASS WITH DOCUMENTED NON-BLOCKING RISKS**

Recorded from `sparelane-platform` Phase B exit evidence (B0–B6). This is **merchant + consumer core** implementation status, not MVP product acceptance and **not** payment execution.

## Purpose

Phase B implements the merchant/consumer core required before bill ingestion and payment workflow implementation.

**Phase B does NOT move money.**

Phase B does **NOT** implement:

- bills or bill ingestion
- payment workflow execution or payment attempts
- Reliability Engine runtime selection
- pre-authorisation or PSP payment execution
- ledger posting or wallet financial behaviour
- settlement or reconciliation
- merchant external webhooks (signed product delivery)
- production IdP or production PSP
- machine Merchant API credential verification (unless separately implemented)
- Retry Now, bill presentation, or payment UI

## B0–B6 summary (engineering decomposition)

These are **platform engineering sub-phases** decomposing canonical Phase B. They are **not** canonical architecture phases.

| Phase | Purpose | Implementation evidence (platform) | Status |
| --- | --- | --- | --- |
| B0 | Identity Composition | `docs/development/identity.md`; external `(issuer, subject)`; no email linking; fake auth excluded from production | PASS |
| B1 | Merchant Domain & Onboarding Foundation | `docs/development/merchant-domain.md`, `merchant-onboarding.md`; merchant create + creator membership; DRAFT initial status | PASS |
| B2 | Consumer Domain & Profile Foundation | `docs/development/consumer-domain.md`, `consumer-profile.md`; explicit consumer creation; profile isolation | PASS |
| B3 | Merchant ↔ Consumer Connections | `docs/development/merchant-consumer-connections.md`, `connection-security.md`; explicit consent; ACTIVE/REVOKED lifecycle | PASS |
| B4 | Payment Method References & Priority | `docs/development/payment-methods.md`, `payment-method-priority.md`, `pci-payment-method-boundary.md`; token refs only; deterministic ordering | PASS |
| B5 | Merchant / Consumer Portal Foundations | `docs/development/portal-foundation.md`, `merchant-portal.md`, `consumer-portal.md`; `/portal/v1` separate from machine `/v1` | PASS |
| B6 | Phase B Integration & Exit Gate | `docs/development/phase-b-exit-gate.md`; `tests/e2e/phase-b/`; `tests/architecture/phase-b-contracts.test.ts` | PASS |

Canonical Phase B remains [build-phases](build-phases.md) — **Merchant + Consumer Core**.

## B6 integration proof (no money movement)

B6 demonstrated this real **no-money-movement** journey (not a payment E2E):

External identity → Sparelane User → Merchant creation + creator membership → explicit Consumer creation → **no** implicit `MerchantConnection` → explicit authenticated Consumer consent → **ACTIVE** `MerchantConnection` → Consumer-owned tokenised `PaymentMethod` references → deterministic primary / backup ordering → Merchant and Consumer portal views → cross-tenant / security / privacy constraints enforced.

Also proven:

- Same User may hold merchant + consumer capabilities **without** implying connection
- Connection does **not** grant payment-method authority to Merchant
- Cross-merchant connection access denied (404 convention)
- Cross-consumer access denied
- Provider token not returned on reads / portal UI
- PAN/CVV rejected; not persisted, logged, audited, or outboxed
- Audit/outbox payloads remain safe (no token/PII)
- Migration history works from zero
- Production builds and smoke pass
- Fake auth / provider paths excluded from production
- External Merchant `/v1` contract remains separate (stub/unimplemented where credentials deferred)

Platform evidence: `sparelane-platform/tests/e2e/phase-b/`, `sparelane-platform/docs/development/phase-b-traceability.md`.

## Defects discovered and fixed in B6

B6 found and fixed two real defects (implementation evidence — not new architecture behaviour):

1. **Public merchant IDs vs membership lookup** — Public merchant IDs (`mrc_*`) no longer pass incorrectly into UUID membership lookup (500s). Lookup resolves public ID when the value is not a UUID.
2. **URL/header context ≠ authority** — A `merchant_user` context cannot read another merchant through URL/header selection even when the same User also holds membership in that second merchant. **Persisted membership + selected validated context = authority.**

B6 validated: URL/header context selection is **not** authority.

## Same User dual-role rule

A single User may legitimately have both:

- `merchant_user` capability (via merchant membership), and
- `consumer` capability (via Consumer profile)

This does **NOT** imply:

- `MerchantConnection`
- shared payment methods
- merchant authority over consumer data
- consumer authority over merchant data

Connection must still be **explicit** and consented.

## Connection authority rule

`MerchantConnection` establishes **relationship only**.

It does **NOT** grant Merchant authority to:

- list Consumer payment methods
- retrieve provider tokens
- reorder or remove payment methods
- directly CRUD Consumer profile

## Capabilities implemented or partial (Phase B)

| Area | Phase B status |
| --- | --- |
| Merchant core (tenant, membership, onboarding foundation) | Partial — no KYB, API credentials, webhooks |
| Consumer core (profile, portal auth composition) | Partial — no production IdP; Retry Now absent |
| Merchant ↔ Consumer connection | Partial — no bill presentation |
| Payment-method **references** (Consumer-owned) | Partial — fake PSP validate; no hosted card entry |
| Priority **configuration** (primary/backups) | Partial — Reliability Engine not invoked; OD-003 open |
| Portal foundations (merchant + consumer HTTP) | Implemented for Phase B scope |
| Tenant isolation / PCI boundary slice | Local product evidence (see requirements) |

## Explicitly NOT implemented

- Bill ingestion (`CreateBill`, idempotency, workflows)
- Payment execution, attempts, Reliability Engine runtime
- Ledger, settlement, reconciliation (product)
- Financial retries, merchant signed webhooks
- Production IdP, production PSP, hosted tokenisation UI
- Machine Merchant API credential verification (SEC-AUTH-001 scope)
- MVP acceptance — see [mvp-acceptance-criteria](mvp-acceptance-criteria.md)

Do **not** infer “payment method stored” means “payments implemented”.

## PCI / payment-method status

**Implemented (Phase B evidence):**

- Consumer-owned `PaymentMethod`
- Provider token/reference storage; safe display metadata only
- Deterministic priority configuration (first add → primary; later append)
- No provider token in portal/API reads
- Static PCI guards; PAN/CVV rejected on application contracts

**Not implemented:**

- Browser hosted fields / secure PSP card-entry integration
- Real tokenisation session
- PSP execution, preauthorisation, charging, capture

PCI scope is **not** finalised (OD-013 remains open).

## Architecture drift / clarifications

From platform `phase-b-architecture-drift.md`. **Clarifications only** — no silent architecture mutation.

| Topic | Implementation | Classification |
| --- | --- | --- |
| A. `linked_user` principal | Authenticated linked User before Consumer/Merchant profile resolution | Implementation convention; architecture clarification recommended |
| B. `merchant_admin` | Creator membership role string | Architecture creator-role naming not fully explicit |
| C. Merchant initial `DRAFT` | Create starts DRAFT; not financially/live approved | Clarification — DRAFT ≠ live approval |
| D. Reconnect after `REVOKED` | Unique `(merchant, consumer)` rejects reconnect | Stricter than possible future reconnect model; product/schema clarification |
| E. Default payment-method priority | First method primary; later methods append | Implementation convention; Reliability Engine owns runtime selection |
| F. Provider token uniqueness | DB globally unique `(provider, providerTokenRef)` | May be stricter than consumer-scoped-only readings |
| G. `Consumer.userId` | App enforces one Consumer per User; DB indexed not unique | Schema integrity clarification/risk |

No Accepted ADR contradiction identified.

## Non-blocking risks

| Risk | Blocks local | Blocks sandbox | Blocks pilot | Blocks production |
| --- | --- | --- | --- | --- |
| A. Prisma CLI `deepmerge-ts` advisory | No | No | No | Monitor upstream |
| B. Production IdP (OD-023) | No — fake/dev auth | Partial | Partial | Yes |
| C. Production PSP / hosted fields (OD-008) | No — token refs + fake PSP | Partial for live cards | Yes | Yes |
| D. Connection reconnect semantics | No | No | Soft | Soft — product may need status-scoped uniqueness |
| E. Consumer one-to-one (`userId` not DB-unique) | No | No | Soft | Soft — concurrent insert race theoretically possible |
| F. Global provider-token uniqueness | No | No | Soft | Soft — may differ from final model |
| G. `merchant_admin` + initial `DRAFT` conventions | No | No | Soft | Soft — formalise in architecture |

## Next phase

[Phase C — Bill Ingestion](build-phases.md) is **NOT STARTED**. Delivers: Merchant API (`CreateBill`), idempotency, bills, 1:1 workflow creation, outbox write path. Depends on Phase B.

## Platform evidence (do not copy)

- `sparelane-platform/docs/development/phase-b-exit-gate.md`
- `sparelane-platform/docs/development/phase-b-traceability.md`
- `sparelane-platform/docs/development/phase-b-requirements.md`
- `sparelane-platform/docs/development/phase-b-open-decisions.md`
- `sparelane-platform/docs/development/phase-b-architecture-drift.md`
- `sparelane-platform/tests/e2e/phase-b/`

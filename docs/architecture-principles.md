# Sparelane Architecture Principles

These principles govern Sparelane solution architecture decisions. They should be reflected in the LikeC4 model, dynamic flows and future ADRs.

## AP-01 — Merchant remains billing system of record

**Principle:** Merchants retain ownership of customer billing, invoices, subscriptions, merchant customer accounts and core finance records.

**Rationale:** Sparelane improves payment reliability; it does not replace merchant billing platforms.

**Architectural consequence:** Sparelane stores only the orchestration and reconciliation data required for payment reliability. Merchant Environment remains an explicit external system boundary.

**Related ADR:** [ADR-007](./decisions/ADR-007-merchant-billing-system-of-record.md)

## AP-02 — Sparelane orchestrates payment reliability

**Principle:** Sparelane's core differentiator is the Payment Reliability Engine, not commodity payment gateway behaviour.

**Rationale:** Value comes from method selection, pre-authorisation, fallback, retry and recovery across payment rails.

**Architectural consequence:** Payment orchestration, attempts, retries and decline classification remain distinct responsibilities inside the Payment Reliability Engine.

## AP-03 — No raw card storage

**Principle:** Sparelane must not store raw PAN or CVV.

**Rationale:** Minimises PCI scope and reduces the blast radius of a security incident.

**Architectural consequence:** Payment Method Service stores provider token references and non-sensitive metadata only.

**Related ADRs:** [ADR-001](./decisions/ADR-001-psp-tokenisation.md), [ADR-010](./decisions/ADR-010-pci-boundary.md)

## AP-04 — Tokenisation delegated to PCI-compliant provider

**Principle:** Sensitive card capture and tokenisation remain inside the selected PCI-compliant Payment Service Provider boundary.

**Rationale:** Card entry and cryptographic card data handling belong with a specialised, audited provider.

**Architectural consequence:** The architecture models a PCI Boundary and Card Tokenisation capability on the external PSP, not inside Sparelane.

**Related ADRs:** [ADR-001](./decisions/ADR-001-psp-tokenisation.md), [ADR-010](./decisions/ADR-010-pci-boundary.md)

## AP-05 — Financial movements are ledgered

**Principle:** Movements of funds are recorded in an append-only balanced financial ledger.

**Rationale:** Settlement, wallet balances and reconciliation require an auditable financial record independent of operational workflow state.

**Architectural consequence:** Funds & Ledger and the Financial Ledger Database are first-class domains, separate from payment orchestration.

**Related ADRs:** [ADR-004](./decisions/ADR-004-double-entry-ledger.md), [ADR-013](./decisions/ADR-013-ledger-operational-separation.md)

## AP-06 — Merchant settlement follows successful collection

**Principle:** A merchant payment must not be treated as settled until the required consumer funds have actually been collected.

**Rationale:** Settling before collection creates cash and reconciliation risk for Sparelane and merchants.

**Architectural consequence:** Settlement & Reconciliation is triggered after successful collection and ledger update, not on bill creation or payment attempt alone.

**Related ADRs:** [ADR-005](./decisions/ADR-005-collection-before-settlement.md), [ADR-006](./decisions/ADR-006-separate-settlement-lifecycle.md), [ADR-016](./decisions/ADR-016-operational-ledger-consistency.md)

## AP-07 — Payment processing must be idempotent

**Principle:** Bill ingestion and payment processing must tolerate duplicate requests and provider callbacks safely.

**Rationale:** Networks, webhooks and retries create duplicate events in real payment systems.

**Architectural consequence:** Bill Validation enforces idempotency; Payment Attempt history and payment state transitions support safe replay of provider results.

**Related ADRs:** [ADR-008](./decisions/ADR-008-idempotent-merchant-api.md), [ADR-017](./decisions/ADR-017-at-least-once-async-processing.md)

## AP-08 — Asynchronous processing where appropriate

**Principle:** Payment lifecycle, retries, settlement, notifications, analytics and merchant webhooks may use asynchronous domain events.

**Rationale:** These workflows benefit from durability, decoupling and controlled retry without blocking synchronous APIs.

**Architectural consequence:** An Event Platform with transactional outbox support is part of the architecture, while sync APIs remain for merchant and experience operations.

## AP-09 — Operational state is not fully event sourced

**Principle:** Transactional databases remain systems of record for operational state. Event-driven processing does not imply full event sourcing.

**Rationale:** Billing orchestration and merchant integrations need current-state queries and strong consistency for operational entities.

**Architectural consequence:** Operational Database, Ledger Database and Audit Store are modelled explicitly; the event bus coordinates workflows rather than replacing state storage.

## AP-10 — Architecture separates logical responsibility from deployment topology

**Principle:** Logical domains are defined independently from hosting and vendor choices.

**Rationale:** PSP, banking partner, cloud provider and event broker decisions are still open and must not distort the logical architecture.

**Architectural consequence:** Deployment views remain proposed/generic. Vendor-specific choices require ADRs when selected.

## AP-11 — Distinct authentication surfaces

**Principle:** Consumer, merchant user, merchant machine and administrator authentication are distinct security surfaces.

**Rationale:** Portal sessions, API credentials and privileged admin access have different abuse modes and assurance requirements.

**Architectural consequence:** Identity & Access models separate interactive and machine authentication; admin requires MFA and stronger session controls.

## AP-12 — Secrets stay out of source control

**Principle:** Production secrets are managed through a central secrets capability, never committed to source control or logged in plaintext.

**Rationale:** Credential leakage is a primary path to fraudulent bills, spoofed webhooks and data exposure.

**Architectural consequence:** Secrets Management is modelled explicitly; Merchant API Key Management stores hashes/references only after issuance.

## AP-13 — Privileged actions are auditable

**Principle:** Privileged administrative and financially sensitive actions produce durable audit events without logging secrets or raw payment credentials.

**Rationale:** Accountability and incident response require structured audit independent of ephemeral application logs.

**Architectural consequence:** Audit Service and Audit Store are first-class; admin UI must not mutate the ledger directly.

## AP-14 — Operational and ledger data are logically separate

**Principle:** Payment workflow operational state and authoritative financial journal data remain logically separated stores of truth.

**Rationale:** Different invariants (state machines vs balanced append-only journals) and reconciliation needs.

**Architectural consequence:** Operational Database and Financial Ledger Database are distinct; consistency uses transactional outbox + idempotent ledger posting ([ADR-016](./decisions/ADR-016-operational-ledger-consistency.md)). Settlement eligibility requires posting confirmation.

**Related ADRs:** [ADR-013](./decisions/ADR-013-ledger-operational-separation.md), [ADR-016](./decisions/ADR-016-operational-ledger-consistency.md)

## AP-15 — Analytics is derived, not authoritative

**Principle:** Analytics and reporting stores are rebuildable derived systems and must not become transactional sources of truth.

**Rationale:** Payment correctness must not depend on analytics availability; reporting may lag.

**Architectural consequence:** Analytics Store feeds Merchant Reporting and future Reliability Intelligence only as derived inputs.

**Related ADR:** [ADR-015](./decisions/ADR-015-analytics-not-source-of-truth.md)

## AP-16 — Async work is at-least-once and idempotent

**Principle:** Internal asynchronous processing assumes at-least-once delivery; consumers must be idempotent.

**Rationale:** Exactly-once across workers, databases and external providers is not a reliable sole control.

**Architectural consequence:** Outbox, Event Bus, workers and DLQ replay are designed around idempotency and authoritative state checks.

**Related ADR:** [ADR-017](./decisions/ADR-017-at-least-once-async-processing.md)

## AP-17 — Financial workloads are isolated from non-critical work

**Principle:** Payment, ledger and settlement processing are operationally isolated from analytics and bulk reporting.

**Rationale:** Non-critical backlog must not threaten financial correctness.

**Architectural consequence:** Separate worker pools/queues/limits as needed; shed Tier-3 work first under pressure.

**Related ADR:** [ADR-019](./decisions/ADR-019-financial-workload-isolation.md)

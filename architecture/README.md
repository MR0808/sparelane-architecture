# Sparelane LikeC4 Architecture Pack

This folder contains the proposed target architecture for Sparelane.

## Files

- `specification.c4` - shared element, relationship, deployment types and lifecycle tags
- `people.c4` - consumers, merchant users, merchant developers and Sparelane admins
- `externals.c4` - merchant systems and external providers
- `platform.c4` - experience, APIs, identity, consumer, merchant, billing, events, data and operations
- `payments.c4` - payment reliability engine plus wallet and ledger
- `settlement.c4` - settlement and reconciliation domain
- `risk.c4` - risk, fraud, KYC/KYB, audit and PCI boundary
- `relationships.c4` - logical relationships between all elements
- `views.c4` - architecture and dynamic workflow views
- `deployment.c4` - production deployment model

See the repository root [`README.md`](../README.md) for portal navigation, local development and governance.

## Suggested repo layout

```text
architecture/
  likec4/
    specification.c4
    people.c4
    externals.c4
    platform.c4
    payments.c4
    settlement.c4
    risk.c4
    relationships.c4
    views.c4
    deployment.c4
```

## Architecture principles captured

1. Merchant billing systems remain merchant systems of record.
2. Sparelane is the payment reliability and orchestration layer.
3. Raw PAN/CVV remains inside the PCI-compliant payment-provider boundary.
4. Sparelane stores token references only.
5. Payment orchestration, financial ledger and merchant settlement are distinct concerns.
6. Merchants are settled only after consumer funds have been collected.
7. PostgreSQL is the transactional source of truth; events coordinate asynchronous work.
8. The transactional outbox pattern is used for reliable event publication.
9. PayTo is modelled as a future payment rail, not an MVP dependency.
10. Payment guarantees, lending and BNPL are outside the MVP architecture.
11. Merchant API mutations with financial consequences support idempotent retries.
12. Merchant webhooks are signed, at-least-once, with stable event IDs and merchant-side idempotency.
13. Merchant API credentials are never stored in plaintext after issuance.
14. Raw PAN/CVV remain inside the external PCI provider boundary.
15. Production secrets are managed centrally and never committed to source control.
16. Privileged admin and financially sensitive actions produce durable audit events.
17. Operational workflow data and financial ledger data are logically separated.
18. Analytics is derived and not a transactional source of truth.
19. Merchant tenant isolation is mandatory for merchant-scoped data.
20. Transactional outbox + idempotent ledger posting is the default Operational↔Ledger consistency pattern.
21. Logical services may share deployables; async processing is at-least-once with idempotent consumers.
22. Financial workloads are isolated from non-critical analytics/reporting workloads.
23. External contracts use opaque public IDs, decimal-safe money, versioned APIs and curated webhooks.

## Primary views

- 01 Overview / System Context
- 01 Overview / Architecture Map
- 01 Overview / Platform Architecture
- 02 Experience / Experience & API
- 03 Payments / Payment Reliability Engine / Core
- 03 Payments / Payment Reliability Engine / Extended Context
- 04 Money Movement / Funds & Ledger
- 04 Money Movement / Settlement & Reconciliation
- 04 Money Movement / Settlement
- 04 Money Movement / Reconciliation
- 05 Integrations / Merchant Integration
- 06 Security / Security Architecture
- 06 Security / Trust Boundaries
- 06 Security / PCI Boundary
- 06 Security / Privileged Access
- 07 Data & Events / Data Architecture
- 07 Data & Events / Domain Data
- 07 Data & Events / Data Stores
- 07 Data & Events / Data Ownership
- 07 Data & Events / Data Classification
- 07 Data & Events / Core Data Relationships
- 07 Data & Events / Event Driven Architecture
- 08 Deployment / Production Deployment
- 08 Deployment / Runtime Processing
- 08 Deployment / Resilience & Failure Isolation
- 09 Flows / Overview / Complete Recurring Payment Lifecycle
- 09 Flows / Overview / Failed Payment Recovery
- 09 Flows / Payments / Bill Ingestion
- 09 Flows / Payments / Pre-authorisation
- 09 Flows / Payments / Primary Card Success
- 09 Flows / Payments / Backup Recovery
- 09 Flows / Payments / Scheduled Retry
- 09 Flows / Payments / Complete Failure
- 09 Flows / Payments / Consumer Retry Now
- 09 Flows / Money Movement / Collection to Ledger
- 09 Flows / Money Movement / Merchant Settlement
- 09 Flows / Money Movement / Settlement Confirmation
- 09 Flows / Money Movement / Settlement Failure
- 09 Flows / Money Movement / Unknown Settlement Outcome
- 09 Flows / Money Movement / Merchant Reconciliation
- 09 Flows / Integrations / Bill Submission
- 09 Flows / Integrations / Duplicate Bill Submission
- 09 Flows / Integrations / Merchant Webhook Delivery
- 09 Flows / Integrations / Merchant Webhook Retry
- 09 Flows / Connections / Connect Consumer to Merchant
- 09 Flows / Connections / Add Tokenised Card
- 09 Flows / Security / Provider Webhook Verification
- 09 Flows / Security / Merchant API Authentication
- 09 Flows / Security / Admin Privileged Action
- 09 Flows / Data / Successful Payment Data Path
- 09 Flows / Data / Consumer Deletion
- 09 Flows / Data / Merchant Offboarding
- 09 Flows / Operations / Payment Provider Timeout
- 09 Flows / Operations / Ledger Posting Recovery
- 09 Flows / Operations / DLQ Replay
- 09 Flows / Operations / Settlement Provider Outage
- 10 Implementation / Initial Deployables
- 10 Implementation / Module Boundaries
- 10 Implementation / Bill to Settlement

## Important note

The logical model is intended to be stable. Provider and deployment choices are deliberately generic until Sparelane selects its PSP, KYC/KYB provider, banking/settlement partner, event infrastructure and production hosting model.

Physical schema and OpenAPI live under `docs/schema/`, `docs/contracts/` and `contracts/openapi.yaml` — not application code.

## LikeC4 file loading

LikeC4 automatically merges `.c4` files in one project. Domain files such as `payments.c4`, `settlement.c4` and `risk.c4` use `extend sparelane` to add nested elements to the top-level Sparelane system defined in `platform.c4`.

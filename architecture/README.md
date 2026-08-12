# Sparelane LikeC4 Architecture Pack

This folder contains the proposed target architecture for Sparelane.

## Files

- `specification.c4` - shared element, relationship and deployment types
- `people.c4` - consumers, merchant users, merchant developers and Sparelane admins
- `externals.c4` - merchant systems and external providers
- `platform.c4` - experience, APIs, identity, consumer, merchant, billing, events, data and operations
- `payments.c4` - payment reliability engine plus wallet and ledger
- `settlement.c4` - settlement and reconciliation domain
- `risk.c4` - risk, fraud, KYC/KYB, audit and PCI boundary
- `relationships.c4` - logical relationships between all elements
- `views.c4` - architecture and dynamic workflow views
- `deployment.c4` - production deployment model

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

## Primary views

- 01 / System Context
- 02 / Sparelane Platform
- 03 / Experience and API
- 04 / Payment Reliability Engine
- 05 / Settlement and Reconciliation
- 06 / Data Architecture
- 07 / Security Architecture
- 08 / Event Driven Architecture
- Complete Recurring Payment Lifecycle
- Failed Payment Recovery
- Connect Consumer to Merchant
- Add Tokenised Card
- Production Deployment

## Important note

The logical model is intended to be stable. Provider and deployment choices are deliberately generic until Sparelane selects its PSP, KYC/KYB provider, banking/settlement partner, event infrastructure and production hosting model.

## LikeC4 file loading

LikeC4 automatically merges `.c4` files in one project. Domain files such as `payments.c4`, `settlement.c4` and `risk.c4` use `extend sparelane` to add nested elements to the top-level Sparelane system defined in `platform.c4`.

# Availability Tiers

Criticality categories for operations planning. **Do not invent SLA percentages** here.

## Tier 1 — Financial correctness critical

- Payment Orchestrator / Payment Worker path
- Ledger / ledger posting
- Settlement Worker path
- Operational Database
- Financial Ledger Database
- Idempotency mechanisms
- Transactional outbox publication path

## Tier 2 — Customer / merchant operational

- Experience portals and Hosted Flow
- Merchant API / experience backends
- Provider webhook ingress
- Merchant webhook delivery
- Notifications (email/SMS)

Degradation is painful but must not corrupt financial state.

## Tier 3 — Non-critical / derived

- Analytics Store ingestion
- Merchant reporting exports
- Future Reliability Intelligence

May lag or pause without stopping payment correctness.

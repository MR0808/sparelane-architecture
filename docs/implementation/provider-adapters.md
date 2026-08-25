# Provider Adapter Strategy

Domain modules talk to **interfaces**, not vendor SDKs.

## Interfaces (minimum)

| Adapter | Domain use |
| --- | --- |
| PSP | Tokenisation result ingest, authorise/capture/void, webhook verify |
| Settlement Partner | Submit instruction, lookup status, reconcile finality, webhook verify ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md), [ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)) |
| KYC/KYB | Start/verify business verification |
| Email | Send transactional email ([ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md)) |
| SMS | Send transactional SMS — **G3+** |
| Identity (where relevant) | OAuth/OIDC/passkey verification |

## Rules

- Adapters map vendor statuses → Sparelane decline classifications / settlement outcomes
- Adapters never store PAN/CVV in Sparelane
- Settlement adapter submit outcomes: `accepted` \| `rejected` \| `technical_error` \| `unknown_outcome` (ADR-028); never map ack → SETTLED
- Settlement adapter finality outcomes: `pending` \| `settled` \| `failed` \| `not_found` \| `unknown` (ADR-029); reconcile/lookup must not call submit
- Adapter failures classified as transient vs permanent vs unknown outcome
- Fakes/stubs required for local/CI before vendor selection; production fail-closed without approved settlement provider (OD-009)
- **Funds-flow / money rails ([ADR-037](../decisions/ADR-037-collection-funds-flow-merchant-of-record.md) / [ADR-038](../decisions/ADR-038-mvp-payment-service-provider-selection.md) / [ADR-039](../decisions/ADR-039-mvp-settlement-provider-selection.md)):** MVP PSP = Stripe Connect **direct charges**; SettlementProvider = Stripe Connect **manual payouts**; `fees_collector=application`; live adapters use `acct_…` / `ba_…` / `po_…`; Sparelane never MoR / never custodies merchant funds
- Email: FakeEmailProvider `nonProductionOnly` for G2 local; production fail-closed without OD-035 approved provider
- Settlement submit uses stable idempotency key `settlement-instruction:{settlementPublicId}`

## Stripe adapter checklists

- Payment: [stripe-connect-adapter-checklist.md](./stripe-connect-adapter-checklist.md)
- Settlement: [stripe-connect-settlement-adapter-checklist.md](./stripe-connect-settlement-adapter-checklist.md)

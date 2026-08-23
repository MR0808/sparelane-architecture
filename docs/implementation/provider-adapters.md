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
- Email: FakeEmailProvider `nonProductionOnly` for G2 local; production fail-closed without OD-035 approved provider
- Settlement submit uses stable idempotency key `settlement-instruction:{settlementPublicId}`

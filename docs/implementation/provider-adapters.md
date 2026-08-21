# Provider Adapter Strategy

Domain modules talk to **interfaces**, not vendor SDKs.

## Interfaces (minimum)

| Adapter | Domain use |
| --- | --- |
| PSP | Tokenisation result ingest, authorise/capture/void, webhook verify |
| Settlement Partner | Submit instruction, lookup status, webhook verify ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)) |
| KYC/KYB | Start/verify business verification |
| Email | Send transactional email |
| SMS | Send transactional SMS |
| Identity (where relevant) | OAuth/OIDC/passkey verification |

## Rules

- Adapters map vendor statuses → Sparelane decline classifications / settlement outcomes
- Adapters never store PAN/CVV in Sparelane
- Settlement adapter outcomes: `accepted` \| `rejected` \| `technical_error` \| `unknown_outcome` (ADR-028); never map ack → SETTLED
- Adapter failures classified as transient vs permanent vs unknown outcome
- Fakes/stubs required for local/CI before vendor selection; production fail-closed without approved settlement provider (OD-009)
- Settlement submit uses stable idempotency key `settlement-instruction:{settlementPublicId}`

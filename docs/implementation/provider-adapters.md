# Provider Adapter Strategy

Domain modules talk to **interfaces**, not vendor SDKs.

## Interfaces (minimum)

| Adapter | Domain use |
| --- | --- |
| PSP | Tokenisation result ingest, authorise/capture/void, webhook verify |
| Settlement Partner | Submit instruction, query status, webhook verify |
| KYC/KYB | Start/verify business verification |
| Email | Send transactional email |
| SMS | Send transactional SMS |
| Identity (where relevant) | OAuth/OIDC/passkey verification |

## Rules

- Adapters map vendor statuses → Sparelane decline classifications / settlement outcomes
- Adapters never store PAN/CVV in Sparelane
- Adapter failures classified as transient vs permanent vs unknown outcome
- Fakes/stubs required for local/CI before vendor selection

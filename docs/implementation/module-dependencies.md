# Module Dependency Rules

## Allowed (high level)

```text
API/Web → Identity, Merchants, Consumers, Integrations, Bills, Payment Workflows (commands/queries)
Payment Workflows → Attempts, Reliability Engine, Payment Methods, Risk, Outbox, PSP adapter
Attempts → Payment Methods, PSP adapter
Ledger ← Outbox consumer (collection/settlement posting commands)
Settlement → Ledger (eligibility read), Settlement adapter, Outbox, Reconciliation
Webhooks → Integrations, Secrets signing
Notifications → Email/SMS adapters
Audit ← any privileged module (record only)
Analytics/Reporting → derived reads only
```

## Forbidden

| From | Must not call / mutate |
| --- | --- |
| Merchant Integrations | Payment Workflow internals; Ledger journal writes |
| Reliability Engine | Ledger writes; PSP execute; Settlement |
| Payment Orchestrator / Workflows | Settlement partner adapter directly; admin UI ledger edits |
| Settlement | Payment Attempts mutation; reverse COLLECTED because payout down |
| Webhooks (outbound) | Raw internal domain event passthrough |
| Notifications | Payment/settlement/ledger state |
| Reporting / Analytics | Any financial/operational mutation |
| Web UI | Authoritative financial writes without API |
| Any module | PAN/CVV storage; plaintext secret persistence |

## Dependency matrix (MVP)

| Module ↓ / → | Identity | Bills | Workflows | Attempts | Reliability | Methods | Ledger | Settlement | Webhooks | Notifications | Audit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bills | Q | — | C | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | C |
| Workflows | ✗ | Q | — | C | Q | Q | via outbox | ✗ direct | ✗ | C | C |
| Attempts | ✗ | ✗ | Q | — | ✗ | Q | ✗ | ✗ | ✗ | ✗ | C |
| Reliability | ✗ | ✗ | ✗ | ✗ | — | Q | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ledger | ✗ | ✗ | Q confirm | ✗ | ✗ | ✗ | — | Q | ✗ | ✗ | C |
| Settlement | ✗ | ✗ | Q | ✗ | ✗ | ✗ | Q | — | C | ✗ | C |
| Webhooks | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | C |
| Notifications | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | C |

Legend: `C` = may command, `Q` = may query, `✗` = forbidden direct dependency.

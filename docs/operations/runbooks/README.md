# Operations Runbooks

Runbooks are operator guides for production incidents. They are architecture stubs — not vendor-specific command lists.

## Structure

Each runbook includes:

1. Symptom
2. Impact
3. Checks
4. Safe actions
5. Unsafe actions
6. Escalation
7. Recovery validation

## Index

| Runbook | Focus |
| --- | --- |
| [Payment provider outage](./payment-provider-outage.md) | PSP unavailable / degraded |
| [Settlement provider outage](./settlement-provider-outage.md) | Banking/settlement partner down |
| [Ledger posting failure](./ledger-posting-failure.md) | COLLECTED without confirmed journal |
| [DLQ replay](./dlq-replay.md) | Safe replay of failed async work |
| [Webhook backlog](./webhook-backlog.md) | Merchant webhook delivery pressure |

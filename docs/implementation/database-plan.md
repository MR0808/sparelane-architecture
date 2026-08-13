# Database Implementation Plan

## Stores

| Store | Implements | MVP critical? |
| --- | --- | --- |
| Operational DB | Workflows, bills, attempts, integrations, outbox, webhooks metadata | Yes |
| Ledger DB | Accounts, journals, entries | Yes |
| Audit Store | Audit events | Yes for admin/pilot |
| Analytics Store | Derived reporting | **No** — not critical path |

Physical shared vs separate clusters: TBD ([open decisions](../decisions/open-decisions.md)); logical separation required ([ADR-013](../decisions/ADR-013-ledger-operational-separation.md)).

## Implementation order

1. Operational foundation (tenancy, identity refs, merchants, consumers)
2. Connections + payment methods
3. Bills + workflows + outbox tables
4. Attempts + provider receipts
5. Ledger accounts + journals + posting idempotency
6. Settlements + instructions
7. Webhook events/deliveries
8. Audit
9. Analytics (later)

## Migration principles

- Forward-only migrations
- Backwards-compatible deploy where possible
- Avoid destructive migrations without controlled rollout
- Financial-schema changes require extra review
- Never introduce PAN/CVV columns
- Money columns: `amount_minor` BIGINT + currency ([ADR-021](../decisions/ADR-021-money-representation.md))

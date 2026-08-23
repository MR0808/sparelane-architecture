# Dead-Letter Handling

A message may enter the Dead Letter Queue (DLQ) after bounded processing failure.

## H0 decision ([ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md))

- **No DLQ admin UI in H0**
- Platform current in-memory DLQ is **not** production operator tooling — do not expose it as durable operator inspection
- **DLQ replay deferred** — requires durable operator store + closed replay policy (who, reason, event types, financial controls, identity preservation, concurrency, audit, dual control)

## H1 decision ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md))

- **H1 does NOT include DLQ replay**
- Durable DLQ operator store + replay policy remain **deferred H2+**
- ADR-033 Option A is grant management only — do not invent replay in H1

Phase H broadly includes DLQ replay UI — that is **not** H0 or H1 Option A scope.

## Operator visibility (future — H2+)

For every DLQ item, operators must be able to determine:

- source event / message type
- aggregate / business ID (workflow, settlement, webhook event, etc.)
- failure reason
- attempt count
- correlation ID
- whether replay is safe
- current authoritative state (Operational DB / Ledger / provider)

## Critical rule

> DLQ replay must never blindly repeat a financial side effect.

Payment and settlement replay must first check idempotency keys and external/provider state. Prefer reconcile-then-continue over blind resubmit.

## Replay (H2+ policy — not H0/H1)

- authorised operators only
- durable audit of replay actions
- idempotent consumers absorb duplicates
- unsafe to replay if authoritative state already reflects success and side effect would duplicate

Webhook delivery exhaustion records FAILED in Operational DB. Worker DLQ may hold a **pointer** (delivery / `evt_` id), not a second merchant payload copy. Replay of webhook HTTP is Phase H **H2+** after a separate policy gate. See [ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md). ADR-033 explicitly defers replay.

## H2+ replay gate must decide

- who may replay
- mandatory reason
- replayable event types
- stronger controls for financial events
- original event identity preservation
- causation/correlation on replay request
- dual control requirements ([OD-026](../decisions/open/OD-026-dual-control-break-glass.md) — grants resolved by ADR-033; replay matrix still open)
- concurrency / duplicate replay safety
- audit + security signals

# Transactional Outbox

Selected logical pattern for Operational DB → Event Bus publication and collection → ledger consistency ([ADR-016](../decisions/ADR-016-operational-ledger-consistency.md)).

## Flow

```text
Operational transaction
  ├── workflow state change (e.g. COLLECTED)
  └── outbox row (same commit)
        ↓
Outbox Processor
        ↓
Event Bus (at-least-once)
        ↓
Idempotent consumer (e.g. ledger posting)
```

## Properties

- atomic write of state + outbox in Operational DB
- polling or CDC to publish — **implementation TBD**
- duplicate event publication possible → consumers must be idempotent
- published marker / outbox status handled safely (at-least-once publish)
- outbox cleanup / retention **TBD**

## Collection invariant

Payment Workflow may briefly be `COLLECTED` before ledger posting completes.

The system must:

- track/recover pending financial posting
- ensure exactly one journal posting per successful collection (idempotent by collection/workflow reference)
- **not** make settlement eligible until ledger posting is confirmed

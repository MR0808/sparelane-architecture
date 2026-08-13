# Event Data Model

Three event concepts remain distinct.

## Internal Domain Event

Used for internal asynchronous coordination (payment, settlement, notification, analytics ingestion).

Conceptual fields:

- event ID
- event type
- aggregate / business reference
- timestamp
- correlation ID
- causation ID where appropriate
- payload version

Operational databases remain systems of record; domain events coordinate work (not full event sourcing).

## External Merchant Webhook Event

Curated external contract delivered to merchants.

**Not** a direct copy of internal domain events.

Stronger backwards-compatibility expectations than internal events.

## Audit Event

Security/administrative record in the Audit Store.

Separate from domain events and merchant webhooks.

---

## Event versioning

- event schemas evolve over time
- consumers must tolerate compatible evolution
- breaking changes require versioning / migration
- persisted events need an interpretable historical representation
- external webhooks require stronger backwards-compatibility guarantees than internal events

Schema registry technology is **TBD** — do not invent one here.

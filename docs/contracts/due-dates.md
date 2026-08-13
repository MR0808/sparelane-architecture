# Due Dates and Merchant Timezone

Canonical rules for bill due dates and scheduling. Complements [time.md](./time.md).

## Rules

1. **Merchant has a configured business timezone** (IANA timezone id, e.g. `Australia/Sydney`).
2. Bill **`dueDate` remains a date-only value** (`YYYY-MM-DD`) in API and database.
3. **Scheduling interprets that date in the merchant's configured timezone.**
4. **Internal execution timestamps are stored in UTC** (`timestamptz`).
5. Pre-authorisation, due-date capture and retry scheduling derive UTC instants from merchant-local due-date rules.
6. **Changing merchant timezone must not silently reinterpret already scheduled financial actions** without controlled handling (re-plan / freeze / explicit operator or product policy — exact policy TBD).

## Execution clock time

```text
Due-date execution time = configurable / TBD
```

Architecture does **not** invent the exact capture hour (e.g. 09:00 local). Product may configure default local time-of-day for due-date actions.

## Persistence implications

| Field | Store |
| --- | --- |
| `merchants.business_timezone` | IANA timezone string |
| `bills.due_date` | `date` (no time component) |
| workflow/attempt/settlement timestamps | UTC |

## API

OpenAPI continues to use `dueDate` as `format: date`. Merchants must not assume UTC midnight semantics for due dates.

# Due Dates and Merchant Timezone

Canonical rules for bill due dates and scheduling. Complements [time.md](./time.md).

Binding MVP clock/cutoff/timezone policy: [ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md).

## Rules

1. **Merchant has a configured business timezone** (IANA timezone id, e.g. `Australia/Sydney`).
2. Bill **`dueDate` remains a date-only value** (`YYYY-MM-DD`) in API and database.
3. **Scheduling interprets that date in the workflow’s frozen IANA timezone** (snapshot at PaymentWorkflow / Bill accept — see ADR-025).
4. **Internal execution timestamps are stored in UTC** (`timestamptz`).
5. Pre-authorisation, due-date capture and retry scheduling derive UTC instants from merchant-local due-date rules.
6. **Changing merchant timezone must not silently reinterpret already scheduled financial actions.** Existing `ScheduledJob.scheduledFor` UTC values stay fixed; in-flight workflow cutoffs use the frozen timezone (ADR-025 / resolved OD-006).

## Due execution clock (MVP default)

```text
dueExecutionInstant = dueDate @ 09:00 in frozen workflow IANA timezone → UTC
```

This is the **initial collection / due-date action target**. It is **not** the recovery cutoff.

## Recovery cutoff (MVP default)

```text
cutoffAt = (dueDate + 7 calendar days) @ 09:00 in the same frozen timezone → UTC
```

Cutoff closes the recovery window for ADR-024 terminal `FAILED` (subject to UNKNOWN / in-flight guards in ADR-025).

## DST / conversion

- Use IANA TZDB conversion (no fixed offsets).
- Nonexistent local time (spring gap): next valid local instant after the gap.
- Ambiguous local time (fall overlap): earlier offset.

## Persistence implications

| Field | Store |
| --- | --- |
| `merchants.business_timezone` | IANA timezone string (current merchant setting) |
| Workflow frozen timezone | Snapshot at workflow create (platform D5 consequence) |
| `bills.due_date` | `date` (no time component) |
| workflow/attempt/settlement timestamps | UTC |
| `ScheduledJob.scheduledFor` | UTC; immutable on merchant timezone change |

## API

OpenAPI continues to use `dueDate` as `format: date`. Merchants must not assume UTC midnight semantics for due dates.

## Configuration

Architecture default is binding for MVP. Future merchant overrides may configure clock hour / window length within ADR-025 bounds; defaults remain 09:00 and 7 calendar days until superseded.

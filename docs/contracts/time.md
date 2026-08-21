# Time Representation

## API

- Timestamps: **RFC 3339** in **UTC** (e.g. `2026-09-01T10:15:30.000Z`)
- Bill due dates: **date-only** (`YYYY-MM-DD`) when business semantics are calendar-date based

## Persistence

- Instant timestamps: `timestamptz` stored/normalized as UTC
- Due dates: `date` columns — do not casually convert date-only obligations into UTC timestamps without timezone rules

## Merchant timezone / due-date semantics

See **[due-dates.md](./due-dates.md)** (binding) and **[ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md)**.

Summary:

- Merchant configured business timezone (IANA); workflows freeze timezone at create
- `dueDate` is date-only; scheduling interprets it in that frozen timezone
- Due execution clock MVP default: **09:00** local
- Recovery cutoff MVP default: **dueDate + 7 calendar days @ 09:00** local
- Execution timestamps UTC
- Timezone changes must not silently move existing `ScheduledJob` UTC times or frozen cutoffs

# Time Representation

## API

- Timestamps: **RFC 3339** in **UTC** (e.g. `2026-09-01T10:15:30.000Z`)
- Bill due dates: **date-only** (`YYYY-MM-DD`) when business semantics are calendar-date based

## Persistence

- Instant timestamps: `timestamptz` stored/normalized as UTC
- Due dates: `date` columns — do not casually convert date-only obligations into UTC timestamps without timezone rules

## Merchant timezone / due-date semantics

See **[due-dates.md](./due-dates.md)** (binding).

Summary:

- Merchant configured business timezone (IANA)
- `dueDate` is date-only; scheduling interprets it in that timezone
- Execution timestamps UTC
- Exact due-date capture clock time remains configurable/TBD
- Timezone changes must not silently reinterpret already scheduled financial actions

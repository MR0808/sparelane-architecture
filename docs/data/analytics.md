# Analytics Architecture

Conceptual flow:

```text
Operational / Domain Events
        ↓
Analytics ingestion
        ↓
Analytics Store
        ↓
Merchant Reporting
        ↓
Future Reliability Intelligence (#future)
```

## Principles

- analytics is **derived**
- analytics must not mutate source transactional data
- reporting may lag operational state
- sensitive data should be minimised
- merchant tenant isolation still applies
- analytics outage must not stop payment correctness
- warehouse / vendor technology **TBD**
- future ML/AI remains `#future`

See [ADR-015](../decisions/ADR-015-analytics-not-source-of-truth.md).

## Future Reliability Intelligence boundary

Potential future inputs (conceptual):

- payment outcomes
- retry timing
- decline class
- method ordering
- recurrence patterns

Must **not**:

- access raw PAN/CVV
- bypass risk controls
- directly execute payment rails
- become authoritative for financial state

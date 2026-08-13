# ADR-013 — Financial Ledger Remains Independent of Operational Workflow Data

## Status

Accepted

## Context

Payment Workflow state describes collection reliability progress. Financial position and movement require different invariants: balanced journals, append-only history, reconciliation against providers and merchants.

Collapsing both into a single conceptual “payment record” increases accidental coupling and weakens financial auditability.

## Decision

Operational payment workflow state and authoritative financial journal data are **logically separated**.

- Operational Database is authoritative for workflows, attempts, bills and related operational entities
- Financial Ledger Database is authoritative for journal transactions/entries and derived financial balances

Physical database topology (one engine vs multiple) remains **TBD**.

## Consequences

### Positive

- clearer invariants per store
- stronger financial auditability
- reduced accidental coupling of UI/ops state to accounting history
- reconciliation can compare independent sources

### Negative / tradeoffs

- consistency between `COLLECTED` and ledger posting needs an explicit recovery design
- dual-store operational complexity
- eventual consistency windows depending on chosen pattern

## Alternatives Considered

1. **Single operational table as financial truth** — rejected; weakens accounting integrity.
2. **Decide physical topology now** — deferred until deployment choices are known.

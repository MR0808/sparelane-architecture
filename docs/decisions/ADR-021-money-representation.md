# ADR-021 — Decimal-Safe Monetary Representation

## Status

Accepted

## Context

Binary floating point cannot represent decimal currency exactly and causes reconciliation bugs.

## Decision

Money must **never** use binary floating-point representation.

- **API:** decimal string + ISO 4217 currency (`{ "value": "150.00", "currency": "AUD" }`)
- **Database:** integer minor units (`BIGINT amount_minor`) + currency code, with a domain currency-exponent map (AUD=2)

## Consequences

### Positive

- exact arithmetic for MVP currencies
- clear API contract for merchants

### Negative / tradeoffs

- non-decimal or unusual currencies need careful exponent handling
- conversion helpers required at API boundary

## Alternatives Considered

1. **IEEE float/double** — rejected.
2. **NUMERIC only** — acceptable alternative; integer minor units preferred for MVP simplicity.

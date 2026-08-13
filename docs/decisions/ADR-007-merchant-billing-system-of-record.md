# ADR-007 — Merchant Remains Billing System of Record

## Status

Accepted

## Context

Merchants already operate billing, invoicing, subscription and finance systems. Sparelane's value is payment reliability for recurring bills, not replacing merchant billing platforms.

## Decision

Sparelane does **not** replace the merchant's billing/invoicing platform.

Sparelane receives the bill information required for payment reliability and owns Sparelane-side payment, recovery, settlement and reconciliation state.

The merchant remains system of record for:

- customer billing account
- invoice / subscription
- bill amount and due date
- original bill status
- merchant-side finance records

## Consequences

### Positive

- lower integration disruption for merchants
- avoids duplicating subscription/billing product scope
- clear ownership boundaries
- Sparelane can focus on reliability differentiation

### Negative / tradeoffs

- Sparelane depends on timely/accurate merchant bill submissions
- reconciliation relies on preserved merchant references
- potential stale-data if merchant systems change bills without notifying Sparelane (product rules TBD)

## Alternatives Considered

1. **Sparelane becomes the billing system of record** — rejected for MVP; out of product scope.
2. **Bidirectional sync of full invoice ledgers** — rejected as default; unnecessary complexity for reliability orchestration.

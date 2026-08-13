# ADR-005 — Collection Before Settlement

## Status

Accepted

## Context

Sparelane improves recurring payment reliability. It does not guarantee payment and must not become a lender by paying merchants when consumer collection has not succeeded.

## Decision

Merchant settlement may only be initiated after the relevant consumer funds have been successfully collected and made settlement-eligible.

```text
Payment Workflow = COLLECTED
→ ledger posts collection / payable eligibility
→ Settlement may become ELIGIBLE
```

Sparelane does not advance Sparelane capital to fund merchant obligations for failed collections in MVP.

## Consequences

### Positive

- aligns with no payment guarantee / no lending
- reduces cash and credit risk
- keeps settlement failure separate from payment collection failure
- makes merchant payout contingent on real collected funds

### Negative / tradeoffs

- merchants are not paid for failed consumer collections (by design)
- settlement timing depends on collection success and partner processing
- requires clear merchant communication that Sparelane is not a guarantor

## Alternatives Considered

1. **Settle on bill creation or payment attempt** — rejected; creates funding risk.
2. **Settle on pre-authorisation success** — rejected; pre-auth is not collection.
3. **Offer merchant credit / advance facility** — explicitly out of MVP scope.

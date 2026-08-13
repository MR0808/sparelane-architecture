# Payment Method Selection (MVP)

Documents how the Reliability Engine selects the next eligible payment method for a Payment Workflow.

Related components:

- Reliability Engine — eligibility and next-method decision
- Payment Method Priority Service — configured ordering
- Payment Orchestrator — requests selection and executes the chosen action
- Decline Classification — feeds prior outcome classes into eligibility

## MVP methods

In scope:

1. Primary card
2. Ordered backup cards
3. Optional Sparelane wallet when enabled, permitted and sufficiently funded

Out of scope for MVP selection:

- PayTo / NPP (tagged `#future`)
- ML/AI optimisation

## Default conceptual ordering

Unless product configuration overrides it, the conceptual preference order is:

```text
1. Primary card
2. Backup card 1
3. Backup card 2
4. Backup card 3
5. Wallet (if enabled, eligible and sufficiently funded)
```

Exact backup cardinality and whether wallet is before/after specific backups are **product-configurable / TBD**. The architecture requires an explicit ordered preference, not an implicit unordered set.

## Selection principles

1. **Primary preferred first** for a new collection cycle unless already known ineligible for this workflow.
2. **Backups maintain explicit order** from Payment Method Priority Service.
3. **Do not blindly reuse methods already terminally failed** for the relevant workflow (for example hard-declined for this recovery cycle).
4. **Hard declines** generally make that method ineligible for further automatic attempts within the same recovery workflow.
5. **Soft/retryable outcomes** may allow the same method later via scheduled retry, subject to retry policy.
6. **Invalid, expired, revoked or missing tokens** are not eligible.
7. **Wallet** requires sufficient available balance and wallet feature enablement for the consumer/merchant context.
8. **PayTo must remain outside MVP selection logic.**

## Inputs to selection

The Reliability Engine may consider:

- configured primary and ordered backups
- wallet availability and balance
- previous attempt outcomes for this workflow
- decline classification (soft / hard / technical / unknown)
- retry eligibility and remaining retry budget
- method status (active, revoked, expired)
- rail support for the requested action (pre-auth vs capture)

## Outputs

Selection returns one of:

- next eligible method + rail adapter to use
- no eligible method now, but scheduled retry may still be permitted
- no eligible method and no permitted retry → orchestrator may move workflow to `FAILED` or `ACTION_REQUIRED`

The Reliability Engine does **not** call the PSP directly.

## Product / business rules TBD

- Maximum number of backup cards
- Whether wallet is always last or configurable in the priority list
- Whether a soft-declined primary may be retried before exhausting backups
- Merchant- or product-level overrides for method eligibility
- Exact treatment of `unknown` decline classes

Until decided, treat these as configuration inputs to the Reliability Engine rather than hardcoded architecture.

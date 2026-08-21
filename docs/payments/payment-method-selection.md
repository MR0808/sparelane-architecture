# Payment Method Selection (MVP)

Documents how the Reliability Engine selects the next eligible payment method for a Payment Workflow.

Related components:

- Reliability Engine — eligibility and next-method decision
- Payment Method Priority Service — configured ordering
- Payment Orchestrator — requests selection and executes the chosen action
- Decline Classification — feeds prior outcome classes into eligibility
- [ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md) — recovery ordering and exhaustion (Orchestrator policy)

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

Exact backup cardinality and whether wallet is before/after specific backups are **product-configurable / TBD** ([OD-003](../decisions/open/OD-003-backup-cardinality.md)). The architecture requires an explicit ordered preference, not an implicit unordered set.

## Selection principles

1. **Primary preferred first** for a new collection cycle unless already known ineligible for this workflow.
2. **Backups maintain explicit order** from Payment Method Priority Service.
3. **Do not blindly reuse methods already terminally failed** for the relevant workflow (for example hard-declined for this recovery cycle).
4. **Hard / NON_RETRYABLE declines** make that method ineligible for further automatic attempts within the same payment workflow (workflow-scoped exclusion only — do not globally revoke the PaymentMethod).
5. **Soft / RETRYABLE declines** exclude the current method from **immediate** selection so backups are tried first ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)). The soft-declined method may become eligible again later via **scheduled same-method retry** when no immediate backup remains and retry budget remains.
6. **Invalid, expired, revoked or missing tokens** are not eligible.
7. **Wallet** requires sufficient available balance and wallet feature enablement for the consumer/merchant context.
8. **PayTo must remain outside MVP selection logic.**
9. **TECHNICAL_ERROR** does not, by itself, make the method ineligible for later same-method retry; Orchestrator does not request backup solely for known no-charge technical failure ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)).
10. **UNKNOWN** outcomes must not drive selection of a next charge method until reconciled.

## Inputs to selection

The Reliability Engine may consider:

- configured primary and ordered backups
- wallet availability and balance
- previous attempt outcomes for this workflow
- decline classification (soft / hard / technical / unknown)
- Orchestrator-supplied exclusions / policy context (including soft methods excluded from the immediate walk)
- method status (active, revoked, expired)
- rail support for the requested action (pre-auth vs capture)

Retry **budget** and **whether** to schedule vs require action are Orchestrator concerns ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)). Reliability Engine does **not** classify declines and does **not** decide ACTION_REQUIRED vs FAILED.

## Outputs

Selection returns one of:

- next eligible method + rail adapter to use
- no eligible method now (Orchestrator then decides RETRY_PENDING vs ACTION_REQUIRED per ADR-024)

The Reliability Engine does **not** call the PSP directly.

## Immediate fallback walk (ADR-024)

Within one recovery cycle’s immediate walk:

- Priority order remains authoritative.
- Current method may be excluded for this workflow (hard) or for immediate selection only (soft).
- Each method is attempted at most once before any scheduled same-method retry.
- Selecting a backup does not change global payment-method status; methods remain consumer-owned.
- Orchestrator creates a **new** PaymentAttempt for the selected method.

## Product / business rules TBD

- Maximum number of backup cards ([OD-003](../decisions/open/OD-003-backup-cardinality.md))
- Whether wallet is always last or configurable in the priority list ([OD-003](../decisions/open/OD-003-backup-cardinality.md))
- Merchant- or product-level overrides for method eligibility
- Exact numeric retry maxima / timings — **resolved** in [ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md); qualitative retry-budget semantics remain in ADR-024

**Resolved by ADR-024:** whether a soft-declined primary may be retried before exhausting backups — **MVP default: no; try eligible backups immediately first.**

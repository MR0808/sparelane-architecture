---
id: OD-008
title: PSP selection
category: payments
blockingStage: sandbox
status: resolved
related:
  - docs/decisions/ADR-001-psp-tokenisation.md
  - docs/decisions/ADR-010-pci-boundary.md
  - docs/decisions/ADR-037-collection-funds-flow-merchant-of-record.md
  - docs/decisions/ADR-038-mvp-payment-service-provider-selection.md
  - OD-010
  - OD-025
  - OD-036
---

# OD-008 — PSP selection

## Decision required

Select the MVP Payment Service Provider (PSP) for tokenised card collection and bind it via Accepted ADR.

## Status

`resolved` by [ADR-038](../ADR-038-mvp-payment-service-provider-selection.md) (2026-08-25).

## Accepted selection (summary)

| Binding | Value |
| --- | --- |
| Vendor | **Stripe** |
| Product | **Stripe Connect** |
| Charge model | **Direct charges** only |
| `providerAccountRef` | Connected Account `acct_…` |
| Token reuse | Platform `pm_…` + clone to connected account |
| MoR / custody | Merchant MoR; Sparelane `NO_CUSTODY` (ADR-037) |

## Notes

**Vendor decision closed.** Real Stripe adapter implementation, sandbox LIVE_EVIDENCE, and OD-025 secret wiring remain separate follow-ups — do not treat OD-008 Accept as live money proven.

See [phase-od-008-psp-decision-gate](../../implementation/phase-od-008-psp-decision-gate.md) and [ADR-038](../ADR-038-mvp-payment-service-provider-selection.md).

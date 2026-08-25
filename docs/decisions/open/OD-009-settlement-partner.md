---
id: OD-009
title: Settlement / banking partner
category: payments
blockingStage: sandbox
status: resolved
related:
  - docs/decisions/ADR-006-separate-settlement-lifecycle.md
  - docs/decisions/ADR-037-collection-funds-flow-merchant-of-record.md
  - docs/decisions/ADR-038-mvp-payment-service-provider-selection.md
  - docs/decisions/ADR-039-mvp-settlement-provider-selection.md
---

# OD-009 — Settlement / banking partner

## Decision required

Settlement / banking partner.

## Status

`resolved` by [ADR-039](../ADR-039-mvp-settlement-provider-selection.md) (2026-08-25).

## Accepted selection (summary)

| Binding | Value |
| --- | --- |
| Provider | **Stripe Connect** (same as ADR-038 PSP) |
| Model | **Manual payout** on connected account (`po_…`) |
| Amount | **Gross** Settlement (platform pays Stripe processing fees via `fees_collector=application`) |
| Destination | Connected-account external bank `ba_…` |
| Finality | Payout status **`paid`** → SETTLED (+ journal) |
| Schedule | Automatic payouts **disabled** (manual) |

## Notes

**Vendor decision closed.** Stripe settlement adapter + LIVE_EVIDENCE remain EXTERNAL_IMPLEMENTATION / LIVE_EVIDENCE — not claimed by this OD Accept.

FakeSettlementProvider remains local/CI only; production fail-closed without approved adapter.

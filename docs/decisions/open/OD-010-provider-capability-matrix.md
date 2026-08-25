---
id: OD-010
title: Provider capability matrix (pre-auth, idempotency keys)
category: payments
blockingStage: pilot
status: resolved
related:
  - docs/decisions/ADR-002-payment-orchestrator.md
  - docs/decisions/ADR-038-mvp-payment-service-provider-selection.md
  - docs/decisions/ADR-039-mvp-settlement-provider-selection.md
  - OD-008
  - OD-009
  - OD-036
---

# OD-010 — Provider capability matrix (pre-auth, idempotency keys)

## Decision required

Provider capability matrix (pre-auth, idempotency keys, lookup, webhooks) for selected PSP and settlement partner.

## Status

`resolved` by [ADR-038](../ADR-038-mvp-payment-service-provider-selection.md) (PSP) + [ADR-039](../ADR-039-mvp-settlement-provider-selection.md) (settlement) — 2026-08-25.

Not independently counted as an MVP EXTERNAL_VENDOR_DECISION blocker.

## PSP half — Stripe Connect direct charges (ADR-038)

| Capability | Binding |
| --- | --- |
| Preauthorisation | Not required MVP |
| Capture (separate) | Not required MVP (automatic) |
| Idempotency | `PaymentAttempt.publicId`; ≤255; ~24h retention |
| Lookup | Retrieve PaymentIntent + Stripe-Account |
| Webhooks | Optional acceleration |
| Connected account | `acct_…`; `card_payments` |
| Tokens | Platform `pm_…` + clone |
| Fee collector | **`fees_collector=application`** (required with ADR-039 for gross settlement) |

## Settlement half — Stripe Connect manual payouts (ADR-039)

| Capability | Binding |
| --- | --- |
| Submit | `POST /v1/payouts` on connected account |
| Idempotency | `settlement-instruction:{settlementPublicId}` |
| Instruction ref | `po_…` |
| Destination | `ba_…` on same `acct_…` |
| Lookup / finality | Retrieve payout; `paid` → settled |
| Webhooks | Optional `payout.*` acceleration |
| Schedule | Manual only |
| Amount | Gross Settlement amount |

## Notes

Capability matrix closed for selected vendors. Live adapter conformance and sandbox evidence remain EXTERNAL_IMPLEMENTATION / LIVE_EVIDENCE.

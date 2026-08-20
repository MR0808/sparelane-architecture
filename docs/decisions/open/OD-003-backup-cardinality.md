---
id: OD-003
title: Payment-method backup cardinality / wallet ordering
category: product
blockingStage: development
status: open
related:
  - docs/payments/payment-method-selection.md
---

# OD-003 — Payment-method backup cardinality / wallet ordering

## Decision required

Payment-method backup cardinality / wallet ordering.

## Why it matters

Reliability Engine inputs

## Blocking stage

`development`

## Status

`open`

## Notes

Unresolved item tracked separately from Accepted ADRs. See the [open decisions index](../open-decisions.md).

Phase B implemented a **default priority convention** (first payment method → primary; later methods append). Reliability Engine runtime selection and backup cardinality caps remain open — see [phase-b-status](../../implementation/phase-b-status.md).

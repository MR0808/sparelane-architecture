---
id: OD-025
title: Secrets product / KMS/HSM
category: security
blockingStage: pilot
status: resolved
related:
  - docs/decisions/ADR-011-centralised-secrets-management.md
  - docs/decisions/ADR-040-mvp-managed-secrets-and-key-management-policy.md
  - docs/decisions/ADR-038-mvp-payment-service-provider-selection.md
  - docs/decisions/ADR-039-mvp-settlement-provider-selection.md
---

# OD-025 — Secrets product / KMS/HSM

## Decision required

Secrets product / KMS/HSM.

## Status

`resolved` by [ADR-040](../ADR-040-mvp-managed-secrets-and-key-management-policy.md) (2026-08-25).

## Accepted selection (summary)

| Binding | Value |
| --- | --- |
| Architecture | **Split** |
| Low-cardinality provider/deployment/pepper | **AWS Secrets Manager** + CMK |
| High-cardinality recoverable (merchant webhooks) | **Postgres ciphertext + AWS KMS envelope** |
| Non-recoverable API credentials | Hash + pepper only |
| Public identifiers (`acct_…`) | Ordinary DB |
| Sandbox | Real managed architecture (Stripe **test** keys) |
| Fail closed | No Memory / local-master-key sole store in sandbox/production |

## Notes

**Vendor/architecture decision closed.** Managed-secret backends + Stripe adapter credential wiring remain **EXTERNAL_IMPLEMENTATION** — not claimed by this OD Accept.

Does **not** resolve OD-023 (IdP) or OD-035 (email vendor).

---
id: OD-036
title: Collection funds-flow / merchant-of-record operating model
category: regulatory
blockingStage: sandbox
status: resolved
related:
  - OD-008
  - OD-009
  - OD-010
  - OD-012
  - ADR-001
  - ADR-005
  - ADR-006
  - ADR-026
  - ADR-029
  - ADR-037
---

# OD-036 — Collection funds-flow / merchant-of-record operating model

## Decision required

Bind Sparelane’s **commercial and regulatory operating model** for consumer collection and merchant payout before selecting a live PSP (OD-008) or settlement partner (OD-009).

## Status

`resolved` by [ADR-037](../ADR-037-collection-funds-flow-merchant-of-record.md) (2026-08-25).

## Accepted model (summary)

| Binding | Value |
| --- | --- |
| Option | **C — Marketplace / Connected Sub-Merchant** (`CONNECTED_SUB_MERCHANT_ORCHESTRATOR`) |
| MoR | **Merchant** (Sparelane is never MoR for MVP card collection) |
| Funds landing | Merchant **connected/sub-merchant PSP balance** (provider-controlled) |
| Sparelane custody | **`NO_CUSTODY`** |
| Phase F | **`REINTERPRETATION_ONLY`** (journals unchanged) |
| OD-008 | Resume with connected/marketplace provider-family constraints |
| OD-009 | **`NARROWED`** — prefer same PSP payout; still MVP-blocking |

## Why it mattered

ADR-026 left regulatory/custody characterisation TBD. Selecting a PSP without MoR/funds-flow binding risked forcing an unapproved custodial / PayFac role.

## Notes

**Not independently counted as a fifth MVP external vendor blocker** — nested prerequisite under OD-008. Independent counted set remains OD-008 / OD-009 / OD-023 / OD-025 until those close.

Wallet custody remains separate: [OD-012](./OD-012-wallet-custody-licensing.md) (`wallet-only`).

See [ADR-037](../ADR-037-collection-funds-flow-merchant-of-record.md) and [phase-od-008-psp-decision-gate](../../implementation/phase-od-008-psp-decision-gate.md).

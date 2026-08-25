# Platform checklist — Stripe Connect SettlementProvider adapter

**Status:** Architecture-only (no code in this track)  
**Binding:** [ADR-039](../decisions/ADR-039-mvp-settlement-provider-selection.md)

## Location

- Interface: `packages/integrations` `SettlementProvider`
- Adapter e.g. `packages/integrations/src/stripe/settlement.ts` — **no Stripe types in domain**
- Resolve `Stripe-Account` from Settlement merchant `providerAccountRef`

## Must implement

| Item | Notes |
| --- | --- |
| Credential resolver | OD-025 SecretProvider; same platform `sk_` as PSP adapter |
| Connected account context | Mandatory `acct_…`; fail closed if missing |
| Manual payout only | Assert/configure schedule interval `manual` |
| Fee collector precondition | Connected accounts must use platform-paid Stripe fees (`fees_collector=application`) |
| `submitInstruction` | `POST /v1/payouts` amount=gross, currency, `destination=ba_…`, Idempotency-Key=`settlement-instruction:{settlementPublicId}` |
| Outcome mapping | accepted / rejected / technical_error / unknown_outcome |
| `lookupInstruction` / `reconcileInstruction` | Retrieve `po_…`; map pending/in_transit/paid/failed; never submit |
| Webhook verify | Optional `payout.*` + `whsec_` |
| Destination ownership | `ba_…` must belong to Settlement merchant’s `acct_…` |
| Conformance suite | See ADR-039 / gap plan list |
| Production Fake guard | `assertProductionSafeSettlementProvider` |
| Safe logging | No secrets, no raw bank numbers |

## Must not

- Automatic payout schedule for Sparelane-settled accounts
- Destination/separate-charges transfer rails for MVP settlement
- Reduce Settlement amount for Stripe fees
- New idempotency key on timeout/conflict
- Mark SETTLED on payout create
- Cross-merchant destination use

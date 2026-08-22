# Phase F2 — Settlement finality, reconciliation & payout accounting decision gate (architecture)

**Status:** PASS — binding policy in [ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)

Platform previously stopped F2 because finality evidence, reconcile taxonomy, not-found/unknown rules, trigger/cadence, and payout CoA were TBD. ADR-029 unblocks implementation.

## Platform F2 must implement

1. Provider-neutral finality/reconcile port returning `pending` \| `settled` \| `failed` \| `not_found` \| `unknown`
2. Extend FakeSettlementProvider with deterministic finality; reconcile/lookup never creates a second transfer
3. `ReconcileSettlement` on settlement-worker — triggers: verified webhook, `SettlementSubmitted`, unknown hold, explicit/test
4. Matching on instruction identity / provider key / provider_instruction_ref; amount+currency(+destination) integrity
5. `not_found` / `unknown` / `pending` → hold or PROCESSING; no resubmit; no SETTLED without `settled`
6. On `settled`: append payout journal `settlement-payout:{settlementPublicId}` then Settlement → SETTLED + `SettlementSettled`
7. Journal template: Dr `mrc:{merchantPublicId}:payable:{currency}` / Cr `sys:settlement-clearing:{settlementProviderCode}:{currency}` (gross)
8. Split-store crash recovery (E1 pattern); SETTLED without journal = integrity violation
9. Tests: FIN-INV-05 extended; FIN-INV-06; no second transfer; duplicate/concurrent reconcile; ack ≠ SETTLED

## Must not invent

Real OD-009 partner, fee/netting, bank-cash credit, automatic ScheduledJob poll cadence, RETRY_PENDING replacement instruction, SETTLED on accepted alone, resubmit on not_found.

## Still TBD (production blockers; not local Fake F2 blockers)

OD-009 partner, fee/reserve netting for commercial net payout, bank-statement recon as independent control, OD-011 batch cadence, automatic long-horizon poll cadence.

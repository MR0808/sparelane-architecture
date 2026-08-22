# Reconciliation

Sparelane has related but distinct reconciliation concerns. Do not treat reconciliation as one generic process.

Binding settlement finality / payout accounting: [ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md).

## 1. Payment reconciliation

**Compares:** PSP payment/capture outcome versus Sparelane Payment Attempt / Payment Workflow.

**Owned primarily by:** Payment Reliability Engine (Attempt Service, Orchestrator) with provider webhook ingress.

**Questions answered:**

- Did the provider actually authorise/capture this attempt?
- Is workflow `COLLECTED` supported by a successful attempt?
- Are duplicate/out-of-order provider events safely ignored?

## 2. Financial reconciliation

**Compares:** PSP/acquirer/bank financial movement versus Sparelane ledger.

**Owned primarily by:** Funds & Ledger + Settlement Reconciliation.

**Questions answered:**

- Do journal entries match expected collection and settlement movements?
- Are clearing/control accounts consistent?
- Are there suspense/exception items needing operations review?

Provider file formats and statement mechanics remain TBD with selected partners ([OD-009](../decisions/open/OD-009-settlement-partner.md)). **Bank/cash statement reconciliation is not required for MVP `SETTLED`** (ADR-029).

## 3. Merchant reconciliation

**Compares:** Settlement versus merchant:

- bill/invoice reference
- reconciliation reference
- expected amount
- settlement reference

**Owned primarily by:** Settlement Reconciliation + Merchant Domain Reconciliation Service.

**Questions answered:**

- Was this merchant paid the expected amount for this bill/reference?
- Can the merchant finance/ERP match Sparelane’s settlement report/webhook?

Sparelane does **not** mutate the merchant’s invoice/billing system of record.

## Settlement finality reconciliation (binding — ADR-029)

**Compares:** SettlementInstruction (+ Settlement amount/currency/destination) versus provider-adapter-normalised finality from **verified webhook and/or lookup**.

**Owned primarily by:** Settlement (settlement-worker) using SettlementProvider port; ledger for payout journal.

### Authoritative evidence

1. Signature-verified provider webhook → adapter → canonical outcome
2. `lookupSettlementInstruction` / reconcile against the **same** provider + instruction identity
3. Provider/bank statement files — **later independent control**; not MVP `SETTLED` gate

Conflicting terminal webhook vs lookup → integrity hold (no `SETTLED`).

### Canonical outcomes

| Outcome | Settlement | Payout journal | Resubmit |
| --- | --- | --- | --- |
| `pending` | Remain SUBMITTED or → PROCESSING | No | No |
| `settled` | After journal → SETTLED | Yes (`settlement-payout:{settlementPublicId}`) | No |
| `failed` | → FAILED | No | No (business retry later) |
| `not_found` | Hold (integrity/ops) | No | **No** |
| `unknown` | Remain non-terminal | No | No |

### Matching keys

Required: Settlement public id, instruction `business_reference` / provider idempotency key (`settlement-instruction:{settlementPublicId}`), `provider_instruction_ref` when stored, original `provider`, merchant id.

Integrity: amount, currency, and destination ref (when provider exposes it) must match local instruction.

Never match solely by amount, merchant, or timestamp.

### Trigger (MVP)

- Verified webhook → `ReconcileSettlement`
- `SettlementSubmitted` → enqueue `ReconcileSettlement` (lookup path)
- Unknown / `reconciliation_required` → same command (no new submit)
- Explicit/test/Fake harness allowed
- **No** automatic ScheduledJob poll cadence in MVP

### No new transfer

Reconciliation must never call `submitSettlementInstruction`.

## Related docs

- [Ledger model](ledger-model.md)
- [Settlement state machine](settlement-state-machine.md)
- [Settlement idempotency](settlement-idempotency.md)
- [ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)

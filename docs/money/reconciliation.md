# Reconciliation

Sparelane has related but distinct reconciliation concerns. Do not treat reconciliation as one generic process.

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

Provider file formats and statement mechanics are TBD with the selected partners.

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

## Settlement Reconciliation outcomes

Settlement Reconciliation should identify at least:

- matched settlement
- amount mismatch
- missing provider settlement
- duplicate provider settlement
- unknown/unmatched settlement
- failed settlement

## Related docs

- [Ledger model](ledger-model.md)
- [Settlement state machine](settlement-state-machine.md)
- [Settlement idempotency](settlement-idempotency.md)

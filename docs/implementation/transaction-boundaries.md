# Transaction Boundaries

Do **not** use distributed transactions across Operational DB and Ledger DB.

## Bill submission

**One Operational DB transaction:**

1. Enforce API idempotency key
2. Insert Bill (unique merchant + bill ref)
3. Insert Payment Workflow (1:1 bill)
4. Insert Outbox Event (`BillAccepted` / workflow start)

HTTP returns **accepted**, not collected.

## Payment collected

**One Operational DB transaction:**

1. Transition workflow → `COLLECTED` (version check)
2. Update successful attempt → `CAPTURED`
3. Set `ledger_posting_status = PENDING`
4. Insert Outbox Event for collection ledger posting

Ledger write happens later.

## Ledger posting

**One Ledger DB transaction** (idempotent):

1. Check unique `business_reference` (e.g. collection for workflow)
2. Insert Journal Transaction
3. Insert balanced Journal Entries
4. Persist posting result / emit confirmation path back to operational state

## Settlement creation

**Operational transaction (after ledger confirmed):**

1. Verify ledger eligibility / posting confirmed
2. Insert Settlement
3. Outbox event if async continuation needed

## Settlement instruction submit

Record instruction + idempotency key before/with provider submit handling; unknown outcomes must not blind-duplicate ([settlement idempotency](../money/settlement-idempotency.md)).

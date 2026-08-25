---
id: SEQ-MONEY-007
title: Ledger Compensating Correction
type: sequence
area: money
status: accepted
mvp: true
likec4:
  - adminPrivilegedAction
  - fundsLedger
requirements:
  - FUN-SET-007
  - FUN-SET-008
  - FUN-ADM-009
  - NFR-SEC-012
adrs:
  - ADR-004
  - ADR-012
  - ADR-013
  - ADR-033
  - ADR-036
tests:
  - FIN-INV-07
---

# Ledger Compensating Correction

## Purpose

Privileged platform admins apply an **append-only compensating journal** against an eligible collection journal under dual control + recent MFA ([ADR-036](../../decisions/ADR-036-financial-compensating-correction-policy.md)). Accounting-evidence only — no payment/settlement rewrite, no PSP refund, no payout reverse.

## Preconditions

- Requester and approver: active `platform_admin` + capability `admin.ledger.correct`
- Target source journal addressed by mandatory `jt_…` public ID
- Source `transaction_type = collection`; `ledger_posting_status = CONFIRMED`
- Settlement absent or status ∈ {PENDING, ELIGIBLE, FAILED, CANCELLED}
- Correction amount `A` > 0 and ≤ remaining capacity

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Req as Requester Admin
    participant Appr as Approver Admin
    participant BFF as Admin BFF
    participant Auth as AuthZ + MFA
    participant PAR as PrivilegedActionRequest
    participant LDB as Ledger DB
    participant ODB as Operational DB
    participant Aud as Audit

    Req->>BFF: Request admin.ledger.correct (jt_…, amount, currency, reason)
    BFF->>Auth: Grant + admin.ledger.correct + MFA≤15m
    BFF->>PAR: Create pending (fingerprint: action+jt_+amount+currency)
    BFF->>Aud: Audit request

    Appr->>BFF: Approve (≠ requester, MFA≤15m)
    BFF->>PAR: approved
    BFF->>Aud: Audit approve

    Note over BFF,LDB: Execute (requester or approver + MFA≤15m)
    BFF->>PAR: Lock approved request
    BFF->>LDB: FOR UPDATE source jt_ then compute remaining
    alt remaining ≥ A and eligible
      BFF->>LDB: appendJournal correction (ledger-correction:par_…)
      Note over LDB: Cr processor-clearing / Dr merchant-payable amount A<br/>corrects_journal_transaction_id → source
      BFF->>Aud: Audit execute success + new jt_
      BFF->>PAR: executed
    else reject
      BFF->>Aud: Audit execute fail
      Note over LDB,ODB: No journal — Payment/Settlement unchanged
    end

    Note over ODB: PaymentWorkflow / Settlement statuses NOT mutated by this path
```

## Accounting (binding)

| Leg | Side | Account | Amount |
| --- | --- | --- | --- |
| 1 | CREDIT | same processor-clearing as source DEBIT | `A` |
| 2 | DEBIT | same merchant-payable as source CREDIT | `A` |

- `business_reference` = `ledger-correction:{parPublicId}`
- `transaction_type` = `correction`
- Settlement create/execute must refuse when remaining collection capacity ≤ 0

## Explicit non-effects

- No UPDATE/DELETE of source journal
- No PaymentWorkflow / PaymentAttempt / Settlement status change
- No PSP / settlement-provider calls

## Related

- [ADR-036](../../decisions/ADR-036-financial-compensating-correction-policy.md)
- [FIN-INV-07](../../../requirements/tests/FIN-INV-07.md)
- Generic privileged pattern: [SEQ-SEC-004](../security/admin-privileged-action.md)

# Financial Integrity Controls

Protections for money-movement correctness and abuse resistance.

## Threats addressed (non-exhaustive)

| Concern | Primary controls |
| --- | --- |
| Duplicate collection | Payment workflow state machine; attempt history; provider event idempotency |
| Duplicate settlement | Settlement idempotency; provider references; unknown-outcome handling before blind resubmit |
| Ledger manipulation | Restricted write path; append-only journal; balancing invariants; no admin UI direct mutation |
| Settlement amount tampering | Settlement derived from eligible ledger/payable state; authorisation on privileged changes |
| Incorrect merchant association | Tenant-scoped authorisation; preserved merchant references; reconciliation matching |
| Unauthorised refund/adjustment (future) | Explicit permissions; audit; constrained financial workflows (product rules TBD) |
| Replayed provider events | Signature verification; replay window; event idempotency |
| Admin privilege misuse | MFA; least privilege; durable audit; scoped support access |

## Cross-cutting mechanisms

- **Idempotency** for merchant mutations and provider/settlement instructions
- **Ledger invariants** (balanced postings; no silent history rewrite)
- **Append-only journal** with compensating entries for corrections
- **Reconciliation** of provider, ledger and merchant references
- **Audit trail** for sensitive payment and settlement actions
- **Scoped permissions** for financial and privileged operations

See also money-domain docs under [`docs/money/`](../money/).

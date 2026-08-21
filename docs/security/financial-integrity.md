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

- **Idempotency** for merchant mutations and provider/settlement instructions ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md): one instruction per Settlement; stable provider key; unknown ≠ blind resubmit)
- **Ledger invariants** (balanced postings; no silent history rewrite)
- **Append-only journal** with compensating entries for corrections
- **Reconciliation** of provider, ledger and merchant references (SETTLED only after evidence)
- **Audit trail** for sensitive payment and settlement actions
- **Scoped permissions** for financial and privileged operations
- **Merchant isolation** on Settlement, payout destination, instruction, and provider request (FIN-INV-08)
- **Recovery policy** ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)): no blind retry/backup while UNKNOWN; workflow-scoped method exclusions (no global card revocation from a single decline); terminal states not silently overwritten; late success after FAILED is reconciliation/integrity, not auto-COLLECTED

See also money-domain docs under [`docs/money/`](../money/).

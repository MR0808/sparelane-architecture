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
| Admin privilege misuse | MFA; least privilege; durable audit; scoped support access; **H0/H1: no admin financial mutation** ([ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md), [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)) |

## Cross-cutting mechanisms

- **Idempotency** for merchant mutations and provider/settlement instructions ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md): one instruction per Settlement; stable provider key; unknown ≠ blind resubmit)
- **Ledger invariants** (balanced postings; no silent history rewrite)
- **Append-only journal** with compensating entries for corrections
- **Reconciliation** of provider, ledger and merchant references ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md): SETTLED only after finality `settled` + payout journal; ack alone invalid; not_found ≠ resubmit)
- **Payout journal integrity** — unique `settlement-payout:{settlementPublicId}`; amount/currency/destination mismatch → no SETTLED; SETTLED without journal → integrity violation
- **Audit trail** for sensitive payment and settlement actions
- **Scoped permissions** for financial and privileged operations
- **Merchant isolation** on Settlement, payout destination, instruction, and provider request (FIN-INV-08)
- **Recovery policy** ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)): no blind retry/backup while UNKNOWN; workflow-scoped method exclusions (no global card revocation from a single decline); terminal states not silently overwritten; late success after FAILED is reconciliation/integrity, not auto-COLLECTED

## H0 / H1 admin boundary (binding)

- Platform admin authority **does not bypass** payment, settlement, or ledger state machines.
- H0 admin control plane has **no financial mutation** endpoints — no workflow/attempt/journal/settlement updates, no payment/settlement execution, no balance correction UI.
- **H1 admin grant management never authorises financial mutation, replay, or correction** — PrivilegedActionRequest covers `admin.grant.create` / `admin.grant.revoke` only ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)).
- Financial **read** projections only via application read ports with safe fields.
- Privileged financial corrections remain **H2+** domain use cases — never raw admin DB writes.

See also money-domain docs under [`docs/money/`](../money/).

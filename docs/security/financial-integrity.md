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
| Unauthorised refund/adjustment (future) | Explicit permissions; audit; constrained financial workflows — MVP books correction only via [ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md) (not refunds) |
| Replayed provider events | Signature verification; replay window; event idempotency |
| Admin privilege misuse | MFA; least privilege; durable audit; scoped support access; **H0/H1/H2: no admin financial mutation** ([ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md), [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md), [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)); **MVP compensating correction** is a separate closed privileged path ([ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md)) — not H0–H2 catalogues |

## Cross-cutting mechanisms

- **Idempotency** for merchant mutations and provider/settlement instructions ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md): one instruction per Settlement; stable provider key; unknown ≠ blind resubmit)
- **Ledger invariants** (balanced postings; no silent history rewrite)
- **Append-only journal** with compensating entries for corrections ([ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md))
- **Reconciliation** of provider, ledger and merchant references ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md): SETTLED only after finality `settled` + payout journal; ack alone invalid; not_found ≠ resubmit)
- **Payout journal integrity** — unique `settlement-payout:{settlementPublicId}`; amount/currency/destination mismatch → no SETTLED; SETTLED without journal → integrity violation
- **Audit trail** for sensitive payment and settlement actions
- **Scoped permissions** for financial and privileged operations
- **Merchant isolation** on Settlement, payout destination, instruction, and provider request (FIN-INV-08)
- **Funds-flow / MoR ([ADR-037](../decisions/ADR-037-collection-funds-flow-merchant-of-record.md)):** merchant is MoR; Sparelane `NO_CUSTODY`; live charges use merchant-resolved `providerAccountRef` only (never bill/consumer input); ledger payable/clearing accounts are operational evidence, not Sparelane client-money custody
- **Recovery policy** ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)): no blind retry/backup while UNKNOWN; workflow-scoped method exclusions (no global card revocation from a single decline); terminal states not silently overwritten; late success after FAILED is reconciliation/integrity, not auto-COLLECTED

## H0 / H1 / H2 admin boundary (binding)

- Platform admin authority **does not bypass** payment, settlement, or ledger state machines.
- H0 admin control plane has **no financial mutation** endpoints — no workflow/attempt/journal/settlement updates, no payment/settlement execution, no balance correction UI.
- **H1 admin grant management never authorises financial mutation, replay, or correction** — PrivilegedActionRequest covers `admin.grant.create` / `admin.grant.revoke` only ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)).
- **H2 operator replay never executes financial business commands** — closed catalogue is `admin.webhook.replay` only ([ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)). Prohibited: payment execute/result/retry, settlement execute/reconcile, ledger append, financial outbox command replay, force-success.
- Financial dead-letter items (if persisted) are **inspect-only**; UI must state manual replay prohibited — use domain recovery/reconciliation.
- Payment/settlement **UNKNOWN** outcomes remain under reconciliation policy — they must not become generic replayable DLQ work.
- Webhook/notification transport replay (when allowed) must **not** mutate Bill / PaymentWorkflow / PaymentAttempt / Journal / Settlement / SettlementInstruction.
- Financial **read** projections only via application read ports with safe fields.

## MVP compensating correction boundary (ADR-036 — not H0–H2)

- Privileged action `admin.ledger.correct` under capability `admin.ledger.correct`, dual control + recent MFA + reason.
- Append-only compensating journal only; **no** UPDATE/DELETE of financial history; **no** silent rewrite of PaymentWorkflow / Settlement statuses.
- **No** PSP refund, payout reverse, force-balance, or arbitrary debit/credit UI.
- Settlement gates must honour remaining uncompensated collection capacity.

See also money-domain docs under [`docs/money/`](../money/).

# Financial Invariant Tests

**Release-critical.** Failures block production release.

1. Same payment cannot be collected twice.
2. One successful collection yields exactly one ledger posting.
3. Journal transaction always balances.
4. Failed collection cannot become settlement eligible.
5. Settlement cannot be submitted twice (same instruction identity).
6. Unknown payout outcome cannot trigger blind duplicate submission.
7. Ledger correction does not mutate historical entry (compensating only).
8. Merchant A can never settle against Merchant B data.
9. Replay of event is idempotent (no duplicate financial effect).
10. Worker restart cannot create duplicate financial effect.

Implement as automated integration/e2e tests with deterministic fixtures and fake provider adapters.

## Implementation evidence (Phase A)

**None of FIN-INV-01–10 are product-verified.** Payment, ledger, and settlement behaviour has not been implemented.

| ID | Phase A |
| --- | --- |
| FIN-INV-01–08 | Unverified. Requires product financial behaviour. |
| FIN-INV-09 Idempotent replay | Foundation prerequisite demonstrated on a non-financial synthetic fixture. Spec remains `specified`. |
| FIN-INV-10 Worker restart | Same: foundation prerequisite only; not a financial E2E. |

See [phase-a-status](phase-a-status.md).

## Implementation evidence (Phase B)

**None of FIN-INV-01–10 are product-verified.** Phase B moves no money. Payment, ledger, and settlement behaviour has not been implemented.

Phase B established safe **Consumer-owned payment-method reference** ownership and configuration as a prerequisite for future collection — that is not FIN-INV verification.

| ID | Phase A | Phase B |
| --- | --- | --- |
| FIN-INV-01–08 | Unverified | Unverified — no financial behaviour |
| FIN-INV-09 Idempotent replay | Foundation prerequisite on non-financial fixture | Unchanged — not financial E2E |
| FIN-INV-10 Worker restart | Foundation prerequisite on non-financial fixture | Unchanged — not financial E2E |

See [phase-b-status](phase-b-status.md).

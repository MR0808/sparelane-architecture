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

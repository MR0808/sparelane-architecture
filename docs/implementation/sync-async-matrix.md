# Sync vs Async Matrix

| Operation | Initial handling | Why |
| --- | --- | --- |
| Consumer profile update | Sync | Short, authoritative in Operational DB |
| Add PSP token reference | Sync | Token already at PSP; store metadata only |
| Merchant submits bill | **Sync accept** + async workflow | Fast idempotent acknowledgement; payment work deferred |
| Payment execution | Async | Provider latency/timeouts; worker restart safety |
| Payment retry | Async | Time-based; durable scheduling |
| PSP webhook validation | Sync verify + async process | Fast ACK; trusted processing after receipt |
| Ledger posting | Async via outbox | ADR-016 consistency window; idempotent consumer |
| Settlement | Async | Partner latency; unknown outcomes |
| Merchant webhook delivery | Async | At-least-once; bounded retry |
| Email/SMS | Async | Non-blocking for payment correctness |
| Reporting / analytics | Async / derived | Must not be on critical path |

Rule: HTTP requests must not wait on long-running provider settlement or bulk notification work.

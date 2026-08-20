# Test catalogue

Stable test specification IDs live under [`requirements/tests/`](./tests/).

Product automated tests will live in `sparelane-platform`. This architecture repo holds **specifications only** — not executable suites or live CI results.

Phase A recorded **foundation prerequisites** on some specs (`implementationProgress: foundation_prerequisite`) without marking financial/product tests verified. See [phase-a-status](../docs/implementation/phase-a-status.md).

## Categories

| Prefix | Meaning |
| --- | --- |
| `FIN-INV-###` | Financial invariants |
| `E2E-PAY-###` | End-to-end payment scenarios |
| `E2E-SET-###` | End-to-end settlement scenarios |
| `INT-API-###` | Merchant API integration |
| `INT-PSP-###` | PSP / provider integration |
| `SEC-TEN-###` | Tenant isolation |
| `SEC-AUTH-###` | Auth / credential / signature checks |
| `OPS-REC-###` | Ops recovery (ledger, DLQ) |
| `CON-API-###` | Contract / OpenAPI conformance |
| `CON-WEBHOOK-###` | Webhook contract scenarios |

Requirement frontmatter `tests:` must reference IDs that exist under `requirements/tests/`.

Portal: `/tests` and `/tests/:id`.

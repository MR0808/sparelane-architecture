# Test catalogue

Architecture-repo **test specifications** (not executable product tests).

Stable IDs are referenced from requirement `tests:` frontmatter.

| Prefix | Meaning |
| --- | --- |
| `FIN-INV-###` | Financial invariants |
| `E2E-PAY-###` | End-to-end payment |
| `E2E-SET-###` | End-to-end settlement |
| `INT-API-###` / `INT-PSP-###` | Integration |
| `SEC-TEN-###` / `SEC-AUTH-###` | Security |
| `ADM-AUTH-###` / `ADM-DATA-###` / `ADM-FIN-###` / `ADM-AUD-###` | Admin H0 control plane |
| `ADM-PRIV-###` / `ADM-DUAL-###` / `ADM-GRANT-###` | Admin H1 privileged grant management |
| `OPS-REC-###` | Operations recovery |
| `OPS-PILOT-###` / `OPS-ALERT-###` / `OPS-RUN-###` | Phase I pilot readiness (local Fake evidence) |
| `E2E-PILOT-###` | Phase I Fake-provider pilot end-to-end |
| `CON-API-###` / `CON-WEBHOOK-###` | Contracts |

Portal: `/tests` and `/tests/:id`.

See also [../test-catalog.md](../test-catalog.md) for the FIN-INV mapping summary.

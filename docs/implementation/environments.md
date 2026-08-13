# Environment Strategy (Implementation)

Expands [`docs/operations/`](../operations/) for engineering.

| Environment | Purpose | Providers | Data |
| --- | --- | --- | --- |
| **Local** | Developer machines | Fakes/stubs for PSP, settlement, email/SMS, IdP | Synthetic only |
| **Development** | Shared team env | Sandbox/test provider keys where available; else fakes | Non-production |
| **CI/Test** | Automated suites | Fakes + contract stubs | Ephemeral DBs |
| **Sandbox** | Merchant integration testing | Provider sandboxes; merchant sandbox API keys & webhook URLs | Non-production; no prod copies |
| **Production** | Live money | Live credentials via secrets manager | Production only |

## Rules

- Isolated provider credentials per environment
- Merchant sandbox credentials distinct from live
- Sandbox webhook endpoints must not point at production merchant systems by default
- No production data (or prod CHD-adjacent logs) in lower environments
- Feature flags default safe in all non-production; production financial flags auditable

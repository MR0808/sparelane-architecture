# CODEOWNERS Guidance

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-13  

Recommended review ownership for this repository. **Do not invent names** — assign teams when known, then add a root `CODEOWNERS` file.

## Recommended ownership areas

| Area | Paths (examples) | Owner |
| --- | --- | --- |
| Architecture model | `architecture/**`, `likec4.config.json` | Architecture (TBD) |
| Payments | `docs/payments/**`, payment-related views/flows | Payments architecture (TBD) |
| Money movement | `docs/money/**`, ledger/settlement views | Money / ledger (TBD) |
| Security | `docs/security/**`, PCI/trust views | Security (TBD) |
| Contracts | `contracts/**`, `docs/contracts/**` | API / integrations (TBD) |
| Schema / data | `docs/schema/**`, `docs/data/**` | Data architecture (TBD) |
| Implementation | `docs/implementation/**` | Engineering leads (TBD) |
| Operations | `docs/operations/**` | Platform / SRE (TBD) |
| Decisions / governance | `docs/decisions/**`, `docs/governance/**` | Architecture (TBD) |
| CI / portal deploy | `.github/**` | Platform (TBD) |

Financial and security path changes should require at least architecture + security review once owners exist.

# Environments

Logical Sparelane environments. Exact cloud accounts/projects remain TBD.

## Environments

| Environment | Purpose |
| --- | --- |
| Local | Developer machines |
| Development | Shared engineering integration |
| Test / CI | Automated tests and pipelines |
| Sandbox | Merchant-facing non-production integration |
| Production | Live merchant/consumer traffic |

## Merchant Sandbox vs Production

Merchant Sandbox and Production are **logically isolated** integration contexts:

- separate credentials
- separate secrets
- isolated data
- separate webhook endpoints
- test provider accounts where available

Physical infrastructure may or may not be fully separate; logical isolation is the requirement.

## Principles

- no production CHD or production secrets in non-production
- no production merchant/consumer data in lower environments without explicit controlled processes (**TBD**)
- environment-specific configuration and secret stores
- CI must not hold production secrets beyond approved deployment tooling (**TBD**)

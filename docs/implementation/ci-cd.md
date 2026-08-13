# CI/CD Strategy

Likely runner: GitHub Actions (not mandated).

## Pull request checks

- lint
- typecheck
- unit tests
- integration tests where practical
- architecture validation (`likec4 validate`) when architecture packages are consumed/copied
- OpenAPI validation (`openapi:lint` / equivalent)
- schema/contract validation
- security scanning
- build

## Deployment

- non-prod automatic on main (or equivalent)
- production controlled (manual approval)
- migrations before/with compatible app release
- rollback strategy for apps; forward-fix for failed migrations where possible
- financial invariant suite required before production promote

## Environments

Local → Development → CI/Test → Sandbox → Production

- isolated provider credentials
- merchant sandbox credentials and webhook endpoints
- no production data in lower environments
- no production secrets in non-production

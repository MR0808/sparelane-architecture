# Configuration Strategy

| Kind | Examples | Storage |
| --- | --- | --- |
| **Code configuration** | State machines, module boundaries | Source control |
| **Environment configuration** | Base URLs, feature env name, log level | Env / config service (non-secret) |
| **Secrets** | PSP keys, webhook signing, DB creds | Secrets manager ([ADR-011](../decisions/ADR-011-centralised-secrets-management.md)) |
| **Product/rules configuration** | Retry timing, method limits, due-date local clock, settlement batching | Config tables / flags with audit |

Do not hardcode mutable business rules where configuration is appropriate. Do not put secrets in code or non-secret config files.

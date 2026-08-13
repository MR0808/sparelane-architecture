# Repository Strategy

## Recommendation

| Repo | Role |
| --- | --- |
| `sparelane-architecture` | Architecture/design source of truth (this repo) |
| `sparelane-platform` | Product implementation (modular monorepo) |

Do **not** start with one repo per logical service.

## Preferred starting point: modular monorepo

Rationale:

- shared domain contracts and types
- easier early refactoring
- fewer CI/CD and release boundaries
- logical domains can still be package-isolated
- workers and API can deploy separately from the same repo

## Tradeoffs

| Model | Pros | Cons |
| --- | --- | --- |
| Modular monorepo | Shared contracts; single PR across layers; simpler early delivery | Requires package discipline; larger CI surface |
| Multi-service repos | Harder accidental coupling | Contract drift; more release/CI overhead early |

## Future extraction path

If a deployable (e.g. settlement-worker) needs independent ownership/scale, extract its package(s) into a dedicated repo **after** interfaces and contracts are stable. Extraction must not rewrite Accepted ADR boundaries.

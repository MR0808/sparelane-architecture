# Test catalog (architecture repo)

Product automated tests live in the future `sparelane-platform` repository. This catalog assigns **stable IDs** used in requirement `tests:` frontmatter, mapped to architecture-repo acceptance docs.

## Financial invariant tests (`FIN-INV-*`)

Source: [docs/implementation/financial-invariant-tests.md](../docs/implementation/financial-invariant-tests.md)

| ID | Invariant |
| --- | --- |
| `FIN-INV-01` | Same payment cannot be collected twice |
| `FIN-INV-02` | One successful collection → exactly one ledger posting |
| `FIN-INV-03` | Journal transaction always balances |
| `FIN-INV-04` | Failed collection cannot become settlement eligible |
| `FIN-INV-05` | Settlement cannot be submitted twice (same instruction identity) |
| `FIN-INV-06` | Unknown payout outcome cannot trigger blind duplicate submission |
| `FIN-INV-07` | Ledger correction does not mutate historical entry (compensating only) |
| `FIN-INV-08` | Merchant A can never settle against Merchant B data |
| `FIN-INV-09` | Replay of event is idempotent (no duplicate financial effect) |
| `FIN-INV-10` | Worker restart cannot create duplicate financial effect |

## MVP acceptance

Broader MVP checklists (no per-bullet IDs yet): [docs/implementation/mvp-acceptance-criteria.md](../docs/implementation/mvp-acceptance-criteria.md).

Prefer linking requirements to `FIN-INV-*` where financial correctness applies; otherwise leave `tests: []` until platform test IDs exist.

# Requirements

Git-native requirements for Sparelane. **Markdown files in this tree are authoritative.** The architecture portal reads them; it does not store a separate copy.

Do not introduce a database, CMS, or online editor for Phase 2.

---

## Layout

```text
requirements/
├── README.md                 ← this file
├── test-catalog.md           ← test ID index (points at tests/)
├── tests/                    ← test specifications (FIN-INV, E2E-*, INT-*, SEC-*, OPS-*, CON-*)
├── business/                 ← BUS-###
├── functional/               ← FUN-*-###
├── non-functional/           ← NFR-REL / NFR-PERF / NFR-OPS / NFR-PRIV
├── integrations/             ← INT-*-###
├── security/                 ← NFR-SEC-### (security NFRs; avoid duplicating under non-functional/)
└── templates/
```

---

## ID conventions

IDs are **stable**. Do not renumber after assignment. Gaps are allowed.

| Prefix | Meaning |
| --- | --- |
| `BUS-###` | Business requirement |
| `FUN-CON-###` | Functional — consumer |
| `FUN-MER-###` | Functional — merchant |
| `FUN-BIL-###` | Functional — bills |
| `FUN-PAY-###` | Functional — payments |
| `FUN-SET-###` | Functional — settlement / ledger money movement |
| `FUN-WAL-###` | Functional — wallet (often deferred) |
| `NFR-SEC-###` | Non-functional — security |
| `NFR-REL-###` | Non-functional — reliability |
| `NFR-PERF-###` | Non-functional — performance (use sparingly; no invented SLOs) |
| `NFR-OPS-###` | Non-functional — operations |
| `NFR-PRIV-###` | Non-functional — privacy |
| `INT-PSP-###` | Integration — PSP capabilities |
| `INT-SET-###` | Integration — settlement partner |
| `INT-KYB-###` | Integration — KYC/KYB |
| `INT-NOT-###` | Integration — email/SMS notifications |

Filename must match ID: `FUN-PAY-001.md`.

---

## Frontmatter

Required:

| Field | Values |
| --- | --- |
| `id` | Stable ID (must match filename) |
| `title` | Short title |
| `type` | `business` \| `functional` \| `non-functional` \| `integration` |
| `area` | Free-form area key (e.g. `payments`, `security`, `psp`) |
| `status` | see below |
| `priority` | `must` \| `should` \| `could` \| `wont` (MoSCoW) |
| `mvp` | `true` \| `false` |

Traceability (arrays; may be empty):

| Field | Points to |
| --- | --- |
| `architecture` | LikeC4 view IDs (e.g. `paymentEngineCore`) |
| `flows` | LikeC4 dynamic/sequence view IDs |
| `adrs` | `ADR-001` … (must exist under `docs/decisions/`) |
| `contracts` | Repo paths (`contracts/openapi.yaml`, `docs/contracts/...`) |
| `modules` | Implementation module names (documented strings) |
| `tests` | Test IDs from [`tests/`](./tests/) (see [test-catalog.md](./test-catalog.md)) |

Optional:

| Field | Meaning |
| --- | --- |
| `dependsOn` | Other requirement IDs |
| `related` | Other requirement IDs |
| `openDecisions` | Stable open-decision IDs (`OD-001` …) under `docs/decisions/open/` |
| `designs` | Mermaid design IDs (`SEQ-*` / `STATE-*`) under `docs/design/` |
| `openDecisionDocs` | Deprecated — prefer `openDecisions` |
| `implementationStatus` | `designed` \| `foundation_implemented` \| `implemented` \| `verified` (omit = designed) |
| `implementationEvidence` | Path/note in `sparelane-platform` (not validated as a local file) |

---

## Status

| Status | Meaning |
| --- | --- |
| `draft` | Work in progress; not ready for review |
| `proposed` | Ready for architecture/product review |
| `accepted` | Approved as required behaviour/quality (may predate implementation) |
| `implemented` | Believed implemented in product code (platform repo) |
| `verified` | Demonstrated against acceptance criteria / tests |
| `deferred` | Intentionally not now |
| `rejected` | Will not do |

Do **not** auto-infer status from git or CI.

`status: implemented` / `verified` means **product** implementation. Phase A foundation uses `implementationStatus: foundation_implemented` while keeping `status: accepted`.

See [implementation status vocabulary](../docs/implementation/implementation-status.md).

---

## Priority (MoSCoW)

| Priority | Meaning |
| --- | --- |
| `must` | Required for the stated scope (often MVP) |
| `should` | Important but not blocking if delayed |
| `could` | Desirable if capacity allows |
| `wont` | Out of scope for now (document explicitly) |

Priority is **not** implementation status.

---

## MVP marker

```yaml
mvp: true   # in MVP scope
mvp: false  # future / deferred
```

---

## Portal

- Overview: `/requirements`
- Detail: `/requirements/:id`
- Traceability matrix: `/requirements/traceability`
- Filters by type / area / status / priority / MVP

---

## Validation

```bash
npm run requirements:validate
```

Included in `npm run validate`.

---

## Governance

See [docs/governance/requirements-governance.md](../docs/governance/requirements-governance.md).

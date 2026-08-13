# Sparelane Architecture

**Architecture/design source of truth** for the Sparelane payment reliability platform.

Live portal: **[architecture.sparelane.co](https://architecture.sparelane.co)**

Human entry: **[docs/START-HERE.md](docs/START-HERE.md)** · Map: **[docs/architecture-map.md](docs/architecture-map.md)** · Portal v1: **[docs/governance/architecture-v1.md](docs/governance/architecture-v1.md)**

Sparelane sits between consumers and merchants to improve the likelihood that legitimate recurring payments succeed — without becoming the merchant billing system of record, and without storing raw card data.

---

## Local development

```bash
npm install
npm run portal:dev          # Custom architecture portal (Vite)
npm run dev                 # Stock LikeC4 app (rollback / comparison)
```

## Validation

```bash
npm run validate
npm run architecture:build:stock
npm run portal:build
npm run check               # validate + both builds
```

LikeC4 is pinned to **1.59.2** (do not deploy with `latest`). See [portal rollback](docs/governance/portal-rollback.md).

## Production build

```bash
npm run architecture:build:stock   # → dist-stock/ (currently deployed)
npm run portal:build               # → dist/ (custom portal; switch after review)
```

The static site artifact for Pages is `dist/` (stock staged from `dist-stock` until custom portal cutover).

---

## Navigation

```text
01 Overview          System Context · Architecture Map · Platform Architecture
02 Experience        Experience & API
03 Payments          Payment Reliability Engine
04 Money Movement    Ledger · Settlement · Reconciliation
05 Integrations      Merchant Integration
06 Security          Trust · PCI · Privileged Access
07 Data & Events     Stores · Ownership · Events
08 Deployment        Production · Runtime · Resilience
09 Flows             Behavioural sequences
10 Implementation    Deployables · Modules · Bill→Settlement
```

### Docs

| Area | Index |
| --- | --- |
| Start | [START-HERE](docs/START-HERE.md) |
| Principles | [architecture-principles](docs/architecture-principles.md) · [glossary](docs/glossary.md) |
| Decisions | [decisions](docs/decisions/README.md) · [register](docs/decisions/decision-register.md) · [open](docs/decisions/open-decisions.md) |
| Implementation | [implementation](docs/implementation/README.md) |
| Security | [security](docs/security/README.md) |
| Operations | [operations](docs/operations/README.md) · [runbooks](docs/operations/runbooks/README.md) |
| Data | [data](docs/data/README.md) |
| Schema / ERD | [schema](docs/schema/README.md) |
| Contracts | [contracts](docs/contracts/README.md) · [OpenAPI](contracts/openapi.yaml) |
| Governance | [governance](docs/governance/README.md) |

---

## Governance (summary)

- **Accepted ADRs** bind implementation ([decision register](docs/decisions/decision-register.md)).
- **Open decisions** track unresolved vendors/product/regulatory items ([open decisions](docs/decisions/open-decisions.md)).
- Material changes follow [architecture change process](docs/governance/architecture-change-process.md) and the PR checklist.
- Do not invent final vendors in the model; keep undecided items `#proposed` or in the open register.

---

## Repository structure

```text
architecture/   LikeC4 model, views, deployment
contracts/      OpenAPI
docs/           Design, ADRs, implementation blueprint, governance
.github/        CI + Pages deploy
scripts/        validate-openapi, validate-doc-links
```

## Technology

[LikeC4](https://likec4.dev/) (`likec4` ^1.59.2).

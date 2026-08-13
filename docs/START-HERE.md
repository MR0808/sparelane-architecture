# Start Here

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-13  
**Related ADRs:** ADR-001–023 (Accepted)  
**Related Views:** `01 Overview / System Context`, `01 Overview / Architecture Map`, `01 Overview / Platform Architecture`

Sparelane architecture portal entry point. Prefer this page over browsing folders blindly.

---

## What Sparelane is

Sparelane is a payment reliability platform that sits between consumers and merchants. Merchants remain the billing system of record; Sparelane orchestrates recurring payment collection (with retries and backup methods), records collected funds in a double-entry ledger, and settles merchants only after collection is financially posted — without storing raw card data.

---

## How to use this repository

| Artefact | Use for |
| --- | --- |
| **LikeC4** ([architecture portal](https://architecture.sparelane.co)) | Visual system context, domains, trust boundaries, deployment, and dynamic flows |
| **ADRs** ([decision register](decisions/decision-register.md)) | Binding architecture decisions (Accepted) vs unresolved TBDs ([open decisions](decisions/open-decisions.md)) |
| **Contracts** ([contracts/](contracts/README.md), [`openapi.yaml`](../contracts/openapi.yaml)) | Merchant API and webhook/event shapes |
| **Implementation** ([implementation/](implementation/README.md)) | Build blueprint, modules, deployables, phases — not application code |
| **Runbooks** ([operations/runbooks/](operations/runbooks/README.md)) | Operator response for provider outages, DLQ, ledger lag, webhook backlog |

Also see the [architecture map](architecture-map.md) and [Architecture Portal v1](governance/architecture-v1.md).

---

## Recommended reading path

### Executive / Investor

1. LikeC4: **01 Overview / System Context**
2. LikeC4: **01 Overview / Platform Architecture** (or **Architecture Map**)
3. [Architecture principles](architecture-principles.md)
4. [Decision register](decisions/decision-register.md)

### Engineer

1. [Implementation blueprint](implementation/README.md)
2. LikeC4: **10 Implementation / Module Boundaries**
3. [`contracts/openapi.yaml`](../contracts/openapi.yaml) + [contracts index](contracts/README.md)
4. [Schema / ERD](schema/README.md)
5. LikeC4: **09 Flows / Payments** (start with bill ingestion and primary success)

### Payment / Banking Partner

1. LikeC4: **03 Payments / Payment Reliability Engine**
2. LikeC4: **04 Money Movement / Settlement & Reconciliation**
3. LikeC4: **05 Integrations / Merchant Integration**
4. LikeC4: **06 Security / PCI Boundary** + [PCI docs](security/pci-boundary.md)

### Security Reviewer

1. LikeC4: **06 Security / Trust Boundaries**
2. [Threat model](security/threat-model.md)
3. LikeC4: **06 Security / PCI Boundary**
4. [Audit](security/audit.md)
5. [Data classification](security/data-classification.md)

### Operations

1. LikeC4: **08 Deployment / Production Deployment**
2. [Resilience](operations/resilience-patterns.md) + [availability](operations/availability.md)
3. [Runbooks](operations/runbooks/README.md)
4. [Observability](operations/observability.md) + [alerting](operations/alerting.md)
5. [Disaster recovery](operations/disaster-recovery.md)

---

## Validation (local)

```bash
npm ci
npm run validate   # LikeC4 + OpenAPI + doc links
npm run check      # validate + LikeC4 build
```

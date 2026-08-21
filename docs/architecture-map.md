# Architecture Map

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-20  
**Related ADRs:** ADR-001–023  
**Related Views:** `01 Overview / Architecture Map`

Maps architecture areas → LikeC4 views, docs, and ADRs. Visual table of contents: **01 Overview / Architecture Map**.

**Requirements** ([requirements/](../requirements/README.md)) are the upstream statement of required behaviour and quality. They trace into architecture views, flows, ADRs, contracts, and implementation modules via frontmatter (portal: `/requirements` and `/requirements/traceability`). This map remains the domain-oriented index of architecture artefacts — it does not replace the requirements corpus.

---

## Lifecycle / status tags

Used in the LikeC4 model (`architecture/specification.c4`):

| Tag | Meaning |
| --- | --- |
| `#mvp` | In scope for MVP architecture |
| `#future` | Intentionally deferred (e.g. PayTo rail) |
| `#proposed` | Direction shown; vendor/topology still TBD |
| `#external` | Outside Sparelane control |
| `#sensitive` | Heightened confidentiality / privilege |
| `#financial` | Money-movement correctness critical |

Do not over-tag. Open vendor choices stay in [open decisions](decisions/open-decisions.md), not as false certainty in diagrams.

---

## Overview

| | |
| --- | --- |
| **Purpose** | System context and major domains |
| **Primary views** | `01 Overview / System Context`, `01 Overview / Architecture Map`, `01 Overview / Platform Architecture` |
| **Docs** | [START-HERE](START-HERE.md), [architecture-principles](architecture-principles.md), [glossary](glossary.md) |
| **ADRs** | Cross-cutting (all Accepted ADRs) |

## Experience

| | |
| --- | --- |
| **Purpose** | Consumer, merchant, admin and hosted experiences |
| **Primary view** | `02 Experience / Experience & API` |
| **Docs** | Integrations onboarding; implementation web deployable |
| **ADRs** | ADR-007, ADR-010 (hosted tokenisation UX) |

## Payments

| | |
| --- | --- |
| **Purpose** | Payment Reliability Engine, workflows, attempts, retries |
| **Primary views** | `03 Payments / Payment Reliability Engine / Core`, Extended Context; `09 Flows / Payments/*` |
| **Docs** | [docs/payments/](payments/) (lifecycle, state machine, method selection, retry, idempotency) |
| **ADRs** | ADR-001, ADR-002, ADR-003 |

## Money Movement

| | |
| --- | --- |
| **Purpose** | Ledger, collection posting, settlement, reconciliation |
| **Primary views** | `04 Money Movement /*`; `09 Flows / Money Movement /*` |
| **Docs** | [docs/money/](money/) — ledger, settlement state machine, reconciliation, wallet |
| **ADRs** | ADR-004, ADR-005, ADR-006, ADR-013, ADR-016 |

## Integrations

| | |
| --- | --- |
| **Purpose** | Merchant API, webhooks, hosted/widget paths |
| **Primary view** | `05 Integrations / Merchant Integration` |
| **Docs** | [docs/integrations/](integrations/), [contracts](contracts/README.md), [`openapi.yaml`](../contracts/openapi.yaml) |
| **ADRs** | ADR-007, ADR-008, ADR-009, ADR-022, ADR-023 |

## Security

| | |
| --- | --- |
| **Purpose** | Trust zones, PCI, authn/authz, secrets, audit, threats |
| **Primary views** | `06 Security /*` |
| **Docs** | [docs/security/](security/README.md) |
| **ADRs** | ADR-010, ADR-011, ADR-012, ADR-014 |

## Data

| | |
| --- | --- |
| **Purpose** | Domain ownership, stores, privacy, events, analytics |
| **Primary views** | `07 Data & Events /*` |
| **Docs** | [docs/data/](data/README.md), [docs/schema/](schema/README.md) |
| **ADRs** | ADR-013, ADR-014, ADR-015, ADR-020, ADR-021 |

## Deployment

| | |
| --- | --- |
| **Purpose** | Production topology, runtime sync vs async, isolation |
| **Primary views** | `08 Deployment /*` |
| **Docs** | [docs/operations/](operations/README.md) (deployables, environments, resilience) |
| **ADRs** | ADR-017, ADR-018, ADR-019 |

## Implementation

| | |
| --- | --- |
| **Purpose** | Engineering blueprint for `sparelane-platform` |
| **Primary views** | `10 Implementation /*` |
| **Docs** | [docs/implementation/](implementation/README.md), [implementation status](implementation/implementation-status.md), [Phase A](implementation/phase-a-status.md), [Phase B](implementation/phase-b-status.md), [Phase C](implementation/phase-c-status.md) |
| **ADRs** | ADR-016–019 (deploy/async); all ADRs via [traceability](implementation/architecture-traceability.md) |

## Operations

| | |
| --- | --- |
| **Purpose** | Resilience, observability, DR, runbooks |
| **Primary views** | `08 Deployment /*`, `09 Flows / Operations /*` |
| **Docs** | [operations index](operations/README.md), [runbooks](operations/runbooks/README.md) |
| **ADRs** | ADR-017, ADR-019 |

## Contracts

| | |
| --- | --- |
| **Purpose** | External API and event contracts |
| **Primary view** | (via Integrations + flows) |
| **Docs** | [contracts index](contracts/README.md), OpenAPI |
| **ADRs** | ADR-008, ADR-009, ADR-020–023 |

## Decisions

| | |
| --- | --- |
| **Purpose** | Accepted vs open architecture choices |
| **Docs** | [decisions](decisions/README.md), [register](decisions/decision-register.md), [open](decisions/open-decisions.md) |
| **ADRs** | ADR-001–023 Accepted; open register for vendors/product TBDs |

## Governance

| | |
| --- | --- |
| **Purpose** | How architecture changes |
| **Docs** | [change process](governance/architecture-change-process.md), [checklist](governance/architecture-change-checklist.md), [v1 declaration](governance/architecture-v1.md) |

---
id: SEQ-DATA-003
title: Merchant Offboarding
type: sequence
area: data
status: accepted
mvp: false
likec4: []
requirements:
  - NFR-PRIV-002
  - NFR-OPS-004
  - BUS-005
adrs:
  - ADR-012
  - ADR-013
  - ADR-007
tests:
  - SEC-TEN-001
---

# Merchant Offboarding

## Purpose

Disable ingestion and credentials, resolve in-flight workflows and settlements, archive eligible configuration, preserve reconciliation, ledger, and audit history. Financial history is not destroyed.

## Preconditions

- Authorised admin offboarding request (MFA / privileged path).
- Product rules for in-flight payment and settlement resolution.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Sparelane Admin
    participant Portal as Admin Portal
    participant BFF as Admin BFF
    participant Int as Merchant Integration Service
    participant Keys as Merchant API Keys
    participant WHD as Webhook Delivery
    participant Orch as Payment Orchestrator
    participant SS as Settlement Service
    participant MS as Merchant Service
    participant LDB as Ledger DB
    participant Aud as Audit Service

    Admin->>Portal: Initiate merchant offboarding
    Portal->>BFF: Authorised offboarding request
    BFF->>Int: Disable integration / new bill ingestion
    BFF->>Keys: Revoke API credentials
    BFF->>WHD: Disable webhook delivery where appropriate
    BFF->>Orch: Resolve in-flight payment workflows
    BFF->>SS: Resolve pending settlements
    BFF->>MS: Archive eligible configuration
    MS->>LDB: Preserve ledger / settlement financial history
    BFF->>Aud: Record offboarding Audit Event
```

## Important invariants

- Financial and reconciliation history preserved.
- New bill ingestion and credentials stopped.
- Merchant invoice SoR remains merchant-side (ADR-007).

## Failure notes

- In-flight money paths must complete or cancel under explicit rules before archival.

## Related

LikeC4 dynamic view `merchantOffboarding`.

---
id: FUN-CON-001
title: Consumer account and authentication
type: functional
area: consumer
status: accepted
priority: must
mvp: true
architecture:
  - experienceApi
  - privilegedAccess
flows:
  - merchantConnection
adrs:
  - ADR-012
contracts: []
modules:
  - Experience
  - Identity
tests: []
---
# FUN-CON-001 — Consumer account and authentication

## Requirement

Consumers must authenticate to Sparelane consumer experiences before managing connections, payment methods, or initiating Retry Now.

## Rationale

Distinct consumer identity is required for tenant-safe access to consumer-scoped data.

## Acceptance Criteria

- Unauthenticated consumers cannot mutate payment methods or connections.
- Authenticated sessions are scoped to the consumer identity.

## Notes

MVP consumer experience scope.

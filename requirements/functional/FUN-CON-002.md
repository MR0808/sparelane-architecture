---
id: FUN-CON-002
title: Connect to a merchant
type: functional
area: consumer
status: accepted
priority: must
mvp: true
architecture:
  - experienceApi
  - merchantIntegration
flows:
  - merchantConnection
adrs:
  - ADR-007
contracts: []
modules:
  - Experience
  - Merchant Integrations
tests: []
---
# FUN-CON-002 — Connect to a merchant

## Requirement

Consumers must be able to establish a connection to a participating merchant so bills and payment orchestration can proceed.

## Rationale

Connection is the link between consumer identity and merchant billing relationship.

## Acceptance Criteria

- A successful connection associates consumer and merchant for subsequent bill presentation.
- Connection state is visible to the consumer experience.

## Notes

MVP consumer experience scope.

---
id: FUN-NOT-001
title: Consumer notification contact ownership
type: functional
area: notifications
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - experienceApi
adrs:
  - ADR-031
contracts: []
modules:
  - Notifications
  - Consumers
tests:
  - CON-NOT-001
designs:
  - SEQ-NOT-004
---
# FUN-NOT-001 — Consumer notification contact ownership

## Requirement

Consumer notification destinations must be stored in a dedicated contact model owned by the Notifications module. Authentication/IdP email must not automatically become a notification destination.

## Rationale

Separates authentication identity from product communication destinations (privacy, consent, B0/B2 boundary).

## Acceptance Criteria

- Contact add creates `PENDING` row with normalised email.
- Verification transitions contact to `ACTIVE`.
- Platform never reads `users.email` for payment notification delivery without explicit contact row.
- At most one `ACTIVE` default email per consumer via explicit `is_default`.
- Consumer deletion revokes contacts and blocks future sends.

## Notes

Portal/BFF management for G2. See ADR-031.

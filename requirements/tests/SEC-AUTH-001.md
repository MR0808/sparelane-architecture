---
id: SEC-AUTH-001
title: Invalid merchant API credential rejected
type: security
status: specified
relatedRequirements:
  - FUN-MER-001
  - FUN-MER-002
  - NFR-SEC-003
mvp: true
---

# SEC-AUTH-001 — Invalid merchant API credential rejected

## Purpose

Invalid credentials cannot call Merchant API.

## Preconditions

- Two merchant tenants; valid and invalid credentials.

## Scenario

Attempt cross-tenant or invalid-auth access.

## Expected result

Denied with no data leakage.

## Implementation status

`specified`

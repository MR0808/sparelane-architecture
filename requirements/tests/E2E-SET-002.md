---
id: E2E-SET-002
title: Settlement failure
type: e2e
status: specified
relatedRequirements:
  - FUN-SET-004
relatedFlows:
  - settlementFailure
mvp: true
---

# E2E-SET-002 — Settlement failure

## Purpose

Verify settlement lifecycle path `settlementFailure`.

## Preconditions

- Collected funds posted to ledger where required.
- Fake settlement partner scripted.

## Scenario

Execute settlement path for settlement failure.

## Expected result

Settlement state machine and reconciliation behaviour match ADRs.

## Implementation status

`specified`

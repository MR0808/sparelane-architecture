---
id: E2E-SET-001
title: Successful settlement
type: e2e
status: specified
relatedRequirements:
  - FUN-SET-001
  - FUN-SET-002
relatedFlows:
  - merchantSettlement
mvp: true
---

# E2E-SET-001 — Successful settlement

## Purpose

Verify settlement lifecycle path `merchantSettlement`.

## Preconditions

- Collected funds posted to ledger where required.
- Fake settlement partner scripted.

## Scenario

Execute settlement path for successful settlement.

## Expected result

Settlement state machine and reconciliation behaviour match ADRs.

## Implementation status

`specified`

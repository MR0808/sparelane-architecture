---
id: E2E-PAY-002
title: Backup payment success
type: e2e
status: specified
relatedRequirements:
  - FUN-PAY-004
  - BUS-005
relatedFlows:
  - backupRecovery
mvp: true
---

# E2E-PAY-002 — Backup payment success

## Purpose

Primary fails; ordered backup succeeds.

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Fake PSP returns scripted outcomes.

## Scenario

Drive the `backupRecovery` dynamic flow end-to-end.

## Expected result

Workflow and attempt states match architecture; merchant/consumer outcomes consistent.

## Implementation status

`specified`

---
id: FIN-INV-08
title: Cross-merchant settlement isolation
type: financial-invariant
status: specified
relatedRequirements:
  - NFR-SEC-001
mvp: true
---

# FIN-INV-08 — Cross-merchant settlement isolation

## Purpose

Merchant A can never settle against Merchant B data.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — automated in future `sparelane-platform` CI.

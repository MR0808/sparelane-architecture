---
id: FIN-INV-10
title: Safe worker restart
type: financial-invariant
status: specified
implementationProgress: foundation_prerequisite
relatedRequirements:
  - NFR-REL-002
mvp: true
---

# FIN-INV-10 — Safe worker restart

## Purpose

Worker restart cannot create duplicate financial effect.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — product financial E2E is **not** executable.

Phase A demonstrated a **foundation prerequisite** (worker restart/redelivery on a non-financial fixture). That is not FIN-INV-10 verification.

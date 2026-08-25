---
id: OPS-RUN-001
title: Required Phase I runbooks present with safe/unsafe actions
type: operations
status: specified
implementationProgress: foundation_prerequisite
relatedRequirements:
  - NFR-OPS-004
  - NFR-OPS-006
relatedFlows: []
mvp: true
---

# OPS-RUN-001 — Required runbooks present with safe/unsafe actions

## Purpose

Prove the five architecture-required runbooks exist and retain safe vs unsafe actions consistent with prior ADRs (no blind financial replay) per [ADR-035](../../docs/decisions/ADR-035-pilot-readiness-local-evidence-policy.md).

## Preconditions

- Architecture runbook stubs
- Platform Phase I0 operator docs aligned or linked

## Scenario

1. Locate each required runbook (payment outage, settlement outage, ledger posting failure, DLQ replay, webhook backlog).
2. Assert sections: symptom, impact, checks, safe actions, unsafe actions, escalation, recovery validation.
3. Assert unsafe actions prohibit blind payment/settlement replay and financial corrections.
4. Assert DLQ replay references closed webhook-only catalogue ([ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)).

## Expected result

All five runbooks present and policy-aligned.

## Implementation status

`specified` — **local Fake evidence PASS** on platform (`npm run test:phase-i0`). Live-provider runbook procedures remain BLOCKED_EXTERNAL.

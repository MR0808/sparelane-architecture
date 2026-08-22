---
id: CON-WEBHOOK-001
title: Signed webhook envelope shape
type: contract
status: specified
relatedRequirements:
  - FUN-MER-006
  - NFR-SEC-005
mvp: true
---

# CON-WEBHOOK-001 — Signed webhook envelope shape

## Purpose

Webhook envelope, headers, and HMAC-SHA256 signing string match [ADR-030](../../docs/decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md) contracts.

## Preconditions

- Webhook envelope, events, and signing docs current.

## Scenario

Validate webhook JSON key order, catalogue types, header names, and signature input `timestamp.rawBody`.

## Expected result

No contract drift for MVP surfaces.

## Implementation status

`specified`

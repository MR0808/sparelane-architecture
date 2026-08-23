---
id: OD-035
title: Transactional email provider selection
category: infrastructure
blockingStage: pilot
status: open
related:
  - ADR-031
  - INT-NOT-001
  - OD-025
---

# OD-035 — Transactional email provider selection

## Decision required

Select production transactional email vendor(s) for consumer (and future merchant) email delivery.

## Why it matters

Sandbox/pilot/production cannot send real email without an approved provider. ADR-031 requires fail-closed behaviour without one.

## Blocking stage

`pilot` — blocks real email in sandbox/pilot/production. Does **not** block local G2 with FakeEmailProvider.

## Status

`open`

## Notes

ADR-031 freezes provider-neutral `EmailProvider` port and Fake adapter for local/CI. Vendor evaluation should use [INT-NOT-001](../../../requirements/integrations/INT-NOT-001.md) acceptance criteria.

Provider API credentials are Restricted ([secrets-management](../../security/secrets-management.md); OD-025).

Do not silently fall back to Fake in non-local environments.

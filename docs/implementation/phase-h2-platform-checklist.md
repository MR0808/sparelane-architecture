# Phase H2 — platform implementation checklist (architecture → platform)

**Status:** Architecture gate PASS ([ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)).  
**Platform H2:** NOT STARTED — do not treat this checklist as implemented.

Implement in `sparelane-platform` only after this gate. Do not invent policy beyond ADR-034.

## Persistence

- [ ] `DeadLetterItem` model + migration (Operational DB)
- [ ] `public_id` `dlq_…` unique
- [ ] unique `(work_type, source_identity)`
- [ ] typed `replay_reference` JSON (pointer only)
- [ ] statuses: OPEN / REPLAY_REQUESTED / REPLAYING / RESOLVED / REPLAY_FAILED
- [ ] `OperatorReplayRequest` model + `rpl_…` + execute-once semantics
- [ ] No admin-owned copy of domain entities
- [ ] No raw secret/PII payload columns

## DLQ creation integration

- [ ] Merchant webhook automatic exhaustion (`WebhookDelivery` FAILED) creates/updates replayable DLQ (`merchant.webhook.delivery`)
- [ ] Consumer notification automatic exhaustion may create inspect-only DLQ (`consumer.notification.delivery`) — **no** replay action
- [ ] Financial poison/exhaustion may create inspect-only DLQ (`financial.work`) — **no** replay action
- [ ] Payment/settlement UNKNOWN paths remain reconciliation — not generic replayable DLQ work
- [ ] Idempotent create on redelivery (one active logical row per identity)

## Capabilities & authz

- [ ] `admin.dlq.view`
- [ ] `admin.webhook.replay`
- [ ] Deny unknown / wildcard replay capabilities
- [ ] Reject financial / notification replay actions with durable security signal where appropriate

## Admin UI

- [ ] `/admin/dlq` list (safe columns)
- [ ] `/admin/dlq/[dlqPublicId]` detail
- [ ] Replay eligibility badge
- [ ] Financial / notification items: read-only + “manual replay prohibited”
- [ ] No “Replay Any”
- [ ] No secret/raw payload display

## Replay UI (webhook only)

- [ ] Reason field (16–500)
- [ ] Fresh MFA state (PrivilegedAuthenticationContext ≤15m)
- [ ] MEDIUM risk warning
- [ ] Explicit replay action for eligible webhook DLQ only

## Admin BFF

- [ ] `GET /admin/v1/dead-letters`
- [ ] `GET /admin/v1/dead-letters/:id`
- [ ] `POST /admin/v1/dead-letters/:id/replay` (creates `rpl_…` + outbox; does not hold open for HTTP)
- [ ] Session auth only; not Merchant `/v1`
- [ ] No GET mutations

## MFA / reason / concurrency

- [ ] MFA ≤15 minutes inclusive on replay request
- [ ] Reason required
- [ ] At most one active replay request per DLQ item
- [ ] Second concurrent request denied or collapsed per ADR-034
- [ ] New intentional retry = new `rpl_` + new reason

## Worker / webhook replay

- [ ] Outbox command `ReplayWebhookDelivery` (no `ReplayAnyWork`)
- [ ] notification-worker executes transport
- [ ] Reuse same `WebhookDelivery`; append attempt 6+
- [ ] Same `evt_` + immutable body; fresh timestamp/HMAC
- [ ] Endpoint must be ACTIVE; do not reactivate
- [ ] No subscription recheck requirement
- [ ] No automatic 5-attempt reschedule after manual failure
- [ ] Success: delivery FAILED→SUCCEEDED; DLQ RESOLVED
- [ ] Failure: attempt recorded; DLQ REPLAY_FAILED → OPEN
- [ ] Admin never calls merchant HTTP directly

## Financial / notification guards

- [ ] Financial replay rejected
- [ ] Notification replay rejected / not exposed
- [ ] No Bill / PaymentWorkflow / PaymentAttempt / Journal / Settlement mutation from replay paths
- [ ] SKIPPED / NO_ACTIVE_CONTACT never offered as replayable

## Audit / security

- [ ] Audit: requested / executed / succeeded / failed / denied
- [ ] Safe metadata only
- [ ] Security events for unauthorised / prohibited / revoked-endpoint / missing source
- [ ] HTTP 5xx after authorised replay is operational, not security incident

## Tests (map to architecture specs)

- [ ] ADM-DLQ-001 / ADM-DLQ-002
- [ ] ADM-REPLAY-001 … ADM-REPLAY-006
- [ ] WH-REPLAY-001
- [ ] Restart / concurrency / financial rejection coverage
- [ ] Do not mark architecture specs verified until platform evidence exists

## Explicit non-goals

- [ ] Confirm absent: notification replay, financial replay, corrections, lifecycle mutations, break-glass, impersonation, dismiss MVP, generic queue replay

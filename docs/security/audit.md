# Audit Architecture

The Audit Service records security-relevant and financially sensitive actions in a durable Audit Store.

**H0:** admin may **read** audit records via `admin.audit.view` — append-only; no update/delete APIs. See [ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md).

**H1:** privileged grant request/approve/deny/execute/fail must emit durable audit per [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md). No financial mutation audit from admin in H1 — grant management only. Platform H1 local evidence: `sparelane-platform` `npm run test:phase-h1` (production IdP MFA not claimed; OD-024 open).

**H2:** operator webhook replay request/execute/success/fail/deny must emit durable audit per [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md). No financial mutation from replay.
## Events that should be audited (conceptual)

- login / security events (success and material failure where useful)
- credential issuance / rotation / revocation
- **privileged admin mutations** — H1 grant catalogue; H2 webhook replay catalogue; other mutations deferred
- merchant configuration changes (webhooks, integration mode, etc.)
- payment-sensitive actions
- settlement-sensitive actions
- consumer notification contact lifecycle (add, verify, default change, disable, revoke) — **not** routine automated sends
- manual webhook replay / retry actions by authorised operators (H2 — ADR-034)
- role / permission / **platform admin grant changes** (H1 via PrivilegedActionRequest)
## H1 privileged grant audit taxonomy

Mandatory durable audit for grant privileged steps ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md); [ADR-012](../decisions/ADR-012-privileged-admin-audit.md)):

| Action class | When |
| --- | --- |
| Privileged **request** create | `admin.grant.create` / `admin.grant.revoke` request submitted |
| Privileged **approval** | Approver approves pending request |
| Privileged **deny** | Approver denies pending request |
| Privileged **execution** | Approved request applied (grant create/revoke takes effect) |
| Privileged **fail** | Execute rejected after approval (e.g. last-admin race) |

Required fields (conceptual): `actor_user_public_id`, `action`, `privileged_action`, `request_public_id`, `target_type` / `target_public_id`, `result`, `reason`, `mfa_satisfied_at`, correlation IDs, `payload_fingerprint`. No secrets in payloads.

## H2 operator replay audit taxonomy

Mandatory durable audit for webhook replay ([ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)):

| Action class | When |
| --- | --- |
| Replay **requested** | `OperatorReplayRequest` (`rpl_…`) created |
| Replay **executed** | Worker begins transport attempt |
| Replay **succeeded** | Merchant HTTP 2xx / delivery SUCCEEDED |
| Replay **failed** | Manual attempt failed / eligibility failure after accept |
| Replay **denied** | Authz, MFA, reason, or catalogue rejection |

Safe metadata only: `dlq_…`, `rpl_…`, work type, `evt_…` / source public ids, admin `usr_…`, reason, outcome. **No** raw payload / secrets.

**Security signals (not ordinary merchant 5xx):** unauthorised replay; attempted financial/prohibited replay; replay against non-ACTIVE endpoint; missing/tampered source identity.

## H0 audit completeness task

Perform an **inventory** of meaningful B–G actions and classify each:

| Class | Meaning |
| --- | --- |
| **MUST audit** | Already explicitly required by Accepted architecture |
| **Operational record only** | Domain/outbox/delivery tables sufficient |
| **Not required** | Routine automated processing or H0 read-only admin inspection |
| **Gap** | Architecture requires audit but platform omits — fix in H0 only if clear omission |

Do not invent new audit policy or audit every admin GET in H0.

## H0 admin read audit policy

- **Routine read-only admin inspection:** not individually audited in H0
- **Denied admin access:** security events per existing A7 semantics — not necessarily business audit rows for every denied GET
- **Sensitive PII access audit:** deferred until support/privacy capabilities exist

## Audit record fields (conceptual)

| Field | Purpose |
| --- | --- |
| Actor | Who initiated the action (user, service, system) |
| Action | What was attempted |
| Target | Object/resource affected |
| Timestamp | When |
| Context | Environment, IP/device metadata where appropriate |
| Result | Success / deny / failure |
| Correlation / reference IDs | Link to bill, workflow, settlement, webhook event, etc. |

## Admin audit view (H0)

- Paginated read-only query via `/admin/v1/audit`
- Safe filters: action, target type, time range, request/correlation ID
- No arbitrary sensitive metadata search
- **Audit export / SIEM:** deferred

## Sensitivity rules

- do **not** log secrets, raw API keys, webhook signing secrets, passwords, session tokens or raw payment credentials
- do **not** log PAN/CVV (Sparelane should not possess them)
- minimise personal data in audit payloads; prefer identifiers and references
- do **not** store raw notification email addresses in audit context JSON

Audit retention, immutability technology and SIEM integration remain TBD.

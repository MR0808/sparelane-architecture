---
id: FUN-ADM-006
title: Platform admin grant lifecycle
type: functional
area: admin
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - privilegedAccess
  - adminPrivilegedAction
adrs:
  - ADR-014
  - ADR-020
  - ADR-032
  - ADR-033
contracts:
  - docs/security/admin-access.md
  - docs/security/authorisation.md
modules:
  - Identity
  - Admin Control Plane
tests:
  - ADM-GRANT-001
  - ADM-GRANT-002
  - ADM-GRANT-003
  - ADM-AUTH-001
---
# FUN-ADM-006 — Platform admin grant lifecycle

## Requirement

`PlatformAdminGrant` lifecycle for H1 is create and revoke under dual control. Grant status is `active` | `revoked`. Only `active` confers `AdminPrincipal`. Targets use mandatory User public ID `usr_…`.

## Rationale

ADR-033 extends ADR-032 authority without inventing other privileged mutations.

## Acceptance Criteria

- `admin.grant.create` results in an `active` grant for the target `usr_…` (create or reactivate) only after approved PrivilegedActionRequest execute.
- `admin.grant.revoke` sets grant `revoked`; authority removed on the next request without restart.
- Self-grant is prohibited.
- Self-approve is prohibited.
- Self-revoke is allowed only if another active platform admin approves and the subject is not the last active admin.
- Last-active-admin protection: revoke that would leave zero active grants is rejected at request validation and at execute.
- Bootstrap of the first admin uses operational runbook / controlled DB procedure / authorised migration — never `ENV_ADMIN_EMAIL`.
- Email, auth subject, and internal UUID are not accepted as grant targets in admin APIs.

## Notes

Capability `admin.grant.manage` gates request/approve/execute. Merchant suspend, user disable, replay, and additional roles remain deferred.

## Implementation notes

implementationStatus: implemented — platform H1 PASS (local evidence in sparelane-platform `npm run test:phase-h1`). Production IdP MFA still blocked by OD-024 provider readiness.

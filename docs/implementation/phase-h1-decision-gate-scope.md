# Phase H1 — architecture decision-gate scope

**Status:** PASS — Option A (Admin Grant Management Only)  
**Binding ADR:** [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)  
**Gate record:** [phase-h1-admin-decision-gate](./phase-h1-admin-decision-gate.md)  
**Prerequisite:** Phase H0 platform evidence **PASS** (read-only admin control plane).

Platform **H1 may begin grant-management implementation only**. Canonical **Phase H** is **not** complete — deferred items below remain separately gated.

This document records the **exact architecture decisions** bound or deferred for H1. It does **not** invent policy beyond ADR-033.

## Must resolve before H1 implementation — status

1. **Privileged mutation catalogue** — **Resolved:** closed enum `admin.grant.create`, `admin.grant.revoke` only (ADR-033). All other mutations explicitly out of H1 Option A.
2. **Admin grant-management rules** — **Resolved:** create/revoke; `usr_…` targeting; self-grant prohibited; self-approve prohibited; self-revoke only with another admin’s approval and not last admin; last-active-admin protection; bootstrap via operational runbook/DB procedure — never `ENV_ADMIN_EMAIL`.
3. **Mandatory reason / justification** — **Resolved:** required on PrivilegedActionRequest; 16–500 chars; no secrets/PII dumps.
4. **OD-024 MFA / re-auth** — **Resolved (policy) / provider open:** recent MFA max age 15 minutes for request/approve/execute via provider-neutral `PrivilegedAuthenticationContext`; OD-023/OD-024 still open for IdP — production admin MFA blocked until satisfiable.
5. **OD-026 dual-control action matrix** — **Resolved for grants (Option B):** requester≠approver; both active `platform_admin`; one approval; 24h expiry; fingerprint immutability. Break-glass NOT SUPPORTED. Non-grant dual-control matrices deferred.
6. **Durable DLQ / operator persistence** — **Deferred:** non-blocking for H1 Option A (grant management does not require DLQ store).
7. **DLQ replay semantics** — **Deferred:** non-blocking for H1 Option A.
8. **Webhook replay semantics** — **Deferred:** non-blocking for H1 Option A.
9. **Replay identity / idempotency** — **Deferred** for delivery replay; **Resolved** for approved PrivilegedActionRequest execute-once idempotency (grant path).
10. **Financial-event stronger replay controls** — **Deferred:** non-blocking for H1 Option A.
11. **PII / support lookup policy** — **Deferred:** non-blocking for H1 Option A; H0 exact public-ID reads unchanged.
12. **Financial correction policy** — **Deferred:** non-blocking for H1 Option A.
13. **Break-glass decision** — **Resolved:** **NOT SUPPORTED**.
14. **Impersonation decision** — **Resolved:** **NOT SUPPORTED**.
15. **Audit requirements for privileged actions** — **Resolved:** mandatory audit fields for request/approve/deny/execute/fail (ADR-033 + ADR-012).

## Explicitly out of this gate’s invention scope

- Implementing any non-grant mutation/replay UI or API under this PASS
- Closing OD-024 IdP/provider choice by assertion
- Expanding H0 read models into PII search without a bound support policy

## Exit criterion

**H1 ADMIN DECISION GATE: PASS** — fifteen items above are Accepted (ADR-033) or explicitly Deferred as non-blocking for Option A, with enough precision that platform can implement **grant management** without inventing security policy.

See [phase-h1-admin-decision-gate](./phase-h1-admin-decision-gate.md).

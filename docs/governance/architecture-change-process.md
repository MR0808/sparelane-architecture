# Architecture Change Process

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-13  
**Related ADRs:** —  
**Related Views:** —

When and how to change the Sparelane architecture portal.

---

## When an architecture change is required

Update architecture (not only product code) when any of the following apply:

- New external integration (PSP, bank, KYC, IdP, messaging, etc.)
- New financial flow or money-movement behaviour
- New persistent data category or store ownership change
- New deployment / process boundary for Tier-1 workloads
- Security or trust-boundary change
- Change to public API or webhook contracts
- Change to a financial invariant
- Change that contradicts an **Accepted** ADR (requires superseding ADR)

Cosmetic doc typos and non-behavioural clarifications may proceed without a full ADR.

---

## Workflow

```text
Requirement
→ Impact assessment
→ Update LikeC4 (model/views)
→ Update dynamic flow if behaviour changes
→ ADR if material decision (use ADR-TEMPLATE)
→ Update schema/contracts if affected
→ Update implementation/ops/security docs if affected
→ Update open decisions if a TBD is resolved or newly discovered
→ Review (use change checklist)
→ Merge
→ Deploy architecture portal
```

Use [architecture-change-checklist.md](architecture-change-checklist.md) on the PR.

---

## Decision rules

| Situation | Action |
| --- | --- |
| Pattern already Accepted | Implement consistently; no new ADR |
| New material choice | New ADR (**Proposed** → gate → **Accepted**) |
| Contradicts Accepted ADR | New ADR that **Supersedes** prior; do not silently diverge |
| Vendor still TBD | Record in [open-decisions.md](../decisions/open-decisions.md); keep `#proposed` in model |

**Accepted ADRs bind implementation** until superseded.

---

## Validation before merge

```bash
npm run validate
npm run build
```

See [PR template](../../.github/pull_request_template.md).

# Document Metadata Convention

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-13  

Recommended header for key portal/index documents (not mandatory on every historical file).

## Fields

```markdown
**Status:** Current | Draft | Deprecated  
**Owner:** <team or TBD>  
**Last Reviewed:** YYYY-MM-DD  
**Related ADRs:** ADR-00X, …  
**Related Views:** `01 Overview / …`
```

| Field | Meaning |
| --- | --- |
| Status | Editorial lifecycle of the doc |
| Owner | Accountable team (names TBD until CODEOWNERS filled) |
| Last Reviewed | Last intentional architecture review of this page |
| Related ADRs | Binding decisions this doc elaborates |
| Related Views | LikeC4 titles for navigation |

## Apply in this phase

Prefer metadata on portal entry points: `START-HERE`, `architecture-map`, governance indexes, domain `README`s. Do not retrofit every leaf doc unless editing them for other reasons.

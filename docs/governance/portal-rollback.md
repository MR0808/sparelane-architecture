# Portal Rollback (Stock LikeC4)

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-13  

How to return to the stock LikeC4 static application if the custom portal must be rolled back.

## What stays unchanged

- `architecture/` LikeC4 sources
- `docs/`, `contracts/`, `scripts/`
- Accepted ADRs and open decisions

No architecture source files need to change for rollback.

## Rollback steps

1. Ensure stock build works:

```bash
npm run architecture:build:stock
```

2. Point production Pages build at the stock command (or restore `likec4/actions` stock build).

   Current production workflow (stock) uses pinned LikeC4 **1.59.2**. Prefer:

```yaml
# Option A — local npm stock build
- run: npm ci
- run: npm run architecture:build:stock
# upload ./dist-stock as Pages artifact (or copy to dist/)
```

   or keep `likec4/actions` with **`likec4-version: 1.59.2`** (never `latest`).

3. Redeploy GitHub Pages.

4. Optionally keep `portal/` in the repo unused until fixed — deleting it is not required for rollback.

## Scripts

| Script | Purpose |
| --- | --- |
| `architecture:build:stock` | Stock LikeC4 app → `dist-stock/` |
| `portal:build` | Custom portal → `dist/` |
| `portal:dev` | Custom portal local server |

## Version pin

Local and production must use the same LikeC4 version (`1.59.2`). Do not deploy with `likec4-version: latest`.

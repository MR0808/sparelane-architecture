# OpenAPI / Contract Validation

Merchant API OpenAPI 3.1 lives at [`contracts/openapi.yaml`](../../contracts/openapi.yaml).

## Dependency

`@apidevtools/swagger-parser` is a **devDependency** used by a small Node script. No application framework.

## Command

```bash
npm run openapi:lint
```

Equivalent:

```bash
node scripts/validate-openapi.mjs
```

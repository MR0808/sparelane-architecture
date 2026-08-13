# API Versioning

## URI major versioning

```text
/v1/...
```

## Compatibility rules

- Breaking changes require a new major version (`/v2`)
- Additive optional response fields are backwards compatible
- Removing/renaming fields, changing meanings, or tightening required request fields is breaking
- Webhook event types follow the same spirit: additive optional `data` fields OK; removing/renaming is breaking and may require versioned event types or dual-publish period

See [ADR-022](../decisions/ADR-022-versioned-external-contracts.md).

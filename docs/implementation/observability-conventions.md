# Observability Conventions

## Standard correlation fields

- `requestId` / `X-Request-Id`
- `correlationId`
- `merchantId` (public where safe)
- `paymentWorkflowId`
- `paymentAttemptId`
- `settlementId`
- `eventId`

## Rules

- Redact sensitive fields
- No PAN/CVV
- No secrets / API keys / signing secrets
- Avoid logging full provider payloads by default
- Prefer structured logs + metrics + traces (OpenTelemetry-compatible)
- Alert on operational issues, not every soft decline

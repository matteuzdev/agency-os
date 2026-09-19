# Runtime Validation — v0.1

Validated: 2026-09-19

The runtime source currently in `agency-os/runtime` was reconstructed from the repository and executed with Node's native test runner.

Result:
- tests: 11
- passed: 11
- failed: 0
- skipped: 0

Validated behaviors:
- client context isolation;
- draft execution without approval;
- publish action held for approval;
- missing connector returns BLOCKED_CONNECTION;
- idempotency duplicate detection;
- connector registry;
- connector healthcheck;
- WordPress routing to Wally;
- VPS routing to Bruno;
- unknown capability fallback to Orion;
- task dependency planning.

This validates the minimum runtime mechanics. It does not certify external provider adapters, OAuth credentials, production VPS security, or live-client behavior.

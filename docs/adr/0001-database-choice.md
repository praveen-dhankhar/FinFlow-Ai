# ADR-0001: Database Choice (H2 for Dev/Test, PostgreSQL for Prod)

## Status
Accepted

## Context
- Need fast local development and CI tests
- Need reliable, scalable production storage

## Decision
- Use H2 for dev/test environments
- Use PostgreSQL for production deployments

## Consequences
- Must test cross-database compatibility
- TestContainers suite ensures PG correctness
- Migrations validated against both

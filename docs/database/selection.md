# Database Selection Guide

- Use H2 when:
  - Rapid local development, unit/integration tests
  - No persistence beyond process lifetime is required
- Use PostgreSQL when:
  - Production/staging deployments
  - Performance, reliability, advanced SQL features (JSON, indexes), and persistence are needed

## Switching

- H2 (dev): `SPRING_PROFILES_ACTIVE=dev` or `docker compose up`
- PostgreSQL (prod): `SPRING_PROFILES_ACTIVE=prod` or `docker compose -f docker-compose.prod.yml up`

## Feature comparison

- Transactions: parity
- JSON/Full-text: PostgreSQL only
- Performance realism: PostgreSQL
- Memory footprint: H2 lower for local

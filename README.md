# Finance Forecast App

Production-ready Spring Boot application with multi-database support: H2 for rapid development and PostgreSQL for production.

## Quick Start

- Dev (H2):
  - Prereqs: Java 21, Maven, Docker (optional)
  - Local: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`
  - Docker: `docker compose up -d --build`
- Prod (PostgreSQL):
  - Docker: `docker compose -f docker-compose.prod.yml up -d --build`

Health: `http://localhost:8080/actuator/health`

OpenAPI: `http://localhost:8080/swagger-ui/index.html`

## Databases

- H2 (dev/test): In-memory; fastest feedback. See `application.yml` dev/test profiles
- PostgreSQL (prod): Reliable, scalable. See `docker-compose.prod.yml`

See also:
- Database selection: `docs/database/selection.md`
- Migration H2 → PostgreSQL: `docs/database/migration-h2-to-postgres.md`
- Testing strategy: `TESTING.md`

## Running Tests

- H2 suite: `mvn verify`
- PostgreSQL (TestContainers): `mvn -P integration-test -Dspring.profiles.active=integration-test verify`

## Deployment

- Dev: `ops/scripts/deploy.sh dev`
- Prod: `ops/scripts/deploy.sh prod`
- Rollback: `ops/scripts/rollback.sh`

PostgreSQL backup/restore:
- Backup: `ops/scripts/backup_postgres.sh`
- Restore: `ops/scripts/restore_postgres.sh <backup.sql.gz>`

More details:
- Production deployment guide: `docs/deployment/production.md`
- Operations runbooks: `docs/operations/runbooks.md`
- Developer workflow: `docs/development/workflow.md`
- Performance: `docs/performance/guide.md`
- Readiness checklist: `docs/readiness/checklist.md`

## Observability

- Actuator, Micrometer metrics, logs configured in `application.yml`
- Postgres exporter exposed at `:9187` in prod compose

## Security

- Externalize secrets via env vars in prod
- See `docs/deployment/production.md` and readiness checklist



# Production Deployment (PostgreSQL)

## Checklist
- [ ] Secrets managed via env/secret store
- [ ] PostgreSQL provisioned (storage, backups, monitoring)
- [ ] Migrations applied (Flyway)
- [ ] Observability: metrics, logs, alerts
- [ ] Security: network policies, SSL/TLS, users/roles

## Environment
- `SPRING_PROFILES_ACTIVE=prod`
- JDBC URL `jdbc:postgresql://<host>:5432/finance`
- HikariCP tuned via `application.yml` or env

## Security Best Practices
- Least privilege DB user, rotate credentials
- TLS for DB connections
- Restrict network access to app subnets

## Monitoring
- Postgres exporter `:9187`
- Dashboards: latency, connections, locks, slow queries
- Alerts: error rate, saturation, backup failures

## Deploy
- Compose: `docker compose -f docker-compose.prod.yml up -d --build`
- Blue/Green: run duplicate stack, switch LB, verify, decommission

## Rollback
- `ops/scripts/rollback.sh`

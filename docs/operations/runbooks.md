# Operations Runbooks

## Backup/Restore
- Backup: `ops/scripts/backup_postgres.sh`
- Restore: `ops/scripts/restore_postgres.sh <file.sql.gz>`
- Verify: restore to staging and validate checksums

## Monitoring & Alerting
- Monitor exporter `:9187`, app actuator
- Alerts: DB unavailable, high latency, connection saturation, lock waits

## Incidents
- Triage: identify scope, impact, current load
- Actions: scale app, reduce traffic, failover DB (if HA), rollback

## Capacity Planning
- Track QPS, connections, CPU/IO, storage growth
- Plan read replicas, larger instances, or caching

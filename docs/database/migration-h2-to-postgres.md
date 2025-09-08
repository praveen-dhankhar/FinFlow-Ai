# Migration: H2 → PostgreSQL

## Steps
1. Freeze app writes; take backup (if any persistent H2 file used)
2. Generate schema from Flyway on PostgreSQL: start `docker-compose.prod.yml`
3. Export data from H2 (if needed) using custom export or app endpoints
4. Import into PostgreSQL with `psql` or batch jobs
5. Validate counts, checksums, business invariants
6. Flip profile to `prod`; run smoke tests

## Scripts
- Backup: `ops/scripts/backup_postgres.sh`
- Restore: `ops/scripts/restore_postgres.sh`

## Performance Tuning
- Verify indexes, analyze queries, set pool sizes (Hikari)
- Check `work_mem`, `shared_buffers`, `effective_cache_size` for target infra

## Troubleshooting
- Type mismatches: cast during import; ensure `MODE=PostgreSQL` in H2 test if applicable
- Constraint failures: import order and disable/enable FKs if necessary
- Encoding/timezone: ensure `UTF-8`, `UTC`

# Production Readiness Checklist

## Security
- [ ] Secrets not in repo; env/secret store used
- [ ] Least-privilege DB user; network restricted; SSL enabled

## Performance
- [ ] Benchmarks captured; SLOs met
- [ ] Pool sizes tuned; slow queries analyzed and indexed

## Monitoring
- [ ] Metrics and logs integrated; alerts configured
- [ ] Dashboards for DB and app health

## DR/Backups
- [ ] Automated backups; tested restores
- [ ] PITR or equivalent evaluated

## Documentation
- [ ] README updated; runbooks and guides complete
- [ ] Migration and rollback procedures tested

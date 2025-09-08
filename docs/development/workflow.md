# Developer Workflow

## Quick Start (H2)
- `mvn spring-boot:run -Dspring-boot.run.profiles=dev`
- Or `docker compose up -d --build`

## Switching to PostgreSQL
- Local Docker: `docker compose -f docker-compose.prod.yml up -d`
- Set `SPRING_PROFILES_ACTIVE=prod`

## Testing
- `mvn verify` (H2)
- `mvn -P integration-test -Dspring.profiles.active=integration-test verify` (PostgreSQL)

## Debugging
- Enable H2 console in dev, log SQL as needed
- Use `MockMvc` for API tests, TestContainers for PG

## Performance
- See `docs/performance/guide.md` for profiling, baselines, pool tuning

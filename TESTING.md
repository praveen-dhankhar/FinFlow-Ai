# Multi-Database Testing Strategy

## Profiles
- H2 (dev/test): fast unit + integration
- PostgreSQL (integration-test): TestContainers
- Staging/Prod: PostgreSQL only (observability-only tests)

## Test Types
- Unit: pure Java, H2 not needed
- H2 Integration: @SpringBootTest + H2, Flyway disabled/enabled based on need
- PostgreSQL Integration: @SpringBootTest(profile=integration-test) with TestContainers
- API (MockMvc): runs on both H2 and PostgreSQL
- Performance: small baselines on H2; functional+pool tuning on PostgreSQL
- Migration: Flyway migrations run on both DBs; validate integrity and rollback

## How to Run
- H2 full suite: `mvn verify`
- PostgreSQL suite: `mvn -P integration-test -Dspring.profiles.active=integration-test verify`
- Single test: `mvn -Dtest=ClassName#method test`

## Data Isolation
- Use @Transactional test methods where appropriate
- Clear repositories in @BeforeEach for non-transactional tests

## Benchmarks
- H2 baselines: validate algorithmic paths and API latency
- PostgreSQL: verify indexes/queries via execution time and metrics

## CI
- Matrix workflow: H2 + PostgreSQL
- Artifacts: surefire reports and perf logs from actuator/metrics

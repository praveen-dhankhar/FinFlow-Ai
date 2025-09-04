# Finance Forecast App

Spring Boot 3 application for personal finance forecasting.

## Tech stack
- Java 17+
- Spring Boot (Web, Data JPA, Security, Actuator)
- H2 (dev/test), PostgreSQL (prod)
- Flyway migrations
- Testcontainers (integration tests)

## Run (dev)
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
H2 Console: `/h2-console` (URL `jdbc:h2:mem:ffadb`)

## Build
```bash
mvn clean package
```

## Profiles
- dev: H2 in-memory, `ddl-auto=update`, H2 console enabled
- test: H2 with PostgreSQL mode, Flyway disabled, `ddl-auto=create-drop`
- prod: PostgreSQL, Flyway enabled, `ddl-auto=validate`

## Actuator
Health and info exposed in dev: `/actuator/health`, `/actuator/info`



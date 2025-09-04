# Finance Forecast App

Spring Boot 3 application for personal finance forecasting.

## Tech stack
- Java 17+
- Spring Boot (Web, Data JPA, Security, Actuator)
- H2 Database (all profiles)
- Flyway migrations
- Testcontainers (integration tests)

## Run (dev)
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### H2 Console Access
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:ffadb`
- Username: `user`
- Password: `user123`

## Build
```bash
mvn clean package
```

## Profiles
- dev: H2 in-memory, `ddl-auto=update`, H2 console enabled
- test: H2 with PostgreSQL mode, Flyway enabled, `ddl-auto=update`
- prod: H2 in-memory, Flyway enabled, `ddl-auto=update`

## Database Migrations

The application uses Flyway for database migrations. Migration scripts are located in `src/main/resources/db/migration/`:

- `V1__create_base_tables.sql`: Creates core tables (users, financial_data, forecasts)
- `V2__enhance_base_tables.sql`: Adds constraints, indexes, and checks
- `V3__add_categories_and_settings.sql`: Adds categories and user settings tables
- `V4__add_jpa_entity_tables.sql`: Adds JPA entity tables (accounts, transactions, budgets, financial_goals)
- `V999__seed_test_data.sql`: Seeds test data for development

### Migration Rollback
To rollback migrations:
1. Use Flyway CLI: `flyway migrate -target=2` (rolls back to version 2)
2. Or manually drop and recreate database for development

### Future PostgreSQL Migration
To switch to PostgreSQL:
1. Uncomment PostgreSQL configuration in `application.yml`
2. Set environment variables: `DB_USERNAME` and `DB_PASSWORD`
3. Update `spring.jpa.hibernate.ddl-auto` to `validate` for production
4. Ensure PostgreSQL is running and accessible

## Actuator
Health and info exposed in dev: `/actuator/health`, `/actuator/info`



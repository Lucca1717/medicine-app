# medicine-app

Medication Manager backend is a Java 21 / Spring Boot 3 application backed by PostgreSQL and Flyway. The schema is defined by `backend/src/main/resources/db/migration/V1__create_initial_schema.sql` and is intentionally not modified by the application.

## Run locally

1. Start PostgreSQL and create a database (for example `medicine_manager`).
2. From `backend/`, run:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/medicine_manager
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
mvn spring-boot:run
```

The API is available under `/api`. Create users, units, medications, periods, user medications, medication periods, and intake records with their corresponding POST endpoints. Passwords are stored as BCrypt hashes. `mvn test` runs the lightweight test suite.

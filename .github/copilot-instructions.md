# Medication Manager: Copilot instructions

Project: full-stack medication management app (Java 21, Spring Boot 3, PostgreSQL, Flyway, Angular + Ionic). Repository layout: `backend/`, `frontend/`, `docs/`.

## Sources of truth
- `docs/requirements.md`: entities, attributes, business rules.
- `docs/conceptual-model.md` and `docs/diagrams/conceptual-erd.md`: relationships and open questions.
- `backend/src/main/resources/db/migration/*.sql`: the real schema, owned by Flyway.
- `docs/copilot-backend-prompt.md` and `docs/copilot-frontend-prompt.md`, if present: detailed conventions for backend and frontend.

## Rules for every task
- JPA entities must match the Flyway migrations exactly (table, column, type, nullability, id type). Never modify or add migrations. Use `ddl-auto=validate`. If something does not match, stop and tell me.
- Do not invent entities, fields, or relationships absent from the docs. List ambiguities as "Assumptions" at the end.
- Do not change code unrelated to the current step.
- Backend: layers `controller`, `service`, `repository` (DAO, Spring Data JPA), `entity`, `dto.request`, `dto.response`, `mapper`, `exception`. DTOs are Java records, entities are never exposed, associations appear as ids in DTOs, mappers written by hand, constructor injection, no Lombok, no cascades, `BigDecimal` for quantities.
- Backend errors use RFC 7807 `ProblemDetail`: 400 validation, 404 not found, 409 uniqueness/conflict, 422 business-rule violation.
- API base path `/api`, plural kebab-case resources, JSON field names identical to DTO fields, 201 + `Location` on create.
- Frontend: Angular standalone components, strict TypeScript, typed Reactive Forms, Ionic standalone components, signals, lazy-loaded routes, no `any`. One API service per resource, models in `core/models` mirroring the backend DTOs. Errors handled centrally (interceptor + `ErrorService`), not per page.
- Out of scope until I say otherwise: authentication, stock decrement, intake generation, unit conversion, notifications, pagination, search, Docker/CI changes.

## Definition of done for each step
- `mvn test` and `ng build` / `npm test` pass without a running database or backend (unit/slice tests only).
- Only the requested endpoints and screens exist.
- Final message lists files changed, assumptions, and how to verify manually.

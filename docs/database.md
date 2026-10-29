# Database structure and migration workflow

Medication Manager uses PostgreSQL and Flyway SQL migrations. The initial
migration is
`backend/src/main/resources/db/migration/V1__create_initial_schema.sql`.
The repository currently has no backend build, so this path establishes the
Spring Boot-compatible resource layout for the backend implementation.

## Schema

The schema contains seven entities:

- `app_user` stores user identity and a password hash. Plaintext passwords
  must never be stored.
- `unit` stores named units and their `MASS`, `VOLUME`, or `MEDICATION` type.
- `medication` stores medication strength (`dosage_value` plus a mass or
  volume unit).
- `period` stores a user's named scheduled time.
- `user_medication` stores a user's use of a medication, including independent
  stock, dates, and active state.
- `medication_period` stores the planned intake quantity for a medication at a
  period.
- `intake_record` stores one scheduled occurrence and its outcome.

Dosage, planned intake quantity, actual intake quantity, and stock are
intentionally separate values. For example, a medication may have a dosage of
`500 mg`, a planned quantity of `2 tablets`, an actual quantity of `1 tablet`,
and a stock of `30 tablets`.

## Integrity rules

The migration uses named primary keys, foreign keys, unique constraints,
non-null constraints, check constraints, and indexes. In addition to
declarative constraints:

- PostgreSQL triggers validate that dosage units are `MASS` or `VOLUME`, and
  stock/planned/actual quantity units are `MEDICATION`.
- A medication period trigger prevents connecting records owned by different
  users. Ownership changes on `period` and `user_medication` are rejected after
  creation so that this invariant remains true.
- Intake records with status `TAKEN` require `taken_at`, quantity, and unit.
  Other statuses cannot contain actual intake fields.
- An active user medication cannot be saved with an end date in the past.
  Reaching an end date still requires the application scheduler or a future
  maintenance job to set `active` to `false`; a database check cannot
  automatically mutate a row as time passes.

The requirements allow the same named medication at different dosages. Each
dosage is represented by a separate `medication` row, and
`user_medication` prevents duplicate use records for the same user and
medication definition.

## Migration workflow

1. Add a new versioned SQL file in
   `backend/src/main/resources/db/migration/`, for example
   `V2__add_medication_notes.sql`.
2. Never edit a migration that may already have been applied. Add a new
   migration for every schema or reference-data change.
3. Keep migrations ordered by Flyway version and make each migration
   reproducible on a database at the preceding version.
4. Apply migrations through Flyway when the Spring Boot backend is added.
   Flyway records applied versions in its schema history table.
5. Test new migrations against an empty PostgreSQL database and a database
   already migrated through the previous version before merging.

The initial unit rows are reference data inserted by `V1`; future changes to
that data should also be versioned migrations.

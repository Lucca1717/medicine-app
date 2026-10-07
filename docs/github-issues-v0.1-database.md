# Milestone: v0.1 — Database

Create the milestone `v0.1 — Database` and assign all issues below to it.

## Labels

- `documentation`: issues 1–3
- `database`: issues 4–12
- `feature`: issues 4–10 and 12
- `performance`: issue 11

## Issue 1

**Title:** `docs: define database requirements`  
**Labels:** `documentation`

**Description**

Identify and document the initial relational database requirements for Medication Manager:

- Identify the main entities.
- Identify entity attributes.
- Define relationships.
- Identify primary keys and foreign keys.
- Identify important business rules and constraints.

**Acceptance criteria**

- All required entities identified.
- Relationships documented.
- Business rules documented.
- Model ready for conceptual modeling.

---

## Issue 2

**Title:** `docs: create conceptual database model`  
**Labels:** `documentation`

**Description**

Create the conceptual ER model for the initial schema:

- Document all seven entities.
- Document relationships and cardinalities.
- Produce an ER diagram.

Document these relationships:

- User 1:N Period
- User 1:N User Medication
- Medication 1:N User Medication
- User Medication 1:N Medication Period
- Period 1:N Medication Period
- Medication Period 1:N Intake Record
- Unit 1:N entities that reference units

**Acceptance criteria**

- ER diagram exists.
- Relationships documented.
- Cardinalities documented.

---

## Issue 3

**Title:** `docs: define database naming conventions`  
**Labels:** `documentation`

**Description**

Define and document naming conventions for the database:

- English names.
- Singular table names.
- `snake_case`.
- `id` for primary keys.
- `<table>_id` for foreign keys.
- Consistent names for timestamps and dates.

Examples to include:

- `app_user`
- `medication`
- `user_medication`
- `medication_period`
- `intake_record`
- `created_at`
- `scheduled_at`
- `taken_at`

**Acceptance criteria**

- Naming conventions documented and approved for use in upcoming migrations.

---

## Issue 4

**Title:** `feat(database): create app_user table`  
**Labels:** `database`, `feature`

**Description**

Create the `app_user` table with:

- Table fields.
- UUID primary key.
- Unique email.
- Required fields.
- `created_at` default.
- UUID generation support.

**Acceptance criteria**

- `app_user` table exists with all required fields and constraints.

---

## Issue 5

**Title:** `feat(database): create unit table`  
**Labels:** `database`, `feature`

**Description**

Create the `unit` table with:

- Table fields.
- Unit type validation.
- Unique unit names.
- Initial unit data.

Allowed types:

- `MASS`
- `VOLUME`
- `MEDICATION`

**Acceptance criteria**

- `unit` table exists with required validations and initial data.

---

## Issue 6

**Title:** `feat(database): create medication table`  
**Labels:** `database`, `feature`

**Description**

Create the `medication` table with:

- Medication name.
- Dosage value.
- Dosage unit.
- Foreign key to `unit`.
- Dosage greater than zero.

Explicitly document dosage vs intake quantity:

> Dosage defines medication strength (e.g., 500 mg), while intake quantity defines how much is taken at a schedule (e.g., 2 tablets).

**Acceptance criteria**

- `medication` table exists with required relationship and dosage validation.

---

## Issue 7

**Title:** `feat(database): create period table`  
**Labels:** `database`, `feature`

**Description**

Create the `period` table with:

- User relationship.
- Period name.
- Scheduled time.
- `UNIQUE(user_id, name)`.
- `UNIQUE(user_id, time)`.

**Acceptance criteria**

- `period` table exists with all fields, relationship, and uniqueness constraints.

---

## Issue 8

**Title:** `feat(database): create user medication table`  
**Labels:** `database`, `feature`

**Description**

Create the `user_medication` table with:

- User relationship.
- Medication relationship.
- Current stock.
- Stock unit.
- Start date.
- End date.
- Active status.

Constraints:

- Stock >= 0.
- End date >= start date.

Explain in implementation notes why this table is separate from `medication`: different users can have different stock, treatment periods, and activity status for the same medication.

**Acceptance criteria**

- `user_medication` table exists with constraints and documented purpose.

---

## Issue 9

**Title:** `feat(database): create medication period table`  
**Labels:** `database`, `feature`

**Description**

Create the `medication_period` table with:

- User medication relationship.
- Period relationship.
- Intake quantity.
- Quantity unit.
- Quantity > 0.
- Unique `(user_medication_id, period_id)`.

Include an example such as:

> Dipyrone → Afternoon → 2 tablets

**Acceptance criteria**

- `medication_period` table exists with required constraints and uniqueness rule.

---

## Issue 10

**Title:** `feat(database): create intake record table`  
**Labels:** `database`, `feature`

**Description**

Create the `intake_record` table with:

- Medication period relationship.
- Scheduled timestamp.
- Taken timestamp.
- Actual quantity.
- Quantity unit.
- Intake status.

Allowed statuses:

- `PENDING`
- `TAKEN`
- `OVERDUE`
- `SKIPPED`

Document rule: when status is `TAKEN`, `taken_at`, `quantity_value`, and `quantity_unit_id` are required.

**Acceptance criteria**

- `intake_record` table exists with status validation and conditional taken-data rule documented.

---

## Issue 11

**Title:** `perf(database): add constraints and indexes`  
**Labels:** `database`, `performance`

**Description**

Document and implement the required constraints:

- Primary keys.
- Foreign keys.
- Unique constraints.
- NOT NULL constraints.
- CHECK constraints.
- Default values.

Document and implement indexes, at minimum for:

- `period.user_id`
- `user_medication.user_id`
- `user_medication.medication_id`
- `medication_period.user_medication_id`
- `medication_period.period_id`
- `intake_record.medication_period_id`
- `intake_record.scheduled_at`
- `intake_record.status`

**Acceptance criteria**

- Required constraints and indexes are implemented and documented.

---

## Issue 12

**Title:** `feat(database): create initial database migration`  
**Labels:** `database`, `feature`

**Description**

Create the first migration for the complete schema in dependency order. Include:

- PostgreSQL UUID support.
- `app_user`
- `unit`
- `medication`
- `period`
- `user_medication`
- `medication_period`
- `intake_record`
- Constraints.
- Indexes.
- Initial unit data.

**Acceptance criteria**

- Migration works on an empty PostgreSQL database.
- Migration is reproducible.
- Tables are created in correct dependency order.
- Initial units are available.

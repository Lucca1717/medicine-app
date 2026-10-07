# Database Requirements

## 1. Purpose

The Medication Manager database stores the information required to manage users, medications, medication schedules, medication intake records, and medication inventory.

The database must support the core workflow:

> Register medication → configure schedule → record intake → update medication stock.

## 2. Main entities

The initial relational database consists of the following entities:

| Entity | Purpose |
|---|---|
| `app_user` | Stores application users |
| `unit` | Stores measurement units |
| `medication` | Defines medications and their dosage |
| `period` | Defines a user's scheduled medication times |
| `user_medication` | Represents a medication being used by a specific user |
| `medication_period` | Associates a medication with a scheduled period and defines the intake quantity |
| `intake_record` | Records individual medication intake events |

## 3. Entity Attributes

### 3.1 app_user

Represents a registered application user.

| Attribute | Description | Required |
|---|---|---|
| `id` | Unique user identifier | Yes |
| `name` | User's name | Yes |
| `email` | User's email address | Yes |
| `password` | User's password hash | Yes |
| `created_at` | Account creation timestamp | Yes |

- Each user must have a unique email address.
- A user must have a name, email, and password.
- A user may have multiple medications.
- A user may have multiple periods.

### 3.2 unit
Stores units used to describe medication dosage, stock, and intake quantities.

Examples:

- Milligram
- Gram
- Milliliter
- Tablet
- Capsule
- Drop

| Attribute      | Description            | Required |
| -------------- | ---------------------- | -------- |
| `id`           | Unique unit identifier | Yes      |
| `name`         | Full unit name         | Yes      |
| `abbreviation` | Short representation   | Yes      |
| `type`         | Unit category          | Yes      |

#### Unit types

The initial model supports:

- MASS
- VOLUME
- MEDICATION

| Unit       | Type       |
| ---------- | ---------- |
| Milligram  | MASS       |
| Gram       | MASS       |
| Milliliter | VOLUME     |
| Tablet     | MEDICATION |
| Capsule    | MEDICATION |
| Drop       | MEDICATION |

#### Business rules

- Unit names must be unique.
- Every unit must belong to a valid unit type.
- Units can be referenced by medications and quantities.
- The unit used for an attribute must be compatible with the type of quantity being represented:
    - `dosage_unit → strength unit (MASS / VOLUME)`
    - `stock_unit → usually MEDICATION`
    - `quantity_unit → usually MEDICATION`

### 3.3 medication

Represents the definition of a medication.

| Attribute        | Description                  | Required |
| ---------------- | ---------------------------- | -------- |
| `id`             | Unique medication identifier | Yes      |
| `name`           | Medication name              | Yes      |
| `dosage_value`   | Numeric dosage               | Yes      |
| `dosage_unit_id` | Unit used by the dosage      | Yes      |

#### Foreign keys
`dosage_unit_id → unit.id`

#### Business rules

- Dosage must be greater than zero.
- The dosage unit must exist in unit.
- Dosage represents the strength of the medication, not the amount taken by the user.

For example:

>Dipyrone 500 mg

means:

>Dipyrone
dosage: 500 mg<br><br>
Schedule:<br>
Morning<br>
quantity: 2 tablets

This is equal to:

>medication.dosage_value = 500<br>
medication.dosage_unit = mg<br><br>
medication_period.quantity_value = 2<br>
medication_period.quantity_unit = tablet

### 3.4 period

Represents a scheduled time associated with a specific user.

Examples:

```
Morning     → 08:00
Afternoon   → 14:00
Night       → 20:00
```

| Attribute | Description              | Required |
| --------- | ------------------------ | -------- |
| `id`      | Unique period identifier | Yes      |
| `user_id` | Owner of the period      | Yes      |
| `name`    | Period name              | Yes      |
| `time`    | Scheduled time           | Yes      |

#### Foreign keys

`user_id → app_user.id`

#### Business rules

- Every period belongs to exactly one user.
- A user may have multiple periods.
- A user cannot have two periods with the same name.
- A user cannot have two periods with the same scheduled time.


### 3.5 user_medication

Represents a user's use of a specific medication, including its current stock and usage period.

This entity is important because the generic medication definition and the user's use of that medication are different concepts.

| Attribute             | Description                                | Required |
| --------------------- | ------------------------------------------ | -------- |
| `id`                  | Unique user-medication identifier          | Yes      |
| `user_id`             | User taking the medication                 | Yes      |
| `medication_id`       | Medication being used                      | Yes      |
| `current_stock_value` | Current available quantity                 | Yes      |
| `stock_unit_id`       | Unit used by the stock quantity            | Yes      |
| `start_date`          | Start of medication usage                  | Yes      |
| `end_date`            | End of medication usage                    | No       |
| `active`              | Whether the medication is currently active | Yes      |


#### Foreign keys

`user_id → app_user.id`
`medication_id → medication.id`
`stock_unit_id → unit.id`

#### Business rules

- Stock cannot be negative.
- `end_date`, when present, cannot be earlier than `start_date`.
- A user medication belongs to exactly one user.
- A user medication references exactly one medication.
- A medication can be associated with multiple users.
- The user's current stock is independent from the generic medication definition.
- An active user medication must not have an end date in the past.
    - When `end_date` is reached, the medication becomes inactive.
- `active` indicates whether the medication is currently part of the user's medication schedule.
- A user can have only one `user_medication` record for a given medication and dosage (same medication with different dosage is allowed).


### 3.6 medication_period

Associates a user's medication with a scheduled period.

This entity defines how much medication the user should take at a particular scheduled time.

Example:

| Attribute            | Description                     | Required |
| -------------------- | ------------------------------- | -------- |
| `id`                 | Unique association identifier   | Yes      |
| `user_medication_id` | User medication being scheduled | Yes      |
| `period_id`          | Scheduled period                | Yes      |
| `quantity_value`     | Amount to take                  | Yes      |
| `quantity_unit_id`   | Unit of the intake quantity     | Yes      |

#### Foreign keys

`user_medication_id → user_medication.id`
`period_id → period.id`
`quantity_unit_id → unit.id`

#### Business rules

- Quantity must be greater than zero.
- A medication cannot be associated with the same period more than once.
- The quantity unit must exist.
- The quantity represents the amount taken per scheduled intake.
- The `user_medication` and `period` referenced by a medication-period association must belong to the same user.
- A medication-period configuration must have at most one intake record for a given scheduled datetime.


### 3.7 intake_record

Represents an individual medication intake event.

It provides the historical record of what was scheduled and what actually happened.

| Attribute              | Description                                      | Required |
| ---------------------- | ------------------------------------------------ | -------- |
| `id`                   | Unique intake identifier                         | Yes      |
| `medication_period_id` | Scheduled medication configuration               | Yes      |
| `scheduled_at`         | Date/time when the intake was scheduled          | Yes      |
| `taken_at`             | Date/time when the medication was actually taken | No       |
| `quantity_value`       | Actual quantity taken                            | No       |
| `quantity_unit_id`     | Unit of the actual quantity                      | No       |
| `status`               | Current intake status                            | Yes      |

#### Foreign keys

`medication_period_id → medication_period.id`
`quantity_unit_id → unit.id`

#### Possible statuses

| Status    | Rules                                           |
| --------- | ----------------------------------------------- |
| `PENDING` | `taken_at` and actual quantity must be NULL     |
| `TAKEN`   | `taken_at`, quantity and quantity unit required |
| `SKIPPED` | No actual intake information required           |
| `OVERDUE` | No actual intake information required           |

#### Business rules

- When an intake has status TAKEN:
    - taken_at must be present.
    - quantity_value must be present.
    - quantity_unit_id must be present.
- An intake that has not been taken yet does not require taken_at.
- The actual intake fields describe what was actually taken and may differ from the scheduled quantity.
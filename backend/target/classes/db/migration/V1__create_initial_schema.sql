CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE app_user (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_app_user PRIMARY KEY (id),
    CONSTRAINT uq_app_user_email UNIQUE (email),
    CONSTRAINT ck_app_user_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT ck_app_user_email_not_blank CHECK (btrim(email) <> ''),
    CONSTRAINT ck_app_user_password_hash_not_blank CHECK (btrim(password_hash) <> '')
);

CREATE TABLE unit (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    CONSTRAINT pk_unit PRIMARY KEY (id),
    CONSTRAINT uq_unit_name UNIQUE (name),
    CONSTRAINT uq_unit_abbreviation UNIQUE (abbreviation),
    CONSTRAINT ck_unit_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT ck_unit_abbreviation_not_blank CHECK (btrim(abbreviation) <> ''),
    CONSTRAINT ck_unit_type CHECK (type IN ('MASS', 'VOLUME', 'MEDICATION'))
);

CREATE TABLE medication (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    dosage_value NUMERIC(12, 3) NOT NULL,
    dosage_unit_id UUID NOT NULL,
    CONSTRAINT pk_medication PRIMARY KEY (id),
    CONSTRAINT fk_medication_dosage_unit FOREIGN KEY (dosage_unit_id)
        REFERENCES unit (id),
    CONSTRAINT ck_medication_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT ck_medication_dosage_positive CHECK (dosage_value > 0)
);

CREATE TABLE period (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    time TIME NOT NULL,
    CONSTRAINT pk_period PRIMARY KEY (id),
    CONSTRAINT fk_period_user FOREIGN KEY (user_id)
        REFERENCES app_user (id),
    CONSTRAINT uq_period_user_name UNIQUE (user_id, name),
    CONSTRAINT uq_period_user_time UNIQUE (user_id, time),
    CONSTRAINT ck_period_name_not_blank CHECK (btrim(name) <> '')
);

CREATE TABLE user_medication (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    medication_id UUID NOT NULL,
    current_stock_value NUMERIC(12, 3) NOT NULL DEFAULT 0,
    stock_unit_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_user_medication PRIMARY KEY (id),
    CONSTRAINT fk_user_medication_user FOREIGN KEY (user_id)
        REFERENCES app_user (id),
    CONSTRAINT fk_user_medication_medication FOREIGN KEY (medication_id)
        REFERENCES medication (id),
    CONSTRAINT fk_user_medication_stock_unit FOREIGN KEY (stock_unit_id)
        REFERENCES unit (id),
    CONSTRAINT ck_user_medication_stock_non_negative CHECK (current_stock_value >= 0),
    CONSTRAINT ck_user_medication_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT uq_user_medication_user_medication UNIQUE (user_id, medication_id),
    CONSTRAINT uq_user_medication_id_user UNIQUE (id, user_id)
);

CREATE TABLE medication_period (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_medication_id UUID NOT NULL,
    period_id UUID NOT NULL,
    quantity_value NUMERIC(12, 3) NOT NULL,
    quantity_unit_id UUID NOT NULL,
    CONSTRAINT pk_medication_period PRIMARY KEY (id),
    CONSTRAINT fk_medication_period_user_medication FOREIGN KEY (user_medication_id)
        REFERENCES user_medication (id),
    CONSTRAINT fk_medication_period_period FOREIGN KEY (period_id)
        REFERENCES period (id),
    CONSTRAINT fk_medication_period_quantity_unit FOREIGN KEY (quantity_unit_id)
        REFERENCES unit (id),
    CONSTRAINT ck_medication_period_quantity_positive CHECK (quantity_value > 0),
    CONSTRAINT uq_medication_period_user_medication_period
        UNIQUE (user_medication_id, period_id)
);

CREATE TABLE intake_record (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    medication_period_id UUID NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    taken_at TIMESTAMPTZ,
    quantity_value NUMERIC(12, 3),
    quantity_unit_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT pk_intake_record PRIMARY KEY (id),
    CONSTRAINT fk_intake_record_medication_period FOREIGN KEY (medication_period_id)
        REFERENCES medication_period (id),
    CONSTRAINT fk_intake_record_quantity_unit FOREIGN KEY (quantity_unit_id)
        REFERENCES unit (id),
    CONSTRAINT uq_intake_record_occurrence UNIQUE (medication_period_id, scheduled_at),
    CONSTRAINT ck_intake_record_status
        CHECK (status IN ('PENDING', 'TAKEN', 'OVERDUE', 'SKIPPED')),
    CONSTRAINT ck_intake_record_quantity_positive
        CHECK (quantity_value IS NULL OR quantity_value > 0),
    CONSTRAINT ck_intake_record_quantity_pair
        CHECK ((quantity_value IS NULL) = (quantity_unit_id IS NULL))
);

CREATE INDEX idx_period_user_id ON period (user_id);
CREATE INDEX idx_user_medication_user_id ON user_medication (user_id);
CREATE INDEX idx_user_medication_medication_id ON user_medication (medication_id);
CREATE INDEX idx_medication_period_user_medication_id
    ON medication_period (user_medication_id);
CREATE INDEX idx_medication_period_period_id ON medication_period (period_id);
CREATE INDEX idx_intake_record_medication_period_id
    ON intake_record (medication_period_id);
CREATE INDEX idx_intake_record_scheduled_at ON intake_record (scheduled_at);
CREATE INDEX idx_intake_record_status ON intake_record (status);

CREATE OR REPLACE FUNCTION validate_unit_type(
    expected_type VARCHAR,
    referenced_unit_id UUID,
    constraint_description VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    actual_type VARCHAR(20);
BEGIN
    SELECT type INTO actual_type
    FROM unit
    WHERE id = referenced_unit_id;

    IF actual_type IS NULL THEN
        RAISE EXCEPTION '% references a unit that does not exist', constraint_description;
    END IF;

    IF actual_type <> expected_type THEN
        RAISE EXCEPTION '% must reference a % unit', constraint_description, expected_type;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_medication_dosage_unit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM unit
        WHERE id = NEW.dosage_unit_id
          AND type NOT IN ('MASS', 'VOLUME')
    ) THEN
        RAISE EXCEPTION 'medication.dosage_unit_id must reference a MASS or VOLUME unit';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_user_medication_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM validate_unit_type(
        'MEDICATION',
        NEW.stock_unit_id,
        'user_medication.stock_unit_id'
    );

    IF NEW.active AND NEW.end_date IS NOT NULL AND NEW.end_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'an active user_medication cannot have an end date in the past';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_medication_period_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM user_medication um
        JOIN period p ON p.id = NEW.period_id
        WHERE um.id = NEW.user_medication_id
          AND um.user_id = p.user_id
    ) THEN
        RAISE EXCEPTION
            'medication_period.user_medication_id and period_id must belong to the same user';
    END IF;

    PERFORM validate_unit_type(
        'MEDICATION',
        NEW.quantity_unit_id,
        'medication_period.quantity_unit_id'
    );

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_intake_status_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'TAKEN' THEN
        IF NEW.taken_at IS NULL
           OR NEW.quantity_value IS NULL
           OR NEW.quantity_unit_id IS NULL THEN
            RAISE EXCEPTION
                'TAKEN intake records require taken_at, quantity_value, and quantity_unit_id';
        END IF;
    ELSE
        IF NEW.taken_at IS NOT NULL
           OR NEW.quantity_value IS NOT NULL
           OR NEW.quantity_unit_id IS NOT NULL THEN
            RAISE EXCEPTION
                'only TAKEN intake records may contain actual intake fields';
        END IF;
    END IF;

    IF NEW.quantity_unit_id IS NOT NULL THEN
        PERFORM validate_unit_type(
            'MEDICATION',
            NEW.quantity_unit_id,
            'intake_record.quantity_unit_id'
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_owner_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.user_id <> OLD.user_id THEN
        RAISE EXCEPTION 'user ownership cannot be changed after creation';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_medication_dosage_unit
    BEFORE INSERT OR UPDATE OF dosage_unit_id ON medication
    FOR EACH ROW
    EXECUTE FUNCTION enforce_medication_dosage_unit();

CREATE TRIGGER trg_user_medication_rules
    BEFORE INSERT OR UPDATE OF stock_unit_id, active, end_date ON user_medication
    FOR EACH ROW
    EXECUTE FUNCTION enforce_user_medication_rules();

CREATE TRIGGER trg_medication_period_ownership
    BEFORE INSERT OR UPDATE OF user_medication_id, period_id, quantity_unit_id
    ON medication_period
    FOR EACH ROW
    EXECUTE FUNCTION enforce_medication_period_ownership();

CREATE TRIGGER trg_intake_status_rules
    BEFORE INSERT OR UPDATE OF status, taken_at, quantity_value, quantity_unit_id
    ON intake_record
    FOR EACH ROW
    EXECUTE FUNCTION enforce_intake_status_rules();

CREATE TRIGGER trg_period_owner_immutable
    BEFORE UPDATE OF user_id ON period
    FOR EACH ROW
    EXECUTE FUNCTION prevent_owner_change();

CREATE TRIGGER trg_user_medication_owner_immutable
    BEFORE UPDATE OF user_id ON user_medication
    FOR EACH ROW
    EXECUTE FUNCTION prevent_owner_change();

INSERT INTO unit (name, abbreviation, type)
VALUES
    ('Milligram', 'mg', 'MASS'),
    ('Gram', 'g', 'MASS'),
    ('Milliliter', 'mL', 'VOLUME'),
    ('Tablet', 'tablet', 'MEDICATION'),
    ('Capsule', 'capsule', 'MEDICATION'),
    ('Drop', 'drop', 'MEDICATION');

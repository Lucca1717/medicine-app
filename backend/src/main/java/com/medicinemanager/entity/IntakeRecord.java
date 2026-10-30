package com.medicinemanager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "intake_record", uniqueConstraints = @UniqueConstraint(name = "uq_intake_record_occurrence", columnNames = {
        "medication_period_id", "scheduled_at" }))
public class IntakeRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medication_period_id", nullable = false)
    private MedicationPeriod medicationPeriod;
    @Column(name = "scheduled_at", nullable = false)
    private OffsetDateTime scheduledAt;
    @Column(name = "taken_at")
    private OffsetDateTime takenAt;
    @Column(name = "quantity_value", precision = 12, scale = 3)
    private BigDecimal quantityValue;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quantity_unit_id")
    private Unit quantityUnit;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IntakeStatus status = IntakeStatus.PENDING;

    protected IntakeRecord() {
    }

    public IntakeRecord(MedicationPeriod m, OffsetDateTime s, OffsetDateTime t, BigDecimal q, Unit u, IntakeStatus st) {
        medicationPeriod = m;
        scheduledAt = s;
        takenAt = t;
        quantityValue = q;
        quantityUnit = u;
        status = st;
    }

    public UUID getId() {
        return id;
    }

    public MedicationPeriod getMedicationPeriod() {
        return medicationPeriod;
    }

    public OffsetDateTime getScheduledAt() {
        return scheduledAt;
    }

    public OffsetDateTime getTakenAt() {
        return takenAt;
    }

    public BigDecimal getQuantityValue() {
        return quantityValue;
    }

    public Unit getQuantityUnit() {
        return quantityUnit;
    }

    public IntakeStatus getStatus() {
        return status;
    }

    public void setMedicationPeriod(MedicationPeriod v) {
        medicationPeriod = v;
    }

    public void setScheduledAt(OffsetDateTime v) {
        scheduledAt = v;
    }

    public void setTakenAt(OffsetDateTime v) {
        takenAt = v;
    }

    public void setQuantityValue(BigDecimal v) {
        quantityValue = v;
    }

    public void setQuantityUnit(Unit v) {
        quantityUnit = v;
    }

    public void setStatus(IntakeStatus v) {
        status = v;
    }
}

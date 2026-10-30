package com.medicinemanager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "medication_period", uniqueConstraints = @UniqueConstraint(name = "uq_medication_period_user_medication_period", columnNames = {
        "user_medication_id", "period_id" }))
public class MedicationPeriod {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_medication_id", nullable = false)
    private UserMedication userMedication;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_id", nullable = false)
    private Period period;
    @Column(name = "quantity_value", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantityValue;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quantity_unit_id", nullable = false)
    private Unit quantityUnit;

    protected MedicationPeriod() {
    }

    public MedicationPeriod(UserMedication u, Period p, BigDecimal q, Unit unit) {
        userMedication = u;
        period = p;
        quantityValue = q;
        quantityUnit = unit;
    }

    public UUID getId() {
        return id;
    }

    public UserMedication getUserMedication() {
        return userMedication;
    }

    public Period getPeriod() {
        return period;
    }

    public BigDecimal getQuantityValue() {
        return quantityValue;
    }

    public Unit getQuantityUnit() {
        return quantityUnit;
    }

    public void setUserMedication(UserMedication v) {
        userMedication = v;
    }

    public void setPeriod(Period v) {
        period = v;
    }

    public void setQuantityValue(BigDecimal v) {
        quantityValue = v;
    }

    public void setQuantityUnit(Unit v) {
        quantityUnit = v;
    }
}

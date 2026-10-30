package com.medicinemanager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_medication", uniqueConstraints = @UniqueConstraint(name = "uq_user_medication_user_medication", columnNames = {
        "user_id", "medication_id" }))
public class UserMedication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;
    @Column(name = "current_stock_value", nullable = false, precision = 12, scale = 3)
    private BigDecimal currentStockValue;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_unit_id", nullable = false)
    private Unit stockUnit;
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    @Column(name = "end_date")
    private LocalDate endDate;
    @Column(nullable = false)
    private boolean active = true;

    protected UserMedication() {
    }

    public UserMedication(AppUser u, Medication m, BigDecimal s, Unit unit, LocalDate start, LocalDate end, boolean a) {
        user = u;
        medication = m;
        currentStockValue = s;
        stockUnit = unit;
        startDate = start;
        endDate = end;
        active = a;
    }

    public UUID getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public Medication getMedication() {
        return medication;
    }

    public BigDecimal getCurrentStockValue() {
        return currentStockValue;
    }

    public Unit getStockUnit() {
        return stockUnit;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public boolean isActive() {
        return active;
    }

    public void setUser(AppUser v) {
        user = v;
    }

    public void setMedication(Medication v) {
        medication = v;
    }

    public void setCurrentStockValue(BigDecimal v) {
        currentStockValue = v;
    }

    public void setStockUnit(Unit v) {
        stockUnit = v;
    }

    public void setStartDate(LocalDate v) {
        startDate = v;
    }

    public void setEndDate(LocalDate v) {
        endDate = v;
    }

    public void setActive(boolean v) {
        active = v;
    }
}

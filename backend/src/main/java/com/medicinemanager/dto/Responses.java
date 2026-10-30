package com.medicinemanager.dto;

import com.medicinemanager.entity.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

public final class Responses {
    private Responses() {
    }

    public record UserResponse(UUID id, String name, String email, OffsetDateTime createdAt) {
    }

    public record UnitResponse(UUID id, String name, String abbreviation, UnitType type) {
    }

    public record MedicationResponse(UUID id, String name, BigDecimal dosageValue, UUID dosageUnitId) {
    }

    public record PeriodResponse(UUID id, UUID userId, String name, LocalTime time) {
    }

    public record UserMedicationResponse(UUID id, UUID userId, UUID medicationId, BigDecimal currentStockValue,
            UUID stockUnitId, LocalDate startDate, LocalDate endDate, boolean active) {
    }

    public record MedicationPeriodResponse(UUID id, UUID userMedicationId, UUID periodId, BigDecimal quantityValue,
            UUID quantityUnitId) {
    }

    public record IntakeRecordResponse(UUID id, UUID medicationPeriodId, OffsetDateTime scheduledAt,
            OffsetDateTime takenAt, BigDecimal quantityValue, UUID quantityUnitId, IntakeStatus status) {
    }
}

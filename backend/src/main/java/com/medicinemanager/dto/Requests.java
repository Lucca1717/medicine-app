package com.medicinemanager.dto;
import com.medicinemanager.entity.*; import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.time.*; import java.util.UUID;
public final class Requests { private Requests(){}
 public record UserRequest(@NotBlank String name,@NotBlank @Email String email,@NotBlank @Size(min=8) String password) {}
 public record UnitRequest(@NotBlank String name,@NotBlank String abbreviation,@NotNull UnitType type) {}
 public record MedicationRequest(@NotBlank String name,@NotNull @Positive BigDecimal dosageValue,@NotNull UUID dosageUnitId) {}
 public record PeriodRequest(@NotNull UUID userId,@NotBlank String name,@NotNull LocalTime time) {}
 public record UserMedicationRequest(@NotNull UUID userId,@NotNull UUID medicationId,@NotNull @PositiveOrZero BigDecimal currentStockValue,@NotNull UUID stockUnitId,@NotNull LocalDate startDate,LocalDate endDate,@NotNull Boolean active) {}
 public record MedicationPeriodRequest(@NotNull UUID userMedicationId,@NotNull UUID periodId,@NotNull @Positive BigDecimal quantityValue,@NotNull UUID quantityUnitId) {}
 public record IntakeRecordRequest(@NotNull UUID medicationPeriodId,@NotNull OffsetDateTime scheduledAt,OffsetDateTime takenAt,@Positive BigDecimal quantityValue,UUID quantityUnitId,@NotNull IntakeStatus status) {}
}

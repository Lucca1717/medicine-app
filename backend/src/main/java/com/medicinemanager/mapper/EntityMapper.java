package com.medicinemanager.mapper;

import com.medicinemanager.dto.Responses.*;
import com.medicinemanager.dto.response.AppUserResponse;
import com.medicinemanager.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {
    public UserResponse user(AppUser x) {
        return new UserResponse(x.getId(), x.getName(), x.getEmail(), x.getCreatedAt());
    }

    public AppUserResponse appUser(AppUser x) {
        return new AppUserResponse(x.getId(), x.getName(), x.getEmail(), x.getCreatedAt());
    }

    public UnitResponse unit(Unit x) {
        return new UnitResponse(x.getId(), x.getName(), x.getAbbreviation(), x.getType());
    }

    public MedicationResponse medication(Medication x) {
        return new MedicationResponse(x.getId(), x.getName(), x.getDosageValue(), x.getDosageUnit().getId());
    }

    public PeriodResponse period(Period x) {
        return new PeriodResponse(x.getId(), x.getUser().getId(), x.getName(), x.getTime());
    }

    public UserMedicationResponse userMedication(UserMedication x) {
        return new UserMedicationResponse(x.getId(), x.getUser().getId(), x.getMedication().getId(),
                x.getCurrentStockValue(), x.getStockUnit().getId(), x.getStartDate(), x.getEndDate(), x.isActive());
    }

    public MedicationPeriodResponse medicationPeriod(MedicationPeriod x) {
        return new MedicationPeriodResponse(x.getId(), x.getUserMedication().getId(), x.getPeriod().getId(),
                x.getQuantityValue(), x.getQuantityUnit().getId());
    }

    public IntakeRecordResponse intake(IntakeRecord x) {
        return new IntakeRecordResponse(x.getId(), x.getMedicationPeriod().getId(), x.getScheduledAt(), x.getTakenAt(),
                x.getQuantityValue(), x.getQuantityUnit() == null ? null : x.getQuantityUnit().getId(), x.getStatus());
    }
}

package com.medicinemanager.service;

import com.medicinemanager.dto.Requests.UserMedicationRequest;
import com.medicinemanager.entity.*;
import com.medicinemanager.exception.*;
import com.medicinemanager.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class UserMedicationService {
    private final UserMedicationRepository r;
    private final AppUserRepository users;
    private final MedicationRepository meds;
    private final UnitRepository units;

    public UserMedicationService(UserMedicationRepository r, AppUserRepository u, MedicationRepository m,
            UnitRepository un) {
        this.r = r;
        users = u;
        meds = m;
        units = un;
    }

    public List<UserMedication> findAll() {
        return r.findAll();
    }

    public List<UserMedication> findByUserId(UUID userId) {
        user(userId);
        return r.findByUserId(userId);
    }

    public UserMedication find(UUID id) {
        return r.findById(id).orElseThrow(() -> new NotFoundException("User medication not found"));
    }

    public UserMedication create(UserMedicationRequest x) {
        validate(x);
        var user = user(x.userId());
        var medication = med(x.medicationId());
        var stockUnit = unit(x.stockUnitId());
        if (r.existsByUserIdAndMedicationId(x.userId(), x.medicationId()))
            // Assumption: dosage belongs to Medication, so uniqueness is user plus medication.
            throw new ConflictException("User already has this medication registered");
        return r.save(new UserMedication(user, medication, x.currentStockValue(), stockUnit, x.startDate(),
                x.endDate(), x.active()));
    }

    private void validate(UserMedicationRequest x) {
        if (x.endDate() != null && x.endDate().isBefore(x.startDate()))
            throw new BusinessRuleException("endDate cannot be before startDate");
        if (x.active() && x.endDate() != null && x.endDate().isBefore(LocalDate.now()))
            throw new BusinessRuleException("active medication cannot have an end date in the past");
        if (x.currentStockValue().signum() < 0)
            throw new BusinessRuleException("Stock cannot be negative");
        if (unit(x.stockUnitId()).getType() != UnitType.MEDICATION)
            throw new BusinessRuleException("Stock unit must be MEDICATION");
    }

    private AppUser user(UUID i) {
        return users.findById(i).orElseThrow(() -> new NotFoundException("User not found"));
    }

    private Medication med(UUID i) {
        return meds.findById(i).orElseThrow(() -> new NotFoundException("Medication not found"));
    }

    private Unit unit(UUID i) {
        return units.findById(i).orElseThrow(() -> new NotFoundException("Unit not found"));
    }
}

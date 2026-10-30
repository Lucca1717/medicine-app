package com.medicinemanager.service;

import com.medicinemanager.dto.Requests.IntakeRecordRequest;
import com.medicinemanager.entity.*;
import com.medicinemanager.exception.*;
import com.medicinemanager.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class IntakeRecordService {
    private final IntakeRecordRepository r;
    private final MedicationPeriodRepository mps;
    private final UnitRepository units;

    public IntakeRecordService(IntakeRecordRepository r, MedicationPeriodRepository m, UnitRepository u) {
        this.r = r;
        mps = m;
        units = u;
    }

    public List<IntakeRecord> findAll() {
        return r.findAll();
    }

    public IntakeRecord find(UUID id) {
        return r.findById(id).orElseThrow(() -> new NotFoundException("Intake record not found"));
    }

    public IntakeRecord create(IntakeRecordRequest x) {
        validate(x);
        return r.save(new IntakeRecord(mp(x.medicationPeriodId()), x.scheduledAt(), x.takenAt(), x.quantityValue(),
                x.quantityUnitId() == null ? null : unit(x.quantityUnitId()), x.status()));
    }

    public IntakeRecord update(UUID id, IntakeRecordRequest x) {
        var i = find(id);
        validate(x);
        i.setMedicationPeriod(mp(x.medicationPeriodId()));
        i.setScheduledAt(x.scheduledAt());
        i.setTakenAt(x.takenAt());
        i.setQuantityValue(x.quantityValue());
        i.setQuantityUnit(x.quantityUnitId() == null ? null : unit(x.quantityUnitId()));
        i.setStatus(x.status());
        return r.save(i);
    }

    public void delete(UUID id) {
        r.delete(find(id));
    }

    private void validate(IntakeRecordRequest x) {
        boolean taken = x.status() == IntakeStatus.TAKEN;
        if (taken != (x.takenAt() != null && x.quantityValue() != null && x.quantityUnitId() != null))
            throw new BusinessRuleException(taken ? "TAKEN intake requires actual intake fields"
                    : "Only TAKEN intake may contain actual fields");
        if (x.quantityValue() != null && x.quantityValue().signum() <= 0)
            throw new BusinessRuleException("Quantity must be greater than zero");
        if (x.quantityUnitId() != null && unit(x.quantityUnitId()).getType() != UnitType.MEDICATION)
            throw new BusinessRuleException("Actual quantity unit must be MEDICATION");
    }

    private MedicationPeriod mp(UUID i) {
        return mps.findById(i).orElseThrow(() -> new NotFoundException("Medication period not found"));
    }

    private Unit unit(UUID i) {
        return units.findById(i).orElseThrow(() -> new NotFoundException("Unit not found"));
    }
}

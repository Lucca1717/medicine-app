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
        var medicationPeriod = mp(x.medicationPeriodId());
        if (r.existsByMedicationPeriodIdAndScheduledAt(x.medicationPeriodId(), x.scheduledAt())) {
            throw new ConflictException("An intake record already exists for this medication period and scheduled time");
        }
        validate(x);
        return r.save(new IntakeRecord(medicationPeriod, x.scheduledAt(), x.takenAt(), x.quantityValue(),
                x.quantityUnitId() == null ? null : unit(x.quantityUnitId()), x.status()));
    }

    public IntakeRecord update(UUID id, IntakeRecordRequest x) {
        var record = find(id);
        var medicationPeriod = mp(x.medicationPeriodId());
        if (r.existsByMedicationPeriodIdAndScheduledAtAndIdNot(x.medicationPeriodId(), x.scheduledAt(), id)) {
            throw new ConflictException("An intake record already exists for this medication period and scheduled time");
        }
        validate(x);
        record.setMedicationPeriod(medicationPeriod);
        record.setScheduledAt(x.scheduledAt());
        record.setTakenAt(x.takenAt());
        record.setQuantityValue(x.quantityValue());
        record.setQuantityUnit(x.quantityUnitId() == null ? null : unit(x.quantityUnitId()));
        record.setStatus(x.status());
        return r.save(record);
    }

    public void delete(UUID id) {
        r.delete(find(id));
    }

    private void validate(IntakeRecordRequest x) {
        boolean hasActualData = x.takenAt() != null || x.quantityValue() != null || x.quantityUnitId() != null;
        if (x.status() == IntakeStatus.TAKEN && !(x.takenAt() != null && x.quantityValue() != null
                && x.quantityUnitId() != null)) {
            throw new BusinessRuleException("TAKEN intake requires takenAt, quantityValue, and quantityUnitId");
        }
        if (x.status() == IntakeStatus.PENDING && hasActualData) {
            throw new BusinessRuleException("PENDING intake cannot contain takenAt, quantityValue, or quantityUnitId");
        }
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

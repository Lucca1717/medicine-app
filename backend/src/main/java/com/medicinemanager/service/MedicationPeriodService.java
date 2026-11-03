package com.medicinemanager.service;

import com.medicinemanager.dto.Requests.MedicationPeriodRequest;
import com.medicinemanager.entity.*;
import com.medicinemanager.exception.*;
import com.medicinemanager.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class MedicationPeriodService {
    private final MedicationPeriodRepository r;
    private final UserMedicationRepository ums;
    private final PeriodRepository periods;
    private final UnitRepository units;

    public MedicationPeriodService(MedicationPeriodRepository r, UserMedicationRepository u, PeriodRepository p,
            UnitRepository un) {
        this.r = r;
        ums = u;
        periods = p;
        units = un;
    }

    public List<MedicationPeriod> findAll() {
        return r.findAll();
    }

    public MedicationPeriod find(UUID id) {
        return r.findById(id).orElseThrow(() -> new NotFoundException("Medication period not found"));
    }

    public MedicationPeriod create(MedicationPeriodRequest x) {
        var um = um(x.userMedicationId());
        var p = period(x.periodId());
        validate(um, p, x.quantityUnitId(), x.quantityValue());
        return r.save(new MedicationPeriod(um, p, x.quantityValue(), unit(x.quantityUnitId())));
    }

    public MedicationPeriod update(UUID id, MedicationPeriodRequest x) {
        var item = find(id);
        var um = um(x.userMedicationId());
        var p = period(x.periodId());
        validate(um, p, x.quantityUnitId(), x.quantityValue(), id);
        item.setUserMedication(um);
        item.setPeriod(p);
        item.setQuantityValue(x.quantityValue());
        item.setQuantityUnit(unit(x.quantityUnitId()));
        return r.save(item);
    }

    public void delete(UUID id) {
        r.delete(find(id));
    }

    private void validate(UserMedication um, Period p, UUID unit, java.math.BigDecimal ignoredQuantity) {
        validate(um, p, unit, ignoredQuantity, null);
    }

    private void validate(UserMedication um, Period p, UUID unit, java.math.BigDecimal ignoredQuantity, UUID id) {
        if (!um.getUser().getId().equals(p.getUser().getId()))
            throw new BusinessRuleException("Medication and period must belong to same user");
        if ((id == null && r.existsByUserMedicationIdAndPeriodId(um.getId(), p.getId()))
                || (id != null && r.existsByUserMedicationIdAndPeriodIdAndIdNot(um.getId(), p.getId(), id)))
            throw new ConflictException("Medication is already scheduled in this period");
        if (unit(unit).getType() != UnitType.MEDICATION)
            throw new BusinessRuleException("Quantity unit must be MEDICATION");
    }

    private UserMedication um(UUID i) {
        return ums.findById(i).orElseThrow(() -> new NotFoundException("User medication not found"));
    }

    private Period period(UUID i) {
        return periods.findById(i).orElseThrow(() -> new NotFoundException("Period not found"));
    }

    private Unit unit(UUID i) {
        return units.findById(i).orElseThrow(() -> new NotFoundException("Unit not found"));
    }
}

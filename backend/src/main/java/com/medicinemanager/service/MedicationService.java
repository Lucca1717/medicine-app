package com.medicinemanager.service;

import com.medicinemanager.dto.Requests.MedicationRequest;
import com.medicinemanager.entity.Medication;
import com.medicinemanager.entity.Unit;
import com.medicinemanager.exception.NotFoundException;
import com.medicinemanager.repository.MedicationRepository;
import com.medicinemanager.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MedicationService {
    private final MedicationRepository r;
    private final UnitRepository units;

    public MedicationService(MedicationRepository r, UnitRepository u) {
        this.r = r;
        units = u;
    }

    public List<Medication> findAll() {
        return r.findAll();
    }

    public Medication find(UUID id) {
        return r.findById(id).orElseThrow(() -> new NotFoundException("Medication not found"));
    }

    public Medication create(MedicationRequest x) {
        var u = unit(x.dosageUnitId());
        return r.save(new Medication(x.name().trim(), x.dosageValue(), u));
    }

    private Unit unit(UUID id) {
        return units.findById(id).orElseThrow(() -> new NotFoundException("Unit not found"));
    }
}

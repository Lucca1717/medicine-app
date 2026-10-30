package com.medicinemanager.repository;

import com.medicinemanager.entity.MedicationPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface MedicationPeriodRepository extends JpaRepository<MedicationPeriod, UUID> {
    boolean existsByUserMedicationIdAndPeriodId(UUID userMedicationId, UUID periodId);

    boolean existsByUserMedicationIdAndPeriodIdAndIdNot(UUID userMedicationId, UUID periodId, UUID id);

    List<MedicationPeriod> findByUserMedicationId(UUID userMedicationId);
}

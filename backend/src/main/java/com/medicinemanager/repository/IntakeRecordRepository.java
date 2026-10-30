package com.medicinemanager.repository;

import com.medicinemanager.entity.IntakeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.OffsetDateTime;
import java.util.*;

public interface IntakeRecordRepository extends JpaRepository<IntakeRecord, UUID> {
    boolean existsByMedicationPeriodIdAndScheduledAt(UUID medicationPeriodId, OffsetDateTime scheduledAt);

    boolean existsByMedicationPeriodIdAndScheduledAtAndIdNot(UUID medicationPeriodId, OffsetDateTime scheduledAt,
            UUID id);

    List<IntakeRecord> findByMedicationPeriodId(UUID medicationPeriodId);
}

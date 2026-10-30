package com.medicinemanager.repository;

import com.medicinemanager.entity.Period;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalTime;
import java.util.*;

public interface PeriodRepository extends JpaRepository<Period, UUID> {
    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);

    boolean existsByUserIdAndNameIgnoreCaseAndIdNot(UUID userId, String name, UUID id);

    boolean existsByUserIdAndTime(UUID userId, LocalTime time);

    boolean existsByUserIdAndTimeAndIdNot(UUID userId, LocalTime time, UUID id);

    List<Period> findByUserId(UUID userId);
}

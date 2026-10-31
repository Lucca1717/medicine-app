package com.medicinemanager.repository;

import com.medicinemanager.entity.Period;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalTime;
import java.util.*;

public interface PeriodRepository extends JpaRepository<Period, UUID> {
    boolean existsByUserIdAndName(UUID userId, String name);

    boolean existsByUserIdAndTime(UUID userId, LocalTime time);

    List<Period> findByUserId(UUID userId);
}

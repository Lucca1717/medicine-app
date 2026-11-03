package com.medicinemanager.repository;

import com.medicinemanager.entity.Period;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.time.LocalTime;
import java.util.*;

public interface PeriodRepository extends JpaRepository<Period, UUID> {
    boolean existsByUserIdAndName(UUID userId, String name);

    boolean existsByUserIdAndTime(UUID userId, LocalTime time);

    boolean existsByUserIdAndNameAndIdNot(UUID userId, String name, UUID id);

    boolean existsByUserIdAndTimeAndIdNot(UUID userId, LocalTime time, UUID id);

    @EntityGraph(attributePaths = "user")
    List<Period> findByUserId(UUID userId);
}

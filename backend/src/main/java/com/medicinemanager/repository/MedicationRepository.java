package com.medicinemanager.repository;
import com.medicinemanager.entity.Medication; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface MedicationRepository extends JpaRepository<Medication, UUID> {}

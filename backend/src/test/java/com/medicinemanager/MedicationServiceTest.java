package com.medicinemanager;

import com.medicinemanager.dto.Requests;
import com.medicinemanager.entity.Unit;
import com.medicinemanager.entity.UnitType;
import com.medicinemanager.exception.NotFoundException;
import com.medicinemanager.repository.MedicationRepository;
import com.medicinemanager.repository.UnitRepository;
import com.medicinemanager.service.MedicationService;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MedicationServiceTest {
    @Test
    void createsMedicationWithExistingUnit() {
        var medications = mock(MedicationRepository.class);
        var units = mock(UnitRepository.class);
        var unit = new Unit("Milligram", "mg", UnitType.MASS);
        when(units.findById(any())).thenReturn(Optional.of(unit));
        when(medications.save(any())).thenAnswer(i -> i.getArgument(0));

        var service = new MedicationService(medications, units);
        var medication = service.create(new Requests.MedicationRequest(
                "  Dipyrone  ", new BigDecimal("500"), UUID.randomUUID()));

        assertEquals("Dipyrone", medication.getName());
        assertEquals(new BigDecimal("500"), medication.getDosageValue());
        assertSame(unit, medication.getDosageUnit());
    }

    @Test
    void rejectsUnknownDosageUnit() {
        var medications = mock(MedicationRepository.class);
        var units = mock(UnitRepository.class);
        when(units.findById(any())).thenReturn(Optional.empty());

        var service = new MedicationService(medications, units);
        assertThrows(NotFoundException.class, () -> service.create(new Requests.MedicationRequest(
                "Dipyrone", BigDecimal.ONE, UUID.randomUUID())));
    }
}

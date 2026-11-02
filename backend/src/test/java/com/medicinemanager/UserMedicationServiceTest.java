package com.medicinemanager;

import com.medicinemanager.dto.Requests.UserMedicationRequest;
import com.medicinemanager.entity.*;
import com.medicinemanager.exception.*;
import com.medicinemanager.repository.*;
import com.medicinemanager.service.UserMedicationService;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserMedicationServiceTest {
    private final UUID userId = UUID.randomUUID();
    private final UUID medicationId = UUID.randomUUID();
    private final UUID unitId = UUID.randomUUID();

    @Test
    void createsWhenReferencesAndDatesAreValid() {
        var repo = mock(UserMedicationRepository.class);
        var users = mock(AppUserRepository.class);
        var medications = mock(MedicationRepository.class);
        var units = mock(UnitRepository.class);
        var user = mock(AppUser.class);
        var medication = mock(Medication.class);
        var unit = mock(Unit.class);
        when(users.findById(userId)).thenReturn(java.util.Optional.of(user));
        when(medications.findById(medicationId)).thenReturn(java.util.Optional.of(medication));
        when(units.findById(unitId)).thenReturn(java.util.Optional.of(unit));
        when(unit.getType()).thenReturn(UnitType.MEDICATION);
        when(repo.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var request = request(LocalDate.now(), null, true);

        var result = new UserMedicationService(repo, users, medications, units).create(request);

        assertEquals(request.currentStockValue(), result.getCurrentStockValue());
        verify(repo).save(any(UserMedication.class));
    }

    @Test
    void rejectsMissingReferences() {
        var users = mock(AppUserRepository.class);
        when(users.findById(userId)).thenReturn(java.util.Optional.empty());
        var units = medicationUnits();
        var service = new UserMedicationService(mock(UserMedicationRepository.class), users,
                mock(MedicationRepository.class), units);

        assertThrows(NotFoundException.class, () -> service.create(request(LocalDate.now(), null, true)));
    }

    @Test
    void rejectsMissingMedication() {
        var medications = mock(MedicationRepository.class);
        when(medications.findById(medicationId)).thenReturn(java.util.Optional.empty());
        var service = new UserMedicationService(mock(UserMedicationRepository.class), users(), medications,
                medicationUnits());

        assertThrows(NotFoundException.class, () -> service.create(request(LocalDate.now(), null, true)));
    }

    @Test
    void rejectsMissingStockUnit() {
        var units = mock(UnitRepository.class);
        when(units.findById(unitId)).thenReturn(java.util.Optional.empty());
        var service = new UserMedicationService(mock(UserMedicationRepository.class), users(), medications(), units);

        assertThrows(NotFoundException.class, () -> service.create(request(LocalDate.now(), null, true)));
    }

    @Test
    void rejectsEndDateBeforeStartDate() {
        var service = serviceWithMedicationUnit();
        assertThrows(BusinessRuleException.class,
                () -> service.create(request(LocalDate.of(2026, 2, 2), LocalDate.of(2026, 2, 1), false)));
    }

    @Test
    void rejectsActiveMedicationEndingInPast() {
        var service = serviceWithMedicationUnit();
        assertThrows(BusinessRuleException.class,
                () -> service.create(request(LocalDate.now().minusDays(2), LocalDate.now().minusDays(1), true)));
    }

    @Test
    void rejectsDuplicateMedicationForUser() {
        var repo = mock(UserMedicationRepository.class);
        var service = serviceWithMedicationUnit(repo);
        when(repo.existsByUserIdAndMedicationId(userId, medicationId)).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.create(request(LocalDate.now(), null, true)));
    }

    @Test
    void rejectsNonMedicationStockUnit() {
        var service = new UserMedicationService(mock(UserMedicationRepository.class),
                users(), medications(), massUnits());

        assertThrows(BusinessRuleException.class, () -> service.create(request(LocalDate.now(), null, true)));
    }

    @Test
    void rejectsNegativeStock() {
        var service = serviceWithMedicationUnit();
        assertThrows(BusinessRuleException.class,
                () -> service.create(new UserMedicationRequest(userId, medicationId, BigDecimal.valueOf(-1), unitId,
                        LocalDate.now(), null, true)));
    }

    private UserMedicationService serviceWithMedicationUnit() {
        return serviceWithMedicationUnit(mock(UserMedicationRepository.class));
    }

    private UserMedicationService serviceWithMedicationUnit(UserMedicationRepository repo) {
        return new UserMedicationService(repo, users(), medications(), medicationUnits());
    }

    private UnitRepository medicationUnits() {
        return units(UnitType.MEDICATION);
    }

    private UnitRepository massUnits() {
        return units(UnitType.MASS);
    }

    private UnitRepository units(UnitType type) {
        var units = mock(UnitRepository.class);
        var unit = mock(Unit.class);
        when(units.findById(unitId)).thenReturn(java.util.Optional.of(unit));
        when(unit.getType()).thenReturn(type);
        return units;
    }

    private AppUserRepository users() {
        var users = mock(AppUserRepository.class);
        when(users.findById(userId)).thenReturn(java.util.Optional.of(mock(AppUser.class)));
        return users;
    }

    private MedicationRepository medications() {
        var medications = mock(MedicationRepository.class);
        when(medications.findById(medicationId)).thenReturn(java.util.Optional.of(mock(Medication.class)));
        return medications;
    }

    private UserMedicationRequest request(LocalDate start, LocalDate end, boolean active) {
        return new UserMedicationRequest(userId, medicationId, BigDecimal.TEN, unitId, start, end, active);
    }
}

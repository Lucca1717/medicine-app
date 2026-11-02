package com.medicinemanager;

import com.medicinemanager.dto.Requests.MedicationPeriodRequest;
import com.medicinemanager.entity.*;
import com.medicinemanager.exception.BusinessRuleException;
import com.medicinemanager.exception.ConflictException;
import com.medicinemanager.repository.*;
import com.medicinemanager.service.MedicationPeriodService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MedicationPeriodServiceTest {
    @Mock MedicationPeriodRepository medicationPeriods;
    @Mock UserMedicationRepository userMedications;
    @Mock PeriodRepository periods;
    @Mock UnitRepository units;
    @InjectMocks MedicationPeriodService service;

    private UUID userMedicationId;
    private UUID periodId;
    private Unit quantityUnit;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userMedicationId = UUID.randomUUID();
        periodId = UUID.randomUUID();
        var user = mock(AppUser.class);
        when(user.getId()).thenReturn(UUID.randomUUID());
        var userMedication = mock(UserMedication.class);
        when(userMedication.getId()).thenReturn(userMedicationId);
        when(userMedication.getUser()).thenReturn(user);
        var period = mock(com.medicinemanager.entity.Period.class);
        when(period.getId()).thenReturn(periodId);
        when(period.getUser()).thenReturn(user);
        var stockUnit = mock(Unit.class);
        when(stockUnit.getType()).thenReturn(UnitType.MEDICATION);
        quantityUnit = stockUnit;
        when(quantityUnit.getId()).thenReturn(UUID.randomUUID());
        when(userMedications.findById(userMedicationId)).thenReturn(java.util.Optional.of(userMedication));
        when(periods.findById(periodId)).thenReturn(java.util.Optional.of(period));
        when(units.findById(quantityUnit.getId())).thenReturn(java.util.Optional.of(quantityUnit));
        when(medicationPeriods.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void rejectsMedicationAndPeriodFromDifferentUsers() {
        var otherUser = mock(AppUser.class);
        when(otherUser.getId()).thenReturn(UUID.randomUUID());
        var otherPeriod = mock(com.medicinemanager.entity.Period.class);
        when(otherPeriod.getId()).thenReturn(periodId);
        when(otherPeriod.getUser()).thenReturn(otherUser);
        when(periods.findById(periodId)).thenReturn(java.util.Optional.of(otherPeriod));

        assertThrows(BusinessRuleException.class, () -> service.create(request()));
        verify(medicationPeriods, never()).save(any());
    }

    @Test
    void rejectsDuplicateMedicationPeriodPair() {
        when(medicationPeriods.existsByUserMedicationIdAndPeriodId(userMedicationId, periodId)).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.create(request()));
        verify(medicationPeriods, never()).save(any());
    }

    private MedicationPeriodRequest request() {
        return new MedicationPeriodRequest(userMedicationId, periodId, BigDecimal.valueOf(2), quantityUnit.getId());
    }
}

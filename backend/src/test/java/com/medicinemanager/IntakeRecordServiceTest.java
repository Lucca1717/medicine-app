package com.medicinemanager;

import com.medicinemanager.dto.Requests.IntakeRecordRequest;
import com.medicinemanager.entity.*;
import com.medicinemanager.exception.BusinessRuleException;
import com.medicinemanager.exception.ConflictException;
import com.medicinemanager.repository.*;
import com.medicinemanager.service.IntakeRecordService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IntakeRecordServiceTest {
    @Mock IntakeRecordRepository repository;
    @Mock MedicationPeriodRepository medicationPeriods;
    @Mock UnitRepository units;
    @Mock MedicationPeriod medicationPeriod;
    @InjectMocks IntakeRecordService service;

    private final UUID medicationPeriodId = UUID.randomUUID();
    private final UUID unitId = UUID.randomUUID();
    private final OffsetDateTime scheduledAt = OffsetDateTime.parse("2026-10-31T08:00:00Z");

    @Test
    void acceptsTakenWhenActualDataIsComplete() {
        when(medicationPeriods.findById(medicationPeriodId)).thenReturn(Optional.of(medicationPeriod));
        when(units.findById(unitId)).thenReturn(Optional.of(new Unit("Tablet", "tab", UnitType.MEDICATION)));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(new IntakeRecordRequest(medicationPeriodId, scheduledAt, scheduledAt.plusMinutes(5),
                BigDecimal.ONE, unitId, IntakeStatus.TAKEN));

        verify(repository).save(any(IntakeRecord.class));
    }

    @Test
    void rejectsTakenWithoutActualData() {
        when(medicationPeriods.findById(medicationPeriodId)).thenReturn(Optional.of(medicationPeriod));

        assertThrows(BusinessRuleException.class, () -> service.create(
                new IntakeRecordRequest(medicationPeriodId, scheduledAt, null, null, null, IntakeStatus.TAKEN)));
        verify(repository, never()).save(any());
    }

    @Test
    void rejectsPendingWithActualData() {
        when(medicationPeriods.findById(medicationPeriodId)).thenReturn(Optional.of(medicationPeriod));

        assertThrows(BusinessRuleException.class, () -> service.create(
                new IntakeRecordRequest(medicationPeriodId, scheduledAt, scheduledAt, null, null, IntakeStatus.PENDING)));
        verify(repository, never()).save(any());
    }

    @Test
    void acceptsSkippedAndOverdueWithActualData() {
        when(medicationPeriods.findById(medicationPeriodId)).thenReturn(Optional.of(medicationPeriod));
        when(units.findById(unitId)).thenReturn(Optional.of(new Unit("Tablet", "tab", UnitType.MEDICATION)));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(new IntakeRecordRequest(medicationPeriodId, scheduledAt, scheduledAt,
                BigDecimal.ONE, unitId, IntakeStatus.SKIPPED));
        service.create(new IntakeRecordRequest(medicationPeriodId, scheduledAt.plusDays(1), scheduledAt,
                BigDecimal.ONE, unitId, IntakeStatus.OVERDUE));

        verify(repository, times(2)).save(any(IntakeRecord.class));
    }

    @Test
    void rejectsDuplicateMedicationPeriodAndScheduledAt() {
        when(medicationPeriods.findById(medicationPeriodId)).thenReturn(Optional.of(medicationPeriod));
        when(repository.existsByMedicationPeriodIdAndScheduledAt(medicationPeriodId, scheduledAt)).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.create(
                new IntakeRecordRequest(medicationPeriodId, scheduledAt, null, null, null, IntakeStatus.PENDING)));
        verify(repository, never()).save(any());
    }
}

package com.medicinemanager;

import com.medicinemanager.dto.Requests.UnitRequest;
import com.medicinemanager.entity.Unit;
import com.medicinemanager.entity.UnitType;
import com.medicinemanager.exception.ConflictException;
import com.medicinemanager.repository.UnitRepository;
import com.medicinemanager.service.UnitService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UnitServiceTest {
    @Mock
    UnitRepository repository;

    @InjectMocks
    UnitService service;

    @Test
    void createsUnitWhenNameIsAvailable() {
        when(repository.existsByNameIgnoreCase("Milligram")).thenReturn(false);
        when(repository.save(any(Unit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.create(new UnitRequest("Milligram", "mg", UnitType.MASS));

        org.junit.jupiter.api.Assertions.assertEquals("Milligram", result.getName());
        org.junit.jupiter.api.Assertions.assertEquals("mg", result.getAbbreviation());
        verify(repository).save(any(Unit.class));
    }

    @Test
    void rejectsDuplicateName() {
        when(repository.existsByNameIgnoreCase("Milligram")).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> service.create(new UnitRequest("Milligram", "mg", UnitType.MASS)));

        verify(repository, never()).save(any(Unit.class));
    }
}

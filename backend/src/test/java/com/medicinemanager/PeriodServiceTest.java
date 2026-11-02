package com.medicinemanager;

import com.medicinemanager.dto.Requests.PeriodRequest;
import com.medicinemanager.entity.AppUser;
import com.medicinemanager.entity.Period;
import com.medicinemanager.exception.ConflictException;
import com.medicinemanager.repository.AppUserRepository;
import com.medicinemanager.repository.PeriodRepository;
import com.medicinemanager.service.PeriodService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PeriodServiceTest {
    @Mock
    PeriodRepository repository;
    @Mock
    AppUserRepository users;
    @InjectMocks
    PeriodService service;

    @Test
    void rejectsDuplicateNameForSameUser() {
        var userId = UUID.randomUUID();
        var user = mock(AppUser.class);
        when(user.getId()).thenReturn(userId);
        when(users.findById(userId)).thenReturn(java.util.Optional.of(user));
        when(repository.existsByUserIdAndName(userId, "Morning")).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> service.create(new PeriodRequest(userId, "Morning", LocalTime.of(8, 0))));

        verify(repository, never()).save(any(Period.class));
        verify(repository, never()).existsByUserIdAndTime(any(), any());
    }

    @Test
    void rejectsDuplicateTimeForSameUser() {
        var userId = UUID.randomUUID();
        var user = mock(AppUser.class);
        when(user.getId()).thenReturn(userId);
        when(users.findById(userId)).thenReturn(java.util.Optional.of(user));
        when(repository.existsByUserIdAndName(userId, "Night")).thenReturn(false);
        when(repository.existsByUserIdAndTime(userId, LocalTime.of(20, 0))).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> service.create(new PeriodRequest(userId, "Night", LocalTime.of(20, 0))));

        verify(repository, never()).save(any(Period.class));
    }

    @Test
    void allowsSameNameAndTimeForDifferentUser() {
        var secondUserId = UUID.randomUUID();
        var secondUser = mock(AppUser.class);
        when(secondUser.getId()).thenReturn(secondUserId);
        when(users.findById(secondUserId)).thenReturn(java.util.Optional.of(secondUser));
        when(repository.existsByUserIdAndName(secondUserId, "Morning")).thenReturn(false);
        when(repository.existsByUserIdAndTime(secondUserId, LocalTime.of(8, 0))).thenReturn(false);
        when(repository.save(any(Period.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.create(new PeriodRequest(secondUserId, "Morning", LocalTime.of(8, 0)));

        org.junit.jupiter.api.Assertions.assertEquals(secondUser, result.getUser());
        verify(repository).save(any(Period.class));
    }
}

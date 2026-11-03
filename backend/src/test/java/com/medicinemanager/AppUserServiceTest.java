package com.medicinemanager;

import com.medicinemanager.dto.request.AppUserRequest;
import com.medicinemanager.entity.AppUser;
import com.medicinemanager.exception.ConflictException;
import com.medicinemanager.repository.AppUserRepository;
import com.medicinemanager.service.AppUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
class AppUserServiceTest {
    @Mock
    AppUserRepository repository;
    @InjectMocks
    AppUserService service;

    @Test
    void hashesPasswordBeforeSaving() {
        when(repository.existsByEmail("jane@example.com")).thenReturn(false);
        when(repository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        service = new AppUserService(repository, new BCryptPasswordEncoder());

        AppUser result = service.create(new AppUserRequest("Jane", "jane@example.com", "password"));

        assertNotEquals("password", result.getPasswordHash());
        assertTrue(new BCryptPasswordEncoder().matches("password", result.getPasswordHash()));
        verify(repository).save(any(AppUser.class));
    }

    @Test
    void rejectsDuplicateEmail() {
        when(repository.existsByEmail("jane@example.com")).thenReturn(true);
        service = new AppUserService(repository, new BCryptPasswordEncoder());

        assertThrows(ConflictException.class,
                () -> service.create(new AppUserRequest("Jane", "jane@example.com", "password")));
        verify(repository, never()).save(any(AppUser.class));
    }

    @Test
    void updatesUserWithoutChangingPasswordWhenPasswordIsOmitted() {
        var id = UUID.randomUUID();
        var user = new AppUser("Jane", "jane@example.com", "existing-hash");
        when(repository.findById(id)).thenReturn(Optional.of(user));
        when(repository.existsByEmailIgnoreCaseAndIdNot("jane.new@example.com", id)).thenReturn(false);
        when(repository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        service = new AppUserService(repository, new BCryptPasswordEncoder());

        var result = service.update(id, new AppUserRequest("Jane New", "jane.new@example.com", null));

        assertEquals("Jane New", result.getName());
        assertEquals("existing-hash", result.getPasswordHash());
        assertEquals("jane.new@example.com", result.getEmail());
    }
}

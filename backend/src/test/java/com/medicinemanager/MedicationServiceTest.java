package com.medicinemanager;

import com.medicinemanager.dto.Requests;
import com.medicinemanager.repository.AppUserRepository;
import com.medicinemanager.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MedicationServiceTest {
    @Test
    void hashesPasswords() {
        var users = mock(AppUserRepository.class);
        when(users.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(users.save(any())).thenAnswer(i -> i.getArgument(0));
        var service = new UserService(users, new BCryptPasswordEncoder());
        var user = service.create(new Requests.UserRequest("Jane", "JANE@example.com", "password"));
        assertEquals("jane@example.com", user.getEmail());
        assertTrue(user.getPasswordHash().startsWith("$2"));
        assertNotEquals("password", user.getPasswordHash());
    }

    @Test
    void rejectsDuplicateEmail() {
        var users = mock(AppUserRepository.class);
        when(users.existsByEmailIgnoreCase(any())).thenReturn(true);
        var service = new UserService(users, new BCryptPasswordEncoder());
        assertThrows(RuntimeException.class,
                () -> service.create(new Requests.UserRequest("Jane", "jane@example.com", "password")));
    }
}

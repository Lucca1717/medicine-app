package com.medicinemanager.service;

import com.medicinemanager.dto.request.AppUserRequest;
import com.medicinemanager.entity.AppUser;
import com.medicinemanager.exception.ConflictException;
import com.medicinemanager.exception.NotFoundException;
import com.medicinemanager.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AppUserService {
    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AppUser> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public AppUser find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    public AppUser create(AppUserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }
        return repository.save(new AppUser(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password())));
    }
}

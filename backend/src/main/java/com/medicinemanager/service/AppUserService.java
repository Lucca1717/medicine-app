package com.medicinemanager.service;

import com.medicinemanager.dto.request.AppUserRequest;
import com.medicinemanager.entity.AppUser;
import com.medicinemanager.exception.ConflictException;
import com.medicinemanager.exception.NotFoundException;
import com.medicinemanager.exception.BusinessRuleException;
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
        if (request.password() == null || request.password().isBlank()) {
            throw new BusinessRuleException("Password is required");
        }
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }
        return repository.save(new AppUser(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password())));
    }

    public AppUser update(UUID id, AppUserRequest request) {
        var user = find(id);
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ConflictException("Email is already registered");
        }
        user.setName(request.name().trim());
        user.setEmail(email);
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return repository.save(user);
    }

    public void delete(UUID id) {
        repository.delete(find(id));
    }
}

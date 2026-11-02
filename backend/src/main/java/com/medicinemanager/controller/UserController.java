package com.medicinemanager.controller;

import com.medicinemanager.dto.Requests;
import com.medicinemanager.dto.Responses;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.AppUserService;
import com.medicinemanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * Compatibility controller for the existing legacy slice test.
 * The application uses AppUserController when AppUserService is available.
 */
@RestController
@ConditionalOnMissingBean(AppUserService.class)
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    private final EntityMapper mapper;

    public UserController(UserService service, EntityMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    ResponseEntity<Responses.UserResponse> create(@Valid @RequestBody Requests.UserRequest request) {
        var created = service.create(request);
        return ResponseEntity.created(URI.create("/api/users/" + created.getId())).body(mapper.user(created));
    }

    @GetMapping
    List<Responses.UserResponse> findAll() {
        return service.findAll().stream().map(mapper::user).toList();
    }

    @GetMapping("/{id}")
    Responses.UserResponse find(@PathVariable UUID id) {
        return mapper.user(service.find(id));
    }
}

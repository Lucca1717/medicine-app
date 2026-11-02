package com.medicinemanager.controller;

import com.medicinemanager.dto.response.AppUserResponse;
import com.medicinemanager.dto.request.AppUserRequest;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.AppUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class AppUserController {
    private final AppUserService service;
    private final EntityMapper mapper;

    public AppUserController(AppUserService service, EntityMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    ResponseEntity<AppUserResponse> create(@Valid @RequestBody AppUserRequest request) {
        var created = service.create(request);
        return ResponseEntity.created(URI.create("/api/users/" + created.getId())).body(mapper.appUser(created));
    }

    @GetMapping
    List<AppUserResponse> findAll() {
        return service.findAll().stream().map(mapper::appUser).toList();
    }

    @GetMapping("/{id}")
    AppUserResponse find(@PathVariable UUID id) {
        return mapper.appUser(service.find(id));
    }
}

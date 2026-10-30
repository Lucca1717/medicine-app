package com.medicinemanager.controller;

import com.medicinemanager.dto.*;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.net.URI;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService s;
    private final EntityMapper m;

    public UserController(UserService s, EntityMapper m) {
        this.s = s;
        this.m = m;
    }

    @PostMapping
    ResponseEntity<Responses.UserResponse> create(@Valid @RequestBody Requests.UserRequest x) {
        var created = s.create(x);
        return ResponseEntity.created(URI.create("/api/users/" + created.getId())).body(m.user(created));
    }

    @GetMapping
    List<Responses.UserResponse> all() {
        return s.findAll().stream().map(m::user).toList();
    }

    @GetMapping("/{id}")
    Responses.UserResponse one(@PathVariable UUID id) {
        return m.user(s.find(id));
    }

    @PutMapping("/{id}")
    Responses.UserResponse update(@PathVariable UUID id, @Valid @RequestBody Requests.UserRequest x) {
        return m.user(s.update(id, x));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        s.delete(id);
        return ResponseEntity.noContent().build();
    }
}

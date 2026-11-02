package com.medicinemanager.controller;

import com.medicinemanager.dto.*;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.UserMedicationService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.net.URI;

@RestController
@RequestMapping("/api/user-medications")
public class UserMedicationController {
    private final UserMedicationService s;
    private final EntityMapper m;

    public UserMedicationController(UserMedicationService s, EntityMapper m) {
        this.s = s;
        this.m = m;
    }

    @PostMapping
    ResponseEntity<Responses.UserMedicationResponse> create(@Valid @RequestBody Requests.UserMedicationRequest x) {
        var created = s.create(x);
        return ResponseEntity.created(URI.create("/api/user-medications/" + created.getId()))
                .body(m.userMedication(created));
    }

    @GetMapping
    List<Responses.UserMedicationResponse> all(@RequestParam(name = "userId") UUID userId) {
        return s.findByUserId(userId).stream().map(m::userMedication).toList();
    }

    @GetMapping("/{id}")
    Responses.UserMedicationResponse one(@PathVariable UUID id) {
        return m.userMedication(s.find(id));
    }

}

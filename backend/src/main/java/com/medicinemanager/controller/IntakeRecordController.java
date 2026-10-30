package com.medicinemanager.controller;

import com.medicinemanager.dto.*;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.IntakeRecordService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.net.URI;

@RestController
@RequestMapping("/api/intake-records")
public class IntakeRecordController {
    private final IntakeRecordService s;
    private final EntityMapper m;

    public IntakeRecordController(IntakeRecordService s, EntityMapper m) {
        this.s = s;
        this.m = m;
    }

    @PostMapping
    ResponseEntity<Responses.IntakeRecordResponse> create(@Valid @RequestBody Requests.IntakeRecordRequest x) {
        var created = s.create(x);
        return ResponseEntity.created(URI.create("/api/intake-records/" + created.getId())).body(m.intake(created));
    }

    @GetMapping
    List<Responses.IntakeRecordResponse> all() {
        return s.findAll().stream().map(m::intake).toList();
    }

    @GetMapping("/{id}")
    Responses.IntakeRecordResponse one(@PathVariable UUID id) {
        return m.intake(s.find(id));
    }

    @PutMapping("/{id}")
    Responses.IntakeRecordResponse update(@PathVariable UUID id, @Valid @RequestBody Requests.IntakeRecordRequest x) {
        return m.intake(s.update(id, x));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        s.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.medicinemanager.service;

import com.medicinemanager.dto.Requests.UnitRequest;
import com.medicinemanager.entity.*;
import com.medicinemanager.exception.*;
import com.medicinemanager.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class UnitService {
    private final UnitRepository r;

    public UnitService(UnitRepository r) {
        this.r = r;
    }

    public List<Unit> findAll() {
        return r.findAll();
    }

    public Unit find(UUID id) {
        return r.findById(id).orElseThrow(() -> new NotFoundException("Unit not found"));
    }

    public Unit create(UnitRequest x) {
        if (r.existsByNameIgnoreCase(x.name()))
            throw new ConflictException("Unit name already exists");
        return r.save(new Unit(x.name().trim(), x.abbreviation().trim(), x.type()));
    }

    public Unit update(UUID id, UnitRequest x) {
        var u = find(id);
        if (r.existsByNameIgnoreCaseAndIdNot(x.name(), id))
            throw new ConflictException("Unit name already exists");
        u.setName(x.name().trim());
        u.setAbbreviation(x.abbreviation().trim());
        u.setType(x.type());
        return r.save(u);
    }

    public void delete(UUID id) {
        r.delete(find(id));
    }
}

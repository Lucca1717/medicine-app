package com.medicinemanager.service;

import com.medicinemanager.dto.Requests.PeriodRequest;
import com.medicinemanager.entity.*;
import com.medicinemanager.exception.*;
import com.medicinemanager.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class PeriodService {
    private final PeriodRepository r;
    private final AppUserRepository users;

    public PeriodService(PeriodRepository r, AppUserRepository u) {
        this.r = r;
        users = u;
    }

    public List<Period> findByUserId(UUID userId) {
        user(userId);
        return r.findByUserId(userId);
    }

    public Period find(UUID id) {
        return r.findById(id).orElseThrow(() -> new NotFoundException("Period not found"));
    }

    public Period create(PeriodRequest x) {
        var user = user(x.userId());
        var name = x.name().trim();
        if (r.existsByUserIdAndName(user.getId(), name))
            throw new ConflictException("Period name is already registered");
        if (r.existsByUserIdAndTime(user.getId(), x.time()))
            throw new ConflictException("Period time is already registered");
        return r.save(new Period(user, name, x.time()));
    }

    private AppUser user(UUID id) {
        return users.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }
}

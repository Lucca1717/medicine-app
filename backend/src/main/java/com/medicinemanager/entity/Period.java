package com.medicinemanager.entity;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "period", uniqueConstraints = {
        @UniqueConstraint(name = "uq_period_user_name", columnNames = { "user_id", "name" }),
        @UniqueConstraint(name = "uq_period_user_time", columnNames = { "user_id", "time" }) })
public class Period {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(nullable = false)
    private LocalTime time;

    protected Period() {
    }

    public Period(AppUser u, String n, LocalTime t) {
        user = u;
        name = n;
        time = t;
    }

    public UUID getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setUser(AppUser v) {
        user = v;
    }

    public void setName(String v) {
        name = v;
    }

    public void setTime(LocalTime v) {
        time = v;
    }
}

package com.medicinemanager.entity;
import jakarta.persistence.*; import java.time.OffsetDateTime; import java.util.UUID;
@Entity @Table(name="app_user")
public class AppUser {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false,length=255) private String name;
 @Column(nullable=false,length=320,unique=true) private String email;
 @Column(name="password_hash",nullable=false,length=255) private String passwordHash;
 @Column(name="created_at",nullable=false) private OffsetDateTime createdAt;
 protected AppUser() {} public AppUser(String name,String email,String passwordHash){this.name=name;this.email=email;this.passwordHash=passwordHash;this.createdAt=OffsetDateTime.now();}
 public UUID getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPasswordHash(){return passwordHash;} public OffsetDateTime getCreatedAt(){return createdAt;}
public void setPasswordHash(String v){passwordHash=v;} }

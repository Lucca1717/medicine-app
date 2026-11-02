package com.medicinemanager.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AppUserResponse(UUID id, String name, String email, OffsetDateTime createdAt) {
}

package com.medicinemanager;

import com.medicinemanager.controller.IntakeRecordController;
import com.medicinemanager.dto.Responses;
import com.medicinemanager.entity.IntakeRecord;
import com.medicinemanager.entity.IntakeStatus;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.IntakeRecordService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IntakeRecordController.class)
class IntakeRecordControllerWebMvcTest {
    @Autowired MockMvc mvc;
    @MockBean IntakeRecordService service;
    @MockBean EntityMapper mapper;

    @Test
    void rejectsMissingStatus() throws Exception {
        mvc.perform(post("/api/intake-records").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"medicationPeriodId":"%s","scheduledAt":"2026-10-31T08:00:00Z"}
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void createsPendingRecord() throws Exception {
        var response = new Responses.IntakeRecordResponse(UUID.randomUUID(), UUID.randomUUID(),
                OffsetDateTime.parse("2026-10-31T08:00:00Z"), null, null, null, IntakeStatus.PENDING);
        when(service.create(any())).thenReturn(org.mockito.Mockito.mock(IntakeRecord.class));
        when(mapper.intake(any())).thenReturn(response);

        mvc.perform(post("/api/intake-records").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"medicationPeriodId":"%s","scheduledAt":"2026-10-31T08:00:00Z","status":"PENDING"}
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}

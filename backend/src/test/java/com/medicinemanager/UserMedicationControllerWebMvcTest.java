package com.medicinemanager;

import com.medicinemanager.controller.UserMedicationController;
import com.medicinemanager.dto.Responses;
import com.medicinemanager.entity.UserMedication;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.UserMedicationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserMedicationController.class)
class UserMedicationControllerWebMvcTest {
    @Autowired MockMvc mvc;
    @MockBean UserMedicationService service;
    @MockBean EntityMapper mapper;

    @Test
    void rejectsInvalidRequest() throws Exception {
        mvc.perform(post("/api/user-medications").contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":null,\"medicationId\":null,\"currentStockValue\":-1,\"stockUnitId\":null,\"startDate\":null,\"active\":null}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void createsUserMedication() throws Exception {
        var response = new Responses.UserMedicationResponse(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                BigDecimal.TEN, UUID.randomUUID(), LocalDate.now(), null, true);
        when(service.create(any())).thenReturn(mock(UserMedication.class));
        when(mapper.userMedication(any())).thenReturn(response);

        mvc.perform(post("/api/user-medications").contentType(MediaType.APPLICATION_JSON).content("""
                {"userId":"11111111-1111-1111-1111-111111111111",
                 "medicationId":"22222222-2222-2222-2222-222222222222",
                 "currentStockValue":10,"stockUnitId":"33333333-3333-3333-3333-333333333333",
                 "startDate":"2026-01-01","active":true}
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.currentStockValue").value(10));
    }
}

package com.medicinemanager;

import com.medicinemanager.controller.MedicationPeriodController;
import com.medicinemanager.dto.Responses;
import com.medicinemanager.entity.MedicationPeriod;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.MedicationPeriodService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MedicationPeriodController.class)
class MedicationPeriodControllerWebMvcTest {
    @Autowired MockMvc mvc;
    @MockBean MedicationPeriodService service;
    @MockBean EntityMapper mapper;

    @Test
    void rejectsInvalidMedicationPeriodRequest() throws Exception {
        mvc.perform(post("/api/medication-periods")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userMedicationId\":null,\"periodId\":null,\"quantityValue\":0,\"quantityUnitId\":null}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void createsMedicationPeriod() throws Exception {
        var response = new Responses.MedicationPeriodResponse(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), BigDecimal.valueOf(2), UUID.randomUUID());
        when(service.create(any())).thenReturn(mock(MedicationPeriod.class));
        when(mapper.medicationPeriod(any())).thenReturn(response);

        mvc.perform(post("/api/medication-periods")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userMedicationId\":\"11111111-1111-1111-1111-111111111111\","
                        + "\"periodId\":\"22222222-2222-2222-2222-222222222222\","
                        + "\"quantityValue\":2,\"quantityUnitId\":\"33333333-3333-3333-3333-333333333333\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantityValue").value(2));
    }
}

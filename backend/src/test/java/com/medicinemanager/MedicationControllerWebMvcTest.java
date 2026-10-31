package com.medicinemanager;

import com.medicinemanager.controller.MedicationController;
import com.medicinemanager.dto.Responses;
import com.medicinemanager.entity.Medication;
import com.medicinemanager.entity.Unit;
import com.medicinemanager.entity.UnitType;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.MedicationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MedicationController.class)
class MedicationControllerWebMvcTest {
    @Autowired MockMvc mvc;
    @MockBean MedicationService service;
    @MockBean EntityMapper mapper;

    @Test
    void rejectsInvalidMedicationRequest() throws Exception {
        mvc.perform(post("/api/medications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"dosageValue\":0,\"dosageUnitId\":null}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void createsMedication() throws Exception {
        var unit = new Unit("Milligram", "mg", UnitType.MASS);
        var medication = new Medication("Dipyrone", new BigDecimal("500"), unit);
        var unitId = UUID.randomUUID();
        var response = new Responses.MedicationResponse(UUID.randomUUID(), "Dipyrone", new BigDecimal("500"), unitId);
        when(service.create(any())).thenReturn(medication);
        when(mapper.medication(medication)).thenReturn(response);

        mvc.perform(post("/api/medications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Dipyrone\",\"dosageValue\":500,\"dosageUnitId\":\""
                                + unitId + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Dipyrone"))
                .andExpect(jsonPath("$.dosageValue").value(500));
    }
}

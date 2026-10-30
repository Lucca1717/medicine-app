package com.medicinemanager;

import com.medicinemanager.controller.UnitController;
import com.medicinemanager.dto.Responses;
import com.medicinemanager.entity.Unit;
import com.medicinemanager.entity.UnitType;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.UnitService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UnitController.class)
class UnitControllerWebMvcTest {
    @Autowired
    MockMvc mvc;

    @MockBean
    UnitService service;

    @MockBean
    EntityMapper mapper;

    @Test
    void rejectsInvalidUnitRequest() throws Exception {
        mvc.perform(post("/api/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"abbreviation\":\"\",\"type\":null}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void createsUnit() throws Exception {
        var unit = new Unit("Milligram", "mg", UnitType.MASS);
        var response = new Responses.UnitResponse(UUID.randomUUID(), "Milligram", "mg", UnitType.MASS);
        when(service.create(any())).thenReturn(unit);
        when(mapper.unit(unit)).thenReturn(response);

        mvc.perform(post("/api/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Milligram\",\"abbreviation\":\"mg\",\"type\":\"MASS\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Milligram"))
                .andExpect(jsonPath("$.abbreviation").value("mg"));
    }
}

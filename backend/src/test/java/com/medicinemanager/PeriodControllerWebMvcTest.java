package com.medicinemanager;

import com.medicinemanager.controller.PeriodController;
import com.medicinemanager.dto.Responses;
import com.medicinemanager.entity.Period;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.PeriodService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PeriodController.class)
class PeriodControllerWebMvcTest {
    @Autowired
    MockMvc mvc;
    @MockBean
    PeriodService service;
    @MockBean
    EntityMapper mapper;

    @Test
    void rejectsInvalidPeriodRequest() throws Exception {
        mvc.perform(post("/api/periods").contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":null,\"name\":\"\",\"time\":null}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void createsPeriod() throws Exception {
        var period = mock(Period.class);
        var id = UUID.randomUUID();
        when(period.getId()).thenReturn(id);
        when(service.create(any())).thenReturn(period);
        when(mapper.period(period)).thenReturn(
                new Responses.PeriodResponse(id, UUID.randomUUID(), "Morning", LocalTime.of(8, 0)));

        mvc.perform(post("/api/periods").contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"" + UUID.randomUUID() + "\",\"name\":\"Morning\",\"time\":\"08:00:00\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/periods/" + id))
                .andExpect(jsonPath("$.name").value("Morning"))
                .andExpect(jsonPath("$.time").value("08:00:00"));
    }
}

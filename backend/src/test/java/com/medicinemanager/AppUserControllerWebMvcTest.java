package com.medicinemanager;

import com.medicinemanager.controller.AppUserController;
import com.medicinemanager.dto.response.AppUserResponse;
import com.medicinemanager.entity.AppUser;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.AppUserService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppUserController.class)
class AppUserControllerWebMvcTest {
    @Autowired
    MockMvc mvc;
    @MockBean
    AppUserService service;
    @MockBean
    EntityMapper mapper;

    @Test
    void responseDoesNotContainPassword() throws Exception {
        var user = new AppUser("Jane", "jane@example.com", "hash");
        var response = new AppUserResponse(UUID.randomUUID(), "Jane", "jane@example.com", OffsetDateTime.now());
        when(service.create(any())).thenReturn(user);
        when(mapper.appUser(user)).thenReturn(response);

        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Jane\",\"email\":\"jane@example.com\",\"password\":\"password\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("jane@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void rejectsInvalidRequest() throws Exception {
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"email\":\"bad\",\"password\":\"short\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }
}

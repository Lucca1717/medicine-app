package com.medicinemanager;

import com.medicinemanager.controller.UserController;
import com.medicinemanager.dto.Responses;
import com.medicinemanager.entity.AppUser;
import com.medicinemanager.mapper.EntityMapper;
import com.medicinemanager.service.UserService;
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

@WebMvcTest(UserController.class)
class ControllerWebMvcTest {
    @Autowired
    MockMvc mvc;
    @MockBean
    UserService service;
    @MockBean
    EntityMapper mapper;

    @Test
    void rejectsInvalidUserRequest() throws Exception {
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\",\"email\":\"bad\",\"password\":\"x\"}"))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void createsUser() throws Exception {
        var u = new AppUser("Jane", "jane@example.com", "hash");
        when(service.create(any())).thenReturn(u);
        when(mapper.user(any())).thenReturn(
                new Responses.UserResponse(UUID.randomUUID(), "Jane", "jane@example.com", OffsetDateTime.now()));
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Jane\",\"email\":\"jane@example.com\",\"password\":\"password\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.email").value("jane@example.com"));
    }
}

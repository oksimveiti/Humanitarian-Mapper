package com.semihcetin.project.humapperbackend.auth;

import com.semihcetin.project.humapperbackend.AbstractPostgisIntegrationTest;
import com.semihcetin.project.humapperbackend.user.Role;
import com.semihcetin.project.humapperbackend.user.User;
import com.semihcetin.project.humapperbackend.user.UserRepository;
import com.semihcetin.project.humapperbackend.user.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class AuthControllerTest extends AbstractPostgisIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository users;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private void saveUser(String email, String rawPassword, UserStatus status) {
        users.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(Role.ORG_MEMBER)
                .status(status)
                .build());
    }

    @Test
    void activeUserCanLogIn() throws Exception {
        saveUser("login-active@ngo.org", "secret123", UserStatus.ACTIVE);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login-active@ngo.org\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        saveUser("login-wrong@ngo.org", "secret123", UserStatus.ACTIVE);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login-wrong@ngo.org\",\"password\":\"WRONG\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invitedUserCannotLogIn() throws Exception {
        saveUser("login-invited@ngo.org", "secret123", UserStatus.INVITED);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login-invited@ngo.org\",\"password\":\"secret123\"}"))
                .andExpect(status().isUnauthorized());
    }
}
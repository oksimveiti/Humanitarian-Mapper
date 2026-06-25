package com.semihcetin.project.humapperbackend.auth;

import com.semihcetin.project.humapperbackend.AbstractPostgisIntegrationTest;
import com.semihcetin.project.humapperbackend.user.InviteResponse;
import com.semihcetin.project.humapperbackend.user.OrganizationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ActivationTest extends AbstractPostgisIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private OrganizationService organizationService;

    @Test
    void invitedUserActivatesAndLogsIn() throws Exception {
        InviteResponse invite = organizationService.createOrganization("E2E NGO", "e2e@ngo.org");

        // davet token'ı ile şifre belirle
        mockMvc.perform(post("/api/auth/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + invite.inviteToken() + "\",\"newPassword\":\"newpass123\"}"))
                .andExpect(status().isOk());

        // yeni şifreyle giriş yap
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"e2e@ngo.org\",\"password\":\"newpass123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void invalidTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"does-not-exist\",\"newPassword\":\"newpass123\"}"))
                .andExpect(status().isBadRequest());
    }
}
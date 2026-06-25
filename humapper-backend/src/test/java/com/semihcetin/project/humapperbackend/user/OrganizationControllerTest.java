package com.semihcetin.project.humapperbackend.user;

import com.semihcetin.project.humapperbackend.AbstractPostgisIntegrationTest;
import com.semihcetin.project.humapperbackend.auth.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class OrganizationControllerTest extends AbstractPostgisIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtService jwtService;

    private String tokenForRole(Role role) {
        return jwtService.generateToken(User.builder().id(1L).role(role).build());
    }

    @Test
    void coordinatorCanCreateOrganization() throws Exception {
        mockMvc.perform(post("/api/organizations")
                        .header("Authorization", "Bearer " + tokenForRole(Role.COORDINATOR))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orgName\":\"Test NGO\",\"contactEmail\":\"new-ngo@example.org\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.inviteToken").isNotEmpty())
                .andExpect(jsonPath("$.organizationId").isNumber());
    }

    @Test
    void orgMemberIsForbidden() throws Exception {
        mockMvc.perform(post("/api/organizations")
                        .header("Authorization", "Bearer " + tokenForRole(Role.ORG_MEMBER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orgName\":\"X\",\"contactEmail\":\"x@example.org\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noTokenIsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/organizations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orgName\":\"Y\",\"contactEmail\":\"y@example.org\"}"))
                .andExpect(status().isUnauthorized());
    }
}
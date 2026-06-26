package com.semihcetin.project.humapperbackend.activity;

import com.semihcetin.project.humapperbackend.AbstractPostgisIntegrationTest;
import com.semihcetin.project.humapperbackend.auth.JwtService;
import com.semihcetin.project.humapperbackend.sector.SectorRepository;
import com.semihcetin.project.humapperbackend.user.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ActivityControllerTest extends AbstractPostgisIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private OrganizationRepository organizations;
    @Autowired private UserRepository users;
    @Autowired private SectorRepository sectors;

    @Test
    void orgMemberCanCreateActivity() throws Exception {
        Organization org = organizations.save(Organization.builder().name("Creator NGO").build());
        User member = users.save(User.builder()
                .email("creator@ngo.org").role(Role.ORG_MEMBER).status(UserStatus.ACTIVE)
                .organization(org).build());
        Long sectorId = sectors.findAll().get(0).getId();
        String token = jwtService.generateToken(member);

        String body = """
                {
                  "geometry": {"type":"Point","coordinates":[36.2,36.2]},
                  "sectorIds": [%d],
                  "status": "IMPLEMENTATION"
                }
                """.formatted(sectorId);

        mockMvc.perform(post("/api/activities")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.geometry.type").value("Point"))
                .andExpect(jsonPath("$.sectors.length()").value(1));
    }

    @Test
    void coordinatorIsForbidden() throws Exception {
        String token = jwtService.generateToken(User.builder().id(99999L).role(Role.COORDINATOR).build());
        mockMvc.perform(post("/api/activities")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"geometry\":{\"type\":\"Point\",\"coordinates\":[36.2,36.2]},\"sectorIds\":[1],\"status\":\"PLANNING\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noTokenIsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/activities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
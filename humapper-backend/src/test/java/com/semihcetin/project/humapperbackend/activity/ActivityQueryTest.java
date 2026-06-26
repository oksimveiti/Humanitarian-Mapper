package com.semihcetin.project.humapperbackend.activity;

import com.semihcetin.project.humapperbackend.AbstractPostgisIntegrationTest;
import com.semihcetin.project.humapperbackend.auth.JwtService;
import com.semihcetin.project.humapperbackend.sector.SectorRepository;
import com.semihcetin.project.humapperbackend.user.Organization;
import com.semihcetin.project.humapperbackend.user.OrganizationRepository;
import com.semihcetin.project.humapperbackend.user.Role;
import com.semihcetin.project.humapperbackend.user.User;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ActivityQueryTest extends AbstractPostgisIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private ActivityRepository activities;
    @Autowired private OrganizationRepository organizations;
    @Autowired private SectorRepository sectors;

    private Long createActivity() {
        Organization org = organizations.save(Organization.builder().name("Query NGO").build());
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point point = gf.createPoint(new Coordinate(36.2, 36.2));
        Activity a = activities.save(Activity.builder()
                .organization(org).geom(point).status(ActivityStatus.PLANNING)
                .sectors(new HashSet<>(Set.of(sectors.findAll().get(0)))).build());
        return a.getId();
    }

    private String token() {
        return jwtService.generateToken(User.builder().id(1L).role(Role.ORG_MEMBER).build());
    }

    @Test
    void getsActivityById() throws Exception {
        Long id = createActivity();
        mockMvc.perform(get("/api/activities/" + id).header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.geometry.type").value("Point"));
    }

    @Test
    void listsActivities() throws Exception {
        createActivity();
        mockMvc.perform(get("/api/activities").header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    void unknownIdReturns404() throws Exception {
        mockMvc.perform(get("/api/activities/999999").header("Authorization", "Bearer " + token()))
                .andExpect(status().isNotFound());
    }

    @Test
    void requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/activities")).andExpect(status().isUnauthorized());
    }
}
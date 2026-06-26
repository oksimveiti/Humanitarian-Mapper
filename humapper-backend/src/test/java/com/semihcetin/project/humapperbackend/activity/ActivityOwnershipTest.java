package com.semihcetin.project.humapperbackend.activity;

import com.semihcetin.project.humapperbackend.AbstractPostgisIntegrationTest;
import com.semihcetin.project.humapperbackend.auth.JwtService;
import com.semihcetin.project.humapperbackend.sector.SectorRepository;
import com.semihcetin.project.humapperbackend.user.*;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ActivityOwnershipTest extends AbstractPostgisIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private ActivityRepository activities;
    @Autowired private OrganizationRepository organizations;
    @Autowired private UserRepository users;
    @Autowired private SectorRepository sectors;

    private User member(String email, Organization org) {
        return users.save(User.builder().email(email).role(Role.ORG_MEMBER)
                .status(UserStatus.ACTIVE).organization(org).build());
    }

    private Long activityFor(Organization org) {
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point p = gf.createPoint(new Coordinate(36.2, 36.2));
        return activities.save(Activity.builder().organization(org).geom(p)
                .status(ActivityStatus.PLANNING)
                .sectors(new HashSet<>(Set.of(sectors.findAll().get(0)))).build()).getId();
    }

    private String body() {
        return """
                {"geometry":{"type":"Point","coordinates":[37.0,37.0]},"sectorIds":[%d],"status":"COMPLETED"}
                """.formatted(sectors.findAll().get(0).getId());
    }

    @Test
    void ownerCanUpdate() throws Exception {
        Organization org = organizations.save(Organization.builder().name("Owner A").build());
        User owner = member("owner-a@ngo.org", org);
        Long id = activityFor(org);

        mockMvc.perform(put("/api/activities/" + id)
                        .header("Authorization", "Bearer " + jwtService.generateToken(owner))
                        .contentType(MediaType.APPLICATION_JSON).content(body()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void otherOrgCannotUpdate() throws Exception {
        Organization orgA = organizations.save(Organization.builder().name("Org A2").build());
        Organization orgB = organizations.save(Organization.builder().name("Org B2").build());
        User intruder = member("intruder@ngo.org", orgB);
        Long id = activityFor(orgA);

        mockMvc.perform(put("/api/activities/" + id)
                        .header("Authorization", "Bearer " + jwtService.generateToken(intruder))
                        .contentType(MediaType.APPLICATION_JSON).content(body()))
                .andExpect(status().isForbidden());
    }

    @Test
    void ownerCanDelete() throws Exception {
        Organization org = organizations.save(Organization.builder().name("Owner C").build());
        User owner = member("owner-c@ngo.org", org);
        Long id = activityFor(org);

        mockMvc.perform(delete("/api/activities/" + id)
                        .header("Authorization", "Bearer " + jwtService.generateToken(owner)))
                .andExpect(status().isNoContent());
    }
}
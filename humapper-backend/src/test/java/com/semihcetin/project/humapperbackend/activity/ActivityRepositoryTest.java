package com.semihcetin.project.humapperbackend.activity;

import com.semihcetin.project.humapperbackend.AbstractPostgisIntegrationTest;
import com.semihcetin.project.humapperbackend.sector.Sector;
import com.semihcetin.project.humapperbackend.sector.SectorRepository;
import com.semihcetin.project.humapperbackend.user.Organization;
import com.semihcetin.project.humapperbackend.user.OrganizationRepository;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ActivityRepositoryTest extends AbstractPostgisIntegrationTest {

    @Autowired
    private ActivityRepository activities;
    @Autowired
    private OrganizationRepository organizations;
    @Autowired
    private SectorRepository sectors;

    @Test
    @Transactional
    void savesAndReadsActivityWithGeometryAndSector() {
        Organization org = organizations.save(Organization.builder().name("Geo NGO").build());
        Sector sector = sectors.findAll().get(0);

        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point point = gf.createPoint(new Coordinate(36.2, 36.2)); // boylam, enlem (Hatay civarı)

        Activity activity = activities.save(Activity.builder()
                .organization(org)
                .geom(point)
                .status(ActivityStatus.IMPLEMENTATION)
                .sectors(new HashSet<>(Set.of(sector)))
                .build());

        Activity found = activities.findById(activity.getId()).orElseThrow();

        assertThat(found.getGeom()).isInstanceOf(Point.class);
        assertThat(found.getStatus()).isEqualTo(ActivityStatus.IMPLEMENTATION);
        assertThat(found.getSectors()).hasSize(1);
        assertThat(found.getLastUpdated()).isNotNull();
    }
}
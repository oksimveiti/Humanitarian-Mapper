package com.semihcetin.project.humapperbackend;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Base class for integration tests that need a real PostGIS database.
 *
 * Uses the Testcontainers "singleton container" pattern: the container is started once in a
 * static initializer and shared by every subclass for the whole test run (Testcontainers' Ryuk
 * reaper stops it at JVM exit). We deliberately do NOT use @Testcontainers/@Container here,
 * because their per-class lifecycle would stop the shared container between subclasses while the
 * cached Spring context still points at the old port — causing "connection refused" errors.
 */
@SpringBootTest
public abstract class AbstractPostgisIntegrationTest {

    static final PostgreSQLContainer<?> POSTGIS = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:16-3.4")
                    .asCompatibleSubstituteFor("postgres"));

    static {
        POSTGIS.start();
    }

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGIS::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGIS::getUsername);
        registry.add("spring.datasource.password", POSTGIS::getPassword);
    }
}

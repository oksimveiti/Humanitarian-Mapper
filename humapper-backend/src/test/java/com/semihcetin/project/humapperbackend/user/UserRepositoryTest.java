package com.semihcetin.project.humapperbackend.user;

import com.semihcetin.project.humapperbackend.repository.OrganizationRepository;
import com.semihcetin.project.humapperbackend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest
class UserRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgis = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:16-3.4")
                    .asCompatibleSubstituteFor("postgres")
    );

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgis::getJdbcUrl);
        registry.add("spring.datasource.username", postgis::getUsername);
        registry.add("spring.datasource.password", postgis::getPassword);
    }

    @Autowired
    private OrganizationRepository organizations;
    @Autowired
    private UserRepository users;

    @Test
    @Transactional
    void savesAndFindsUserByEmail() {
        Organization org = organizations.save(
                Organization.builder().name("Test NGO").contactEmail("ngo@example.org").build()
        );

        users.save(User.builder()
                .email("semih@ngo.org")
                .role(Role.ORG_MEMBER)
                .status(UserStatus.INVITED)
                .organization(org)
                .build()
        );

        Optional<User> found = users.findByEmail("semih@ngo.org");

        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(UserStatus.INVITED);
        assertThat(found.get().getOrganization().getName()).isEqualTo("Test NGO");
    }
}

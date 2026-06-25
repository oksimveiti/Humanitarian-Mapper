package com.semihcetin.project.humapperbackend.config;

import com.semihcetin.project.humapperbackend.AbstractPostgisIntegrationTest;
import com.semihcetin.project.humapperbackend.user.Role;
import com.semihcetin.project.humapperbackend.user.User;
import com.semihcetin.project.humapperbackend.user.UserRepository;
import com.semihcetin.project.humapperbackend.user.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class DataBootstrapTest extends AbstractPostgisIntegrationTest {

    @Autowired
    private UserRepository users;

    @Value("${admin.email}")
    private String adminEmail;

    @Test
    void seedsInitialCoordinator() {
        Optional<User> admin = users.findByEmail(adminEmail);

        assertThat(admin).isPresent();
        assertThat(admin.get().getRole()).isEqualTo(Role.COORDINATOR);
        assertThat(admin.get().getStatus()).isEqualTo(UserStatus.ACTIVE);
    }
}
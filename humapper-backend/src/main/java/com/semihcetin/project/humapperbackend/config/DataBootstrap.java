package com.semihcetin.project.humapperbackend.config;

import com.semihcetin.project.humapperbackend.user.Role;
import com.semihcetin.project.humapperbackend.user.User;
import com.semihcetin.project.humapperbackend.user.UserRepository;
import com.semihcetin.project.humapperbackend.user.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataBootstrap implements ApplicationRunner {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataBootstrap(UserRepository users, PasswordEncoder passwordEncoder,
                         @Value("${admin.email}") String adminEmail,
                         @Value("${admin.password}") String adminPassword) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (users.findByEmail(adminEmail).isEmpty()) {
            users.save(User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.COORDINATOR)
                    .status(UserStatus.ACTIVE)
                    .build()
            );
        }
    }
}

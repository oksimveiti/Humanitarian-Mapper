package com.semihcetin.project.humapperbackend.auth;

import com.semihcetin.project.humapperbackend.user.Role;
import com.semihcetin.project.humapperbackend.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("test-secret-that-is-at-least-32-bytes-long!!", 3_600_000);

    @Test
    void generatesAndParsesToken() {
        User user = User.builder().id(42L).role(Role.COORDINATOR).build();

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.parse(token);

        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.get("role", String.class)).isEqualTo("COORDINATOR");
    }

    @Test
    void rejectsTamperedToken() {
        User user = User.builder().id(1L).role(Role.ORG_MEMBER).build();
        String token = jwtService.generateToken(user);
        String tampered = token.substring(0, token.length() - 2) + "xx";

        assertThatThrownBy(() -> jwtService.parse(tampered))
                .isInstanceOf(JwtException.class);
    }
}

package com.semihcetin.project.humapperbackend.user;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserRepository users;

    public MeController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    public Map<String, Object> me(Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
        result.put("userId", authentication.getName());
        result.put("authorities", authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList());

        users.findById(Long.valueOf(authentication.getName())).ifPresent(user -> {
            result.put("role", user.getRole().name());
            Organization org = user.getOrganization();
            result.put("organizationId", org != null ? org.getId() : null);
            result.put("organizationName", org != null ? org.getName() : null);
        });

        return result;
    }
}

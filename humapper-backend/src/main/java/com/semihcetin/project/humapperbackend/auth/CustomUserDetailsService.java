package com.semihcetin.project.humapperbackend.auth;

import com.semihcetin.project.humapperbackend.user.User;
import com.semihcetin.project.humapperbackend.user.UserRepository;
import com.semihcetin.project.humapperbackend.user.UserStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository users;

    public CustomUserDetailsService(UserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No user with email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash() == null ? "" : user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().name())
                .disabled(user.getStatus() != UserStatus.ACTIVE)
                .build();
    }
}

package com.semihcetin.project.humapperbackend.auth;

import com.semihcetin.project.humapperbackend.user.InviteToken;
import com.semihcetin.project.humapperbackend.user.InviteTokenRepository;
import com.semihcetin.project.humapperbackend.user.User;
import com.semihcetin.project.humapperbackend.user.UserStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class AuthService {

    private final InviteTokenRepository inviteTokens;
    private final PasswordEncoder passwordEncoder;

    public AuthService(InviteTokenRepository inviteTokens, PasswordEncoder passwordEncoder) {
        this.inviteTokens = inviteTokens;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void activate(String token, String rawPassword) {
        InviteToken inviteToken = inviteTokens.findByToken(token)
                .orElseThrow(() -> new InvalidInviteException("Invalid invite token"));

        if (inviteToken.getConsumedAt() != null) {
            throw new InvalidInviteException("Invite token already used");
        }

        if (inviteToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new InvalidInviteException("Invite token expired");
        }

        User user = inviteToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setStatus(UserStatus.ACTIVE);

        inviteToken.setConsumedAt(OffsetDateTime.now());
    }
}

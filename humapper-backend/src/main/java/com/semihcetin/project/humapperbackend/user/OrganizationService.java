package com.semihcetin.project.humapperbackend.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationRepository organizations;
    private final UserRepository users;
    private final InviteTokenRepository inviteTokens;

    public OrganizationService(OrganizationRepository organizations, UserRepository users, InviteTokenRepository inviteTokens) {
        this.organizations = organizations;
        this.users = users;
        this.inviteTokens = inviteTokens;
    }

    @Transactional
    public InviteResponse createOrganization(String orgName, String contactEmail) {
        Organization org = organizations.save(Organization.builder()
                        .name(orgName)
                        .contactEmail(contactEmail)
                        .build()
        );

        User user = users.save(User.builder()
                .email(contactEmail)
                .role(Role.ORG_MEMBER)
                .status(UserStatus.INVITED)
                .organization(org)
                .build()
        );

        String token = UUID.randomUUID().toString();
        inviteTokens.save(InviteToken.builder()
                .token(token)
                .user(user)
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build()
        );

        return new InviteResponse(org.getId(), token);
    }
}

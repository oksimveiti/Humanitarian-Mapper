package com.semihcetin.project.humapperbackend.user;

import com.semihcetin.project.humapperbackend.activity.ActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationRepository organizations;
    private final UserRepository users;
    private final InviteTokenRepository inviteTokens;
    private final ActivityRepository activities;

    public OrganizationService(OrganizationRepository organizations, UserRepository users,
                               InviteTokenRepository inviteTokens, ActivityRepository activities) {
        this.organizations = organizations;
        this.users = users;
        this.inviteTokens = inviteTokens;
        this.activities = activities;
    }

    @Transactional(readOnly = true)
    public List<OrganizationSummary> listOrganizations() {
        return organizations.findAll().stream()
                .map(org -> {
                    String accountStatus = users.findFirstByOrganization(org)
                            .map(u -> u.getStatus().name())
                            .orElse("UNKNOWN");
                    long activityCount = activities.countByOrganizationId(org.getId());
                    return new OrganizationSummary(
                            org.getId(), org.getName(), org.getContactEmail(),
                            accountStatus, activityCount, org.getCreatedAt());
                })
                .toList();
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

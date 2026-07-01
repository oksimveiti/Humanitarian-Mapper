package com.semihcetin.project.humapperbackend.user;

import java.time.OffsetDateTime;

public record OrganizationSummary(
        Long id,
        String name,
        String contactEmail,
        OrganizationType type,
        String accountStatus,   // INVITED | ACTIVE | SUSPENDED (the org's user status)
        long activityCount,
        OffsetDateTime createdAt
) {
}

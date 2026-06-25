package com.semihcetin.project.humapperbackend.user;

public record InviteResponse(
        Long organizationId,
        String inviteToken
) {
}

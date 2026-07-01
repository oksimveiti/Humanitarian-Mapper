package com.semihcetin.project.humapperbackend.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrganizationRequest(
        @NotBlank String orgName,
        @Email @NotBlank String contactEmail,
        @NotNull OrganizationType type
) {
}
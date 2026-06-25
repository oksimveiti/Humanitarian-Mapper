package com.semihcetin.project.humapperbackend.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateOrganizationRequest(
        @NotBlank String orgName,
        @Email @NotBlank String contactEmail
) {
}
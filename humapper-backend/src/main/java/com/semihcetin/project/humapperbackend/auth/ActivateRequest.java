package com.semihcetin.project.humapperbackend.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActivateRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8) String newPassword
) {
}

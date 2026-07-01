package com.semihcetin.project.humapperbackend.settings;

import jakarta.validation.constraints.NotNull;

public record UpdateSettingsRequest(
        @NotNull MapVisibility mapVisibility
) {
}

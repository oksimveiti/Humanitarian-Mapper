package com.semihcetin.project.humapperbackend.settings;

import java.time.OffsetDateTime;

public record SettingsResponse(
        MapVisibility mapVisibility,
        boolean configured,
        OffsetDateTime updatedAt
) {
    public static SettingsResponse from(InstanceSettings s) {
        return new SettingsResponse(s.getMapVisibility(), s.isConfigured(), s.getUpdatedAt());
    }
}

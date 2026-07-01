package com.semihcetin.project.humapperbackend.settings;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private static final long SETTINGS_ID = 1L;

    private final InstanceSettingsRepository repo;

    public SettingsService(InstanceSettingsRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public InstanceSettings get() {
        return repo.findById(SETTINGS_ID)
                .orElseThrow(() -> new IllegalStateException("Instance settings row is missing"));
    }

    @Transactional(readOnly = true)
    public MapVisibility currentMapVisibility() {
        return repo.findById(SETTINGS_ID)
                .map(InstanceSettings::getMapVisibility)
                .orElse(MapVisibility.ALL);
    }

    @Transactional
    public InstanceSettings update(MapVisibility visibility) {
        InstanceSettings settings = get();
        settings.setMapVisibility(visibility);
        settings.setConfigured(true);
        return settings; // dirty-checking flush; @PreUpdate refreshes updatedAt
    }
}

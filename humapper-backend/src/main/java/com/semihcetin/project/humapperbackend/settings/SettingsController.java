package com.semihcetin.project.humapperbackend.settings;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService service;

    public SettingsController(SettingsService service) {
        this.service = service;
    }

    // All authenticated users can read settings (the UI uses them to gate views).
    @GetMapping
    public SettingsResponse get() {
        return SettingsResponse.from(service.get());
    }

    @PutMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public SettingsResponse update(@Valid @RequestBody UpdateSettingsRequest request) {
        return SettingsResponse.from(service.update(request.mapVisibility()));
    }
}

package com.semihcetin.project.humapperbackend.activity;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService service;

    public ActivityController(ActivityService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ORG_MEMBER')")
    public ActivityResponse create(@Valid @RequestBody CreateActivityRequest request,
                                   Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return service.create(request, userId);
    }
}

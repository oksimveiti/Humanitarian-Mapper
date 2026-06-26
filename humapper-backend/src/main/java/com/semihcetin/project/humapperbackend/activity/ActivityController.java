package com.semihcetin.project.humapperbackend.activity;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public List<ActivityResponse> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ActivityResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_MEMBER')")
    public ActivityResponse update(@PathVariable Long id,
                                   @Valid @RequestBody CreateActivityRequest request,
                                   Authentication authentication) {
        return service.update(id, request, Long.valueOf(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ORG_MEMBER')")
    public void delete(@PathVariable Long id,
                       Authentication authentication) {
        service.delete(id, Long.valueOf(authentication.getName()));
    }
}

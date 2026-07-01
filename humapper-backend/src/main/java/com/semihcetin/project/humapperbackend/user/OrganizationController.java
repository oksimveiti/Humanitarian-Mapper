package com.semihcetin.project.humapperbackend.user;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService service;

    public OrganizationController(OrganizationService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public List<OrganizationSummary> list() {
        return service.listOrganizations();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('COORDINATOR')")
    public InviteResponse create(@Valid @RequestBody CreateOrganizationRequest request) {
        return service.createOrganization(request.orgName(), request.contactEmail(), request.type());
    }
}

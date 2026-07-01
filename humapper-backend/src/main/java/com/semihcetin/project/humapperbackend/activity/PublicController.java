package com.semihcetin.project.humapperbackend.activity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Unauthenticated read-only access via a coordinator-generated share token.
// Returns only approved activities; the token is validated in the service.
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ActivityService activities;

    public PublicController(ActivityService activities) {
        this.activities = activities;
    }

    @GetMapping("/{token}/activities")
    public List<ActivityResponse> activities(@PathVariable String token) {
        return activities.findPublic(token);
    }
}

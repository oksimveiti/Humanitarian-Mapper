package com.semihcetin.project.humapperbackend.settings;

// Controls who sees which activities on the shared map / list.
public enum MapVisibility {
    ALL,           // everyone sees every activity (distinguished by review badge)
    APPROVED_ONLY  // shared view shows only approved; orgs still see their own in-progress
}

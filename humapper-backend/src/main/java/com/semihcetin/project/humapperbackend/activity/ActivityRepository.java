package com.semihcetin.project.humapperbackend.activity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    long countByOrganizationId(Long organizationId);
}

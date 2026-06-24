package com.semihcetin.project.humapperbackend.repository;

import com.semihcetin.project.humapperbackend.user.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
}

package com.semihcetin.project.humapperbackend.activity;

import org.locationtech.jts.geom.Geometry;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record ActivityResponse(
        Long id,
        Long organizationId,
        String organizationName,
        Geometry geometry,
        List<SectorDto> sectors,
        ActivityStatus status,
        LocalDate startDate,
        LocalDate endDate,
        Integer targetPeople,
        String description,
        OffsetDateTime lastUpdated
) {
    public record SectorDto(
            Long id,
            String code,
            String name
    ) {}

    public static ActivityResponse from(Activity a) {
        return new ActivityResponse(
                a.getId(),
                a.getOrganization().getId(),
                a.getOrganization().getName(),
                a.getGeom(),
                a.getSectors().stream()
                        .map(s -> new SectorDto(s.getId(), s.getCode(), s.getName())).toList(),
                a.getStatus(),
                a.getStartDate(),
                a.getEndDate(),
                a.getTargetPeople(),
                a.getDescription(),
                a.getLastUpdated()
        );
    }
}

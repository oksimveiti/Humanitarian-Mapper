package com.semihcetin.project.humapperbackend.activity;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.locationtech.jts.geom.Geometry;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateActivityRequest(
        @NotNull Geometry geometry,
        @NotEmpty List<Long> sectorIds,
        @NotNull ActivityStatus status,
        LocalDate startDate,
        LocalDate endDate,
        Integer targetPeople,
        Integer reachedPeople,
        BigDecimal budget,
        String currency,
        String description
        ) {
}

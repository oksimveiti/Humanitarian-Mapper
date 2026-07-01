package com.semihcetin.project.humapperbackend.activity;

import com.semihcetin.project.humapperbackend.sector.Sector;
import com.semihcetin.project.humapperbackend.user.Organization;
import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Geometry;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "activity")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Activity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(columnDefinition = "geometry(Geometry,4326)", nullable = false)
    private Geometry geom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ActivityStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", nullable = false, length = 32)
    @Builder.Default
    private ReviewStatus reviewStatus = ReviewStatus.DRAFT;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "target_people")
    private Integer targetPeople;

    @Column(columnDefinition = "text")
    private String description;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "activity_sector",
            joinColumns = @JoinColumn(name = "activity_id"),
            inverseJoinColumns = @JoinColumn(name = "sector_id"))
    @Builder.Default
    private Set<Sector> sectors = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "last_updated", nullable = false)
    private OffsetDateTime lastUpdated;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.lastUpdated = now;
    }

    @PreUpdate
    void onUpdate() {
        this.lastUpdated = OffsetDateTime.now();
    }
}

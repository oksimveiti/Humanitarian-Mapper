package com.semihcetin.project.humapperbackend.settings;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

// Single-row table (id = 1) holding instance-wide settings owned by the coordinator.
@Entity
@Table(name = "instance_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InstanceSettings {

    @Id
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "map_visibility", nullable = false, length = 32)
    @Builder.Default
    private MapVisibility mapVisibility = MapVisibility.ALL;

    // False until the coordinator completes first-time setup.
    @Column(nullable = false)
    @Builder.Default
    private boolean configured = false;

    @Column(name = "public_share_enabled", nullable = false)
    @Builder.Default
    private boolean publicShareEnabled = false;

    @Column(name = "public_share_token", length = 64)
    private String publicShareToken;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        this.updatedAt = OffsetDateTime.now();
    }
}

package com.semihcetin.project.humapperbackend.sector;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sector")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Sector {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = false, length = 32)
    private String code;

    @Column(nullable = false, length = 128)
    private String name;
}

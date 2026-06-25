package com.semihcetin.project.humapperbackend.sector;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sectors")
public class SectorController {

    private final SectorRepository sectors;

    public SectorController(SectorRepository sectors) {
        this.sectors = sectors;
    }

    @GetMapping
    public List<Sector> list() {
        return sectors.findAll();
    }
}

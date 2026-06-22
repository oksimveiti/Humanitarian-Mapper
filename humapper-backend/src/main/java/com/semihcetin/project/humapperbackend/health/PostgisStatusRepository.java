package com.semihcetin.project.humapperbackend.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PostgisStatusRepository {

    private final JdbcTemplate jdbcTemplate;

    public PostgisStatusRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String postgisVersion() {
        return jdbcTemplate.queryForObject("SELECT postgis_version()", String.class);
    }
}

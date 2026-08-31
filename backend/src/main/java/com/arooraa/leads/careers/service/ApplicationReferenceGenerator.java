package com.arooraa.leads.careers.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.time.ZoneOffset;

/**
 * Generates human-readable application references like "JOB-2026-000001" (W3.3B §3) — same
 * atomic-upsert counter pattern as EnquiryNumberGenerator, deliberately its own counter table
 * (job_application_reference_counters) so recruitment and sales reference sequences never
 * collide or share state.
 */
@Component
public class ApplicationReferenceGenerator {

    private static final String UPSERT_AND_RETURN = """
            INSERT INTO job_application_reference_counters (year, last_value)
            VALUES (?, 1)
            ON CONFLICT (year)
            DO UPDATE SET last_value = job_application_reference_counters.last_value + 1
            RETURNING last_value
            """;

    private final JdbcTemplate jdbcTemplate;

    public ApplicationReferenceGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String next() {
        int year = Year.now(ZoneOffset.UTC).getValue();
        Long sequence = jdbcTemplate.queryForObject(UPSERT_AND_RETURN, Long.class, year);
        return "JOB-%d-%06d".formatted(year, sequence);
    }
}

package com.arooraa.leads.project.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.time.ZoneOffset;

/**
 * Generates human-readable references like "ARO-2026-000001".
 *
 * The counter lives in project_enquiry_number_counters (one row per calendar year) and is
 * incremented with a single atomic "INSERT ... ON CONFLICT DO UPDATE ... RETURNING"
 * statement, so concurrent callers never observe or reuse the same value, no in-memory
 * state is involved, and the sequence survives application restarts. Intended to be called
 * from within the same @Transactional boundary as the enquiry insert.
 */
@Component
public class EnquiryNumberGenerator {

    private static final String UPSERT_AND_RETURN = """
            INSERT INTO project_enquiry_number_counters (year, last_value)
            VALUES (?, 1)
            ON CONFLICT (year)
            DO UPDATE SET last_value = project_enquiry_number_counters.last_value + 1
            RETURNING last_value
            """;

    private final JdbcTemplate jdbcTemplate;

    public EnquiryNumberGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String next() {
        int year = Year.now(ZoneOffset.UTC).getValue();
        Long sequence = jdbcTemplate.queryForObject(UPSERT_AND_RETURN, Long.class, year);
        return "ARO-%d-%06d".formatted(year, sequence);
    }
}

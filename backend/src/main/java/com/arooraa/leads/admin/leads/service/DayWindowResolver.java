package com.arooraa.leads.admin.leads.service;

import org.springframework.stereotype.Component;

import java.time.DateTimeException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;

/**
 * Follow-up dates are stored as UTC instants; "due today" / "overdue" only make sense
 * relative to the operator's own calendar day. The frontend passes its resolved IANA
 * timezone (Intl.DateTimeFormat().resolvedOptions().timeZone); an absent or unparseable
 * value falls back to UTC rather than failing the request.
 */
@Component
public class DayWindowResolver {

    public record DayWindow(Instant startOfDay, Instant startOfNextDay) {
    }

    public DayWindow resolveToday(String timezone) {
        ZoneId zone;
        try {
            zone = (timezone == null || timezone.isBlank()) ? ZoneOffset.UTC : ZoneId.of(timezone);
        } catch (DateTimeException invalidZone) {
            zone = ZoneOffset.UTC;
        }
        LocalDate today = LocalDate.now(zone);
        Instant start = today.atStartOfDay(zone).toInstant();
        Instant end = today.plusDays(1).atStartOfDay(zone).toInstant();
        return new DayWindow(start, end);
    }
}

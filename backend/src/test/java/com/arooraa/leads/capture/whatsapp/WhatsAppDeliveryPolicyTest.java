package com.arooraa.leads.capture.whatsapp;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Boundary tests for the supervisor-corrected policy; the model draft it came from is not trusted. */
class WhatsAppDeliveryPolicyTest {

    private static final Instant T = Instant.parse("2026-10-12T00:00:00Z");

    @Test
    void windowIsOpenStrictlyBeforeTwentyFourHoursAndClosedExactlyAtIt() {
        assertTrue(WhatsAppDeliveryPolicy.windowOpen(T, T));
        assertTrue(WhatsAppDeliveryPolicy.windowOpen(T, T.plus(Duration.ofHours(24)).minusNanos(1)));
        assertFalse(WhatsAppDeliveryPolicy.windowOpen(T, T.plus(Duration.ofHours(24))));
        assertFalse(WhatsAppDeliveryPolicy.windowOpen(T, T.plus(Duration.ofDays(7))));
    }

    @Test
    void windowIsClosedForNullsAndForACustomerTimeInTheFuture() {
        assertFalse(WhatsAppDeliveryPolicy.windowOpen(null, T));
        assertFalse(WhatsAppDeliveryPolicy.windowOpen(T, null));
        assertFalse(WhatsAppDeliveryPolicy.windowOpen(T.plusSeconds(1), T), "negative shift never opens a window");
    }

    @Test
    void retryDelayIsExponentialFromFiveSecondsAndNeverExceedsFiveMinutes() {
        assertEquals(Duration.ofSeconds(5), WhatsAppDeliveryPolicy.retryDelay(1, null));
        assertEquals(Duration.ofSeconds(10), WhatsAppDeliveryPolicy.retryDelay(2, null));
        assertEquals(Duration.ofSeconds(20), WhatsAppDeliveryPolicy.retryDelay(3, null));
        assertEquals(Duration.ofMinutes(5), WhatsAppDeliveryPolicy.retryDelay(7, null));
        assertEquals(Duration.ofMinutes(5), WhatsAppDeliveryPolicy.retryDelay(Integer.MAX_VALUE, null));
    }

    @Test
    void retryDelayHandlesZeroAndNegativeAttemptsWithoutShiftOverflow() {
        assertEquals(Duration.ofSeconds(5), WhatsAppDeliveryPolicy.retryDelay(0, null));
        assertEquals(Duration.ofSeconds(5), WhatsAppDeliveryPolicy.retryDelay(-5, null));
        assertEquals(Duration.ofSeconds(5), WhatsAppDeliveryPolicy.retryDelay(Integer.MIN_VALUE, null));
    }

    @Test
    void retryAfterIsHonouredOnlyAboveTheBaseAndIsCapped() {
        assertEquals(Duration.ofSeconds(60), WhatsAppDeliveryPolicy.retryDelay(1, Duration.ofSeconds(60)));
        assertEquals(Duration.ofSeconds(5), WhatsAppDeliveryPolicy.retryDelay(1, Duration.ofSeconds(1)));
        assertEquals(Duration.ofSeconds(5), WhatsAppDeliveryPolicy.retryDelay(1, Duration.ofSeconds(-30)));
        assertEquals(Duration.ofMinutes(5), WhatsAppDeliveryPolicy.retryDelay(1, Duration.ofDays(365)));
    }

    @Test
    void attemptsAreBoundedAtThree() {
        assertFalse(WhatsAppDeliveryPolicy.terminalAttempt(1));
        assertFalse(WhatsAppDeliveryPolicy.terminalAttempt(2));
        assertTrue(WhatsAppDeliveryPolicy.terminalAttempt(3));
        assertTrue(WhatsAppDeliveryPolicy.terminalAttempt(4));
    }

    @Test
    void deliveryRankIsMonotonicAndUnknownIsZero() {
        assertTrue(WhatsAppDeliveryPolicy.deliveryRank("sent") < WhatsAppDeliveryPolicy.deliveryRank("delivered"));
        assertTrue(WhatsAppDeliveryPolicy.deliveryRank("delivered") < WhatsAppDeliveryPolicy.deliveryRank("read"));
        assertEquals(0, WhatsAppDeliveryPolicy.deliveryRank(null));
        assertEquals(0, WhatsAppDeliveryPolicy.deliveryRank("failed"));
        assertEquals(0, WhatsAppDeliveryPolicy.deliveryRank("READ"));
    }

    @Test
    void deliveryStatusNeverMovesBackwards() {
        assertEquals("delivered", WhatsAppInbox.nextDeliveryStatus("delivered", "sent"));
        assertEquals("read", WhatsAppInbox.nextDeliveryStatus("delivered", "read"));
        assertEquals("read", WhatsAppInbox.nextDeliveryStatus("read", "delivered"));
        assertEquals("failed", WhatsAppInbox.nextDeliveryStatus("sent", "failed"));
        assertEquals("delivered", WhatsAppInbox.nextDeliveryStatus("delivered", "failed"));
        assertEquals("failed", WhatsAppInbox.nextDeliveryStatus("failed", "read"));
        assertEquals("sent", WhatsAppInbox.nextDeliveryStatus(null, "sent"));
    }
}

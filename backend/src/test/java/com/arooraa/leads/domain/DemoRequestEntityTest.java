package com.arooraa.leads.domain;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DemoRequestEntityTest {

    @Test
    void constructorGeneratesUuidAndDefaultStatuses() {
        DemoRequest request = new DemoRequest(
                "Priya Sharma", "Spice Route", "+919876543210", null, "Chennai",
                OutletCount.ONE, RestaurantType.CASUAL_DINING, PrimaryChallenge.BILLING_POS,
                null, null, null, null, null, "hashed-ip", "JUnit-Agent", null, null, null, null);

        assertNotNull(request.getId());
        assertEquals(LeadStatus.NEW, request.getStatus());
        assertEquals(NotificationStatus.PENDING, request.getNotificationStatus());
    }

    @Test
    void onlyIpRelatedFieldIsTheHashNeverRawIp() {
        List<String> ipRelatedFields = java.util.Arrays.stream(DemoRequest.class.getDeclaredFields())
                .map(Field::getName)
                .filter(name -> name.toLowerCase().contains("ip"))
                .toList();

        assertEquals(List.of("ipHash"), ipRelatedFields);
    }
}

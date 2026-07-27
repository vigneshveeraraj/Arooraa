package com.arooraa.leads.service;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PhoneNumberNormalizerTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "9876543210",
            "919876543210",
            "+919876543210",
            "+91 98765 43210",
            "98765-43210",
            "91-9876543210",
            "+91-98765-43210"
    })
    void normalizesAcceptedFormatsToE164(String raw) {
        assertTrue(PhoneNumberNormalizer.isValid(raw));
        assertEquals("+919876543210", PhoneNumberNormalizer.normalize(raw));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "12345",
            "12345678901234",
            "5876543210",
            "abcdefghij",
            "+1 9876543210",
            "919876543210123",
            ""
    })
    void rejectsInvalidNumbers(String raw) {
        assertFalse(PhoneNumberNormalizer.isValid(raw));
        assertThrows(IllegalArgumentException.class, () -> PhoneNumberNormalizer.normalize(raw));
    }

    @Test
    void rejectsNull() {
        assertFalse(PhoneNumberNormalizer.isValid(null));
        assertThrows(IllegalArgumentException.class, () -> PhoneNumberNormalizer.normalize(null));
    }
}

package com.arooraa.leads.project.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InternationalPhoneNormalizerTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "+919876543210",
            "+91 98765 43210",
            "+1 415-555-0132",
            "+44 20 7946 0958",
            "9876543210"
    })
    void acceptsAndNormalizesLooseE164Formats(String raw) {
        assertTrue(InternationalPhoneNormalizer.isValid(raw));
        assertTrue(InternationalPhoneNormalizer.normalize(raw).startsWith("+"));
    }

    @Test
    void normalizesToDigitsPrefixedWithPlus() {
        assertEquals("+14155550132", InternationalPhoneNormalizer.normalize("+1 415-555-0132"));
        assertEquals("+919876543210", InternationalPhoneNormalizer.normalize("+919876543210"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "12345",
            "abcdefghij",
            "0123456789",
            "1234567890123456",
            ""
    })
    void rejectsInvalidNumbers(String raw) {
        assertFalse(InternationalPhoneNormalizer.isValid(raw));
        assertThrows(IllegalArgumentException.class, () -> InternationalPhoneNormalizer.normalize(raw));
    }

    @Test
    void rejectsNull() {
        assertFalse(InternationalPhoneNormalizer.isValid(null));
        assertThrows(IllegalArgumentException.class, () -> InternationalPhoneNormalizer.normalize(null));
    }
}

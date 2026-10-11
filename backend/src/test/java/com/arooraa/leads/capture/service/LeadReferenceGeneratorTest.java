package com.arooraa.leads.capture.service;

import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LeadReferenceGeneratorTest {

    @Test
    void referencesAreOpaqueRandomAndFindableInText() {
        LeadCaptureRepository repository = mock(LeadCaptureRepository.class);
        LeadReferenceGenerator generator = new LeadReferenceGenerator(repository);

        Set<String> seen = new HashSet<>();
        for (int i = 0; i < 500; i++) {
            String reference = generator.next();
            assertTrue(reference.matches("LC-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}"), reference);
            assertTrue(LeadReferenceGenerator.IN_TEXT.matcher("Hi, my reference is " + reference.toLowerCase() + ".").find());
            seen.add(reference);
        }
        assertTrue(seen.size() > 495, "references must not repeat or follow a sequence");
    }

    @Test
    void givesUpAfterRepeatedCollisionsRatherThanLoopingForever() {
        LeadCaptureRepository repository = mock(LeadCaptureRepository.class);
        when(repository.existsByLeadReference(anyString())).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> new LeadReferenceGenerator(repository).next());
    }

    @Test
    void doesNotMatchLookAlikeOrWrongLengthReferences() {
        assertEquals(false, LeadReferenceGenerator.IN_TEXT.matcher("LC-0O1IL2").find());
        assertEquals(false, LeadReferenceGenerator.IN_TEXT.matcher("LC-ABCDEFG").find());
    }
}

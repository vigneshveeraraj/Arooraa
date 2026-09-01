package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.config.AuraSafetyProperties;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** The cheapest possible rejection point — before classification, retrieval or any provider call. */
class InputValidatorTest {

    private final InputValidator validator = new InputValidator(new AuraSafetyProperties(4000, false));

    @Test
    void anOrdinaryMessagePassesThroughTrimmed() {
        assertEquals("What is MESA?", validator.validate("  What is MESA?  "));
    }

    @Test
    void emptyAndBlankMessagesAreRejected() {
        assertEquals("EMPTY_MESSAGE", assertThrows(InvalidInputException.class,
                () -> validator.validate("")).getCode());
        assertEquals("EMPTY_MESSAGE", assertThrows(InvalidInputException.class,
                () -> validator.validate("   ")).getCode());
        assertEquals("EMPTY_MESSAGE", assertThrows(InvalidInputException.class,
                () -> validator.validate(null)).getCode());
    }

    @Test
    void anOversizedMessageIsRejectedAndToldTheLimit() {
        String tooLong = "a".repeat(4001);

        InvalidInputException e = assertThrows(InvalidInputException.class, () -> validator.validate(tooLong));

        assertEquals("MESSAGE_TOO_LONG", e.getCode());
        assertTrue(e.getMessage().contains("4000"), "the visitor should be told the actual limit");
    }

    @Test
    void controlCharactersAreCleanedRatherThanRejected() {
        // Almost always a paste artefact, not an attack — quietly cleaning it is friendlier than
        // bouncing the message back at someone who cannot see what is wrong with it.
        String withControlChars = "What is " + (char) 0 + "MESA" + (char) 7 + "?";

        assertEquals("What is MESA?", validator.validate(withControlChars));
    }

    @Test
    void newlinesSurviveBecauseVisitorsWriteInParagraphs() {
        assertEquals("I own a cafe.\nWhat would you suggest?",
                validator.validate("I own a cafe.\nWhat would you suggest?"));
    }

    @Test
    void aMessageOfExactlyTheLimitIsAccepted() {
        String exact = "a".repeat(4000);

        assertEquals(exact, validator.validate(exact));
    }
}

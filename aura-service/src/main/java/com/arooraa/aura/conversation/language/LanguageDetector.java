package com.arooraa.aura.conversation.language;

import com.arooraa.aura.conversation.domain.Language;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

/**
 * Which language/register to answer in. Deterministic and cheap — a visitor should not wait on an
 * extra model round-trip to be answered in their own language, and no language dropdown exists.
 *
 * <p>Tamil script is decided by the characters themselves, which is unambiguous. Tanglish is
 * decided by romanized Tamil function words — the connective tissue of a Tanglish sentence
 * ("enna", "epdi", "iruku", "panna", "mudiyuma") rather than its nouns, which are usually English
 * anyway. That is why "MESA restaurant-ku epdi help pannum?" is Tanglish while "Can MESA help
 * restaurants?" is English despite sharing most of their content words.
 */
@Component
public class LanguageDetector {

    /**
     * Romanized Tamil markers. Kept to grammatical words rather than topical ones so an English
     * sentence about, say, a "panna" is not misread — and deliberately conservative: mislabelling
     * English as Tanglish is more jarring to a visitor than the reverse.
     */
    private static final List<String> TANGLISH_MARKERS = List.of(
            "enna", "epdi", "epadi", "eppadi", "iruku", "irukku", "irukka", "irukkum",
            "panna", "pannunga", "pannum", "pannuveengala", "pannanum", "mudiyuma", "mudiyum",
            "venum", "vendum", "enaku", "enakku", "unaku", "namma", "naan", "neenga", "ungaluku",
            "seri", "illa", "illai", "romba", "konjam", "solunga", "sollunga", "theriyuma",
            "kudukka", "vera", "onnu", "oru", "ku", "la", "ah");

    public Language detect(String message) {
        if (message == null || message.isBlank()) {
            return Language.ENGLISH;
        }
        if (containsTamilScript(message)) {
            return Language.TAMIL;
        }
        String normalized = " " + message.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{Nd}]+", " ").trim() + " ";
        for (String marker : TANGLISH_MARKERS) {
            if (normalized.contains(" " + marker + " ")) {
                return Language.TANGLISH;
            }
        }
        return Language.ENGLISH;
    }

    /**
     * A single Tamil character is enough. Mixed script ("Existing software-ஐ modernize பண்ண
     * முடியுமா?") is normal Tamil writing today, not a mixed-language edge case, and should be
     * answered in Tamil.
     */
    private boolean containsTamilScript(String message) {
        return message.codePoints().anyMatch(cp -> Character.UnicodeBlock.of(cp) == Character.UnicodeBlock.TAMIL);
    }
}

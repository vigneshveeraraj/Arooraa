package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.Language;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Pipeline stage 12. The last thing between a generated answer and a visitor.
 *
 * <p>Two tiers, because two different things can go wrong. A <b>security</b> failure — secret-like
 * material, instruction leakage, an AROORAA claim nothing supports — discards the answer entirely;
 * there is no safe way to partially publish a leak. A <b>quality</b> failure — robotic phrasing,
 * excessive length — is repaired in place, because throwing away a good answer over its opening
 * clause would serve the visitor worse than fixing it.
 *
 * <p>The leakage check is structural rather than a phrase blacklist: it looks for word sequences
 * from the actual system instruction appearing verbatim in the answer. That catches a leak of
 * wording nobody predicted, which is exactly what a blacklist cannot do. The unsupported-claim
 * check is similarly narrow by construction — it only runs when this turn was forbidden from
 * making AROORAA claims at all, so a genuinely grounded answer that names a technology our public
 * material discloses (Mindra's stack, say) is never touched by it.
 */
@Component
public class OutputGuardrail {

    private static final Logger log = LoggerFactory.getLogger(OutputGuardrail.class);

    /** Length of the verbatim word run that counts as instruction leakage rather than coincidence. */
    private static final int LEAK_SHINGLE_WORDS = 8;

    private static final List<Pattern> SECRET_PATTERNS = List.of(
            Pattern.compile("\\bsk-[A-Za-z0-9_-]{12,}"),
            Pattern.compile("\\bAKIA[0-9A-Z]{12,}"),
            Pattern.compile("\\bghp_[A-Za-z0-9]{20,}"),
            Pattern.compile("(?i)\\bbearer\\s+[A-Za-z0-9._~+/-]{20,}"),
            Pattern.compile("(?i)\\b(password|passwd|api[_ -]?key|secret|access[_ -]?token)\\s*[:=]\\s*\\S{4,}"),
            Pattern.compile("(?i)\\b(jdbc:|postgres(ql)?://|mongodb(\\+srv)?://|redis://)"),
            Pattern.compile("-----BEGIN [A-Z ]*PRIVATE KEY-----"),
            Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"));

    /** Phrasing that makes Aura sound like a system reporting its status. Repaired, not blocked. */
    private static final List<String> ROBOTIC_PHRASES = List.of(
            "as an ai language model", "as an ai model", "as a large language model",
            "according to the provided context", "according to the context provided",
            "based on the provided context", "based on the context provided",
            "based on the retrieved documents", "based on the retrieved information",
            "based on the documents provided", "your query has been processed",
            "i am an ai language model");

    private static final List<String> ORGANISATION_SUBJECTS = List.of(
            "arooraa", "aura", "mesa", "mindra", "smart mirror", "smart home");

    /** Named technologies. Only consulted for turns that may make no AROORAA claim at all. */
    private static final List<String> TECHNOLOGY_NAMES = List.of(
            "postgres", "postgresql", "mysql", "mariadb", "mongodb", "mongo", "redis", "sqlite",
            "oracle", "dynamodb", "cassandra", "elasticsearch", "kafka", "rabbitmq",
            "spring boot", "spring", "django", "flask", "laravel", "rails", "express",
            "react", "react native", "angular", "vue", "next js", "nextjs", "node js", "nodejs",
            "java", "python", "golang", "rust", "php", "ruby", "kotlin", "typescript",
            "aws", "azure", "gcp", "kubernetes", "docker", "nginx", "hostinger", "digitalocean",
            "openai", "anthropic", "gpt", "claude", "gemini", "llama", "pgvector", "pinecone");

    private static final List<String> ASSERTION_VERBS = List.of(
            "uses", "use", "using", "used", "runs on", "run on", "built on", "built with",
            "built using", "powered by", "powers", "is built", "are built", "written in",
            "based on", "relies on", "we use", "our stack");

    private final ChatProperties properties;

    public OutputGuardrail(ChatProperties properties) {
        this.properties = properties;
    }

    /**
     * @param policyText the instruction text minus any approved material — see
     *        {@link ComposedPrompt#policyText()} for why the evidence must be excluded here
     */
    public GuardrailResult check(String answer, String policyText, ConversationMode mode, Language language,
                                  GenerationDecision decision) {
        if (answer == null || answer.isBlank()) {
            return GuardrailResult.blocked(SafeResponses.guardrailStop(language, mode), GuardrailResult.PROMPT_LEAKAGE);
        }

        for (Pattern pattern : SECRET_PATTERNS) {
            if (pattern.matcher(answer).find()) {
                return block(GuardrailResult.SECRET_MATERIAL, mode, language);
            }
        }
        if (leaksInstructions(answer, policyText)) {
            return block(GuardrailResult.PROMPT_LEAKAGE, mode, language);
        }
        if (decision.forbidArooraaFactualClaims() && assertsOurImplementation(answer)) {
            return block(GuardrailResult.UNSUPPORTED_CLAIM, mode, language);
        }

        String repaired = answer;
        String violation = null;
        // A1.5. The referral permission was decided before generation; this is the same decision
        // checked on the way out, so the two cannot drift apart. Repaired rather than blocked: the
        // rest of the answer is usually a good answer, and the sentence that named somebody else
        // is the only part that had to go.
        if (!decision.externalReferencesAllowed() && ExternalRecommendation.namesACompetingDestination(repaired)) {
            String withoutReferral = ExternalRecommendation.strip(repaired);
            if (withoutReferral.isBlank()) {
                return block(GuardrailResult.UNSOLICITED_EXTERNAL_REFERRAL, mode, language);
            }
            repaired = withoutReferral;
            violation = GuardrailResult.UNSOLICITED_EXTERNAL_REFERRAL;
        }
        String withoutRoboticPhrasing = stripRoboticPhrasing(repaired);
        if (!withoutRoboticPhrasing.equals(repaired)) {
            repaired = withoutRoboticPhrasing;
            violation = GuardrailResult.ROBOTIC_PHRASING;
        }
        if (repaired.length() > properties.maxResponseChars()) {
            repaired = trimToSentence(repaired, properties.maxResponseChars());
            violation = GuardrailResult.EXCESSIVE_LENGTH;
        }
        if (violation != null) {
            log.info("Output guardrail repaired a response ({}).", violation);
            return GuardrailResult.repaired(repaired, violation);
        }
        return GuardrailResult.clean(repaired);
    }

    private GuardrailResult block(String violationCode, ConversationMode mode, Language language) {
        // Never logs the offending text itself — that is precisely the material that must not be
        // written anywhere. The code says which check fired; the mode says in what context.
        log.warn("Output guardrail blocked a response ({}, mode={}).", violationCode, mode);
        return GuardrailResult.blocked(SafeResponses.guardrailStop(language, mode), violationCode);
    }

    /** True when a run of {@value #LEAK_SHINGLE_WORDS} consecutive words from the instruction appears in the answer. */
    private boolean leaksInstructions(String answer, String policyText) {
        if (policyText == null || policyText.isBlank()) {
            return false;
        }
        Set<String> instructionShingles = shingles(policyText);
        for (String shingle : shingles(answer)) {
            if (instructionShingles.contains(shingle)) {
                return true;
            }
        }
        return false;
    }

    private Set<String> shingles(String text) {
        String[] words = TextSignals.normalize(text).trim().split("\\s+");
        Set<String> shingles = new HashSet<>();
        for (int i = 0; i + LEAK_SHINGLE_WORDS <= words.length; i++) {
            shingles.add(String.join(" ", java.util.Arrays.copyOfRange(words, i, i + LEAK_SHINGLE_WORDS)));
        }
        return shingles;
    }

    /**
     * True when the answer states that something of ours is built on a named technology. Requires
     * all three of an AROORAA subject, a technology name and an assertion verb, so "you could run
     * this on Postgres" survives while "AROORAA runs on Postgres" does not.
     */
    private boolean assertsOurImplementation(String answer) {
        String text = TextSignals.normalize(answer);
        return TextSignals.containsAny(text, ORGANISATION_SUBJECTS)
                && TextSignals.containsAny(text, TECHNOLOGY_NAMES)
                && TextSignals.containsAny(text, ASSERTION_VERBS);
    }

    private String stripRoboticPhrasing(String answer) {
        String result = answer;
        for (String phrase : ROBOTIC_PHRASES) {
            int index = result.toLowerCase(Locale.ROOT).indexOf(phrase);
            while (index >= 0) {
                result = result.substring(0, index) + result.substring(index + phrase.length());
                index = result.toLowerCase(Locale.ROOT).indexOf(phrase);
            }
        }
        // Tidy up what removal left behind: a dangling ", " or ": " at the start, doubled spaces,
        // and a now-lowercase opening letter.
        result = result.replaceAll("^[\\s,:;.-]+", "").replaceAll("[ \\t]{2,}", " ").strip();
        if (!result.isEmpty() && Character.isLowerCase(result.charAt(0))) {
            result = Character.toUpperCase(result.charAt(0)) + result.substring(1);
        }
        return result;
    }

    /** Trims at the last sentence end inside the limit, so a truncated answer still reads as finished. */
    private String trimToSentence(String answer, int limit) {
        String truncated = answer.substring(0, limit);
        int lastStop = Math.max(truncated.lastIndexOf('.'), Math.max(truncated.lastIndexOf('!'), truncated.lastIndexOf('?')));
        if (lastStop > limit / 2) {
            return truncated.substring(0, lastStop + 1).strip();
        }
        return truncated.strip();
    }
}

package com.arooraa.aura.conversation.pipeline;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A1.5. Aura answered a request for coding help by recommending Codecademy, freeCodeCamp and
 * Coursera — sending a possible customer to three other companies, helpfully and with no rule
 * anywhere telling it not to.
 */
class ExternalRecommendationTest {

    @Nested
    class Naming_somebody_who_would_take_the_work {

        @ParameterizedTest
        @ValueSource(strings = {
            "There are plenty of resources on Codecademy and freeCodeCamp.",
            "You could try W3Schools for the basics.",
            "Platforms like Udemy or Coursera offer structured courses.",
            "You might find a developer on Upwork or Fiverr.",
            "Honestly, Shopify would handle that for you.",
            "Wix or Squarespace could get you started quickly."
        })
        void is_recognised(String answer) {
            assertThat(ExternalRecommendation.namesACompetingDestination(answer))
                    .describedAs(answer).isTrue();
        }

        @Test
        void is_removed_a_whole_sentence_at_a_time() {
            // Deleting only the name leaves "structured courses on , or " — mangled text that
            // reads like a bug. The sentence carrying the referral is the unit of meaning.
            String answer = "Start with the basics: variables, loops and functions. "
                    + "There are plenty of tutorials on Codecademy and freeCodeCamp. "
                    + "What are you hoping to build?";

            String repaired = ExternalRecommendation.strip(answer);

            assertThat(repaired).doesNotContain("Codecademy").doesNotContain("freeCodeCamp");
            assertThat(repaired).contains("variables, loops and functions");
            assertThat(repaired).contains("What are you hoping to build?");
        }
    }

    @Nested
    class Ordinary_technical_conversation {

        /**
         * The rule is about destinations, not vocabulary. An assistant that cannot say "Postgres"
         * or "React" is useless, and none of this is a referral to anybody.
         */
        @ParameterizedTest
        @ValueSource(strings = {
            "You could store that in Postgres and index it with a vector extension.",
            "React and Vue would both work; the difference is mostly team familiarity.",
            "Kubernetes is probably more than you need at this stage.",
            "The OWASP Top Ten is a good frame for thinking about that.",
            "That is what the OAuth 2.0 spec calls a client credentials grant.",
            "Python is a reasonable first language for this."
        })
        void is_never_treated_as_a_referral(String answer) {
            assertThat(ExternalRecommendation.namesACompetingDestination(answer))
                    .describedAs(answer).isFalse();
            assertThat(ExternalRecommendation.strip(answer)).isEqualTo(answer.trim());
        }
    }

    @Nested
    class When_the_visitor_actually_asked {

        @ParameterizedTest
        @ValueSource(strings = {
            "Can you recommend a course for learning Java?",
            "Any good books on system design?",
            "Where can I learn python properly?",
            "what are the best resources for react?",
            "suggest some free courses"
        })
        void the_permission_is_granted(String asked) {
            assertThat(ExternalRecommendation.requestedBy(asked)).describedAs(asked).isTrue();
        }

        /** Describing a problem is not a request for a reading list. */
        @ParameterizedTest
        @ValueSource(strings = {
            "Can you help me to guide how to code?",
            "I need an ecommerce website for my business.",
            "our invoicing is manual and takes too long",
            "What is RAG?"
        })
        void merely_needing_help_does_not_grant_it(String asked) {
            assertThat(ExternalRecommendation.requestedBy(asked)).describedAs(asked).isFalse();
        }
    }
}

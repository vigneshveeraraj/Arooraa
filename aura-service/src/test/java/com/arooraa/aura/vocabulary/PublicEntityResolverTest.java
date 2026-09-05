package com.arooraa.aura.vocabulary;

import org.junit.jupiter.api.DisplayNameGeneration;
import org.junit.jupiter.api.DisplayNameGenerator;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * What the resolver understands, and — at least as importantly — what it refuses to.
 *
 * <p>The owner's finding was that a visitor says MESA clearly and speech-to-text returns Meesa,
 * after which Aura answers a question about its own product as though it had never heard of it. The
 * fix has an obvious failure mode of its own, so roughly half of these tests are about the cases
 * that must stay untouched.
 */
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
class PublicEntityResolverTest {

    private final PublicEntityResolver resolver = new PublicEntityResolver();

    @Nested
    class The_product_the_owner_reported {

        @ParameterizedTest
        @ValueSource(strings = {
                "Tell me about MESA",
                "Tell me about Meesa",
                "Tell me about Meso",
                "What does Messa do?",
                "How can Meeza help a restaurant?",
                "tell me about meesa",
                "TELL ME ABOUT MEESA",
        })
        void reaches_the_pipeline_as_a_question_about_MESA(String spoken) {
            EntityResolution resolution = resolver.resolve(spoken);

            assertThat(resolution.canonicalNames()).containsExactly("MESA");
            assertThat(resolution.canonicalText()).contains("MESA");
            // The visitor's own words are still there to be stored and shown.
            assertThat(resolution.rawText()).isEqualTo(spoken);
        }

        @Test
        void keeps_everything_around_the_name_exactly_as_it_was() {
            EntityResolution resolution = resolver.resolve("How can Meeza help a restaurant?");

            assertThat(resolution.canonicalText()).isEqualTo("How can MESA help a restaurant?");
        }

        @Test
        void needs_no_correction_when_it_was_already_spelled_our_way() {
            EntityResolution resolution = resolver.resolve("Tell me about MESA");

            assertThat(resolution.canonicalText()).isEqualTo("Tell me about MESA");
            assertThat(resolution.changed()).isTrue();
        }
    }

    @Nested
    class The_rest_of_the_approved_vocabulary {

        @Test
        void recognises_Mindra() {
            assertThat(resolver.resolve("What does Mindraa do?").canonicalText())
                    .isEqualTo("What does Mindra do?");
            assertThat(resolver.resolve("Tell me about Meendra").canonicalText())
                    .isEqualTo("Tell me about Mindra");
        }

        @Test
        void recognises_Smart_Mirror_as_one_thing_rather_than_two_words() {
            assertThat(resolver.resolve("Tell me about the smart mirrow").canonicalText())
                    .isEqualTo("Tell me about the Smart Mirror");
            // "miror" is a dropped letter rather than a registered spelling: the near envelope.
            assertThat(resolver.resolve("What does the smart miror do?").canonicalText())
                    .isEqualTo("What does the Smart Mirror do?");
        }

        @Test
        void recognises_Arooraa_Smart_Home_before_it_recognises_the_company() {
            // Longest first, or this would have been AROORAA followed by two ordinary words.
            EntityResolution resolution = resolver.resolve("Tell me about Aroora Smart Home");

            assertThat(resolution.canonicalNames()).containsExactly("Arooraa Smart Home");
            assertThat(resolution.canonicalText()).isEqualTo("Tell me about Arooraa Smart Home");
        }

        @Test
        void recognises_the_company() {
            assertThat(resolver.resolve("What does Aroora do?").canonicalText())
                    .isEqualTo("What does AROORAA do?");
            assertThat(resolver.resolve("Tell me about Aurora").canonicalNames())
                    .containsExactly("AROORAA");
        }

        @Test
        void handles_two_of_them_in_one_sentence() {
            EntityResolution resolution = resolver.resolve("Is Meesa or Mindraa better for a hotel?");

            assertThat(resolution.canonicalText()).isEqualTo("Is MESA or Mindra better for a hotel?");
            assertThat(resolution.canonicalNames()).containsExactly("MESA", "Mindra");
        }
    }

    /**
     * A5.2.4. The owner asked "mesa uses?" on AROORAA's own website and Aura answered about the
     * open-source graphics library.
     *
     * <p>The vocabulary could ask what something <em>is</em> and how it <em>works</em>, but had no
     * way to ask what it is <em>for</em> — so an everyday spelling with no support scored 0.55
     * against a 0.75 threshold and stopped. Visitors do not write grammatical sentences, and
     * "mesa uses?" is the shape a real person types.
     */
    @Nested
    class Asking_what_something_is_for {

        @ParameterizedTest
        @ValueSource(strings = {
            "mesa uses?", "MESA uses?", "mesa use?", "what is mesa used for?", "what does mesa do?",
            "mesa useful?", "mesa useful for restaurant?", "how does mesa help restaurants?",
            "mesa usage?", "what is the purpose of mesa?", "mesa benefits?"
        })
        void reach_the_product_however_the_visitor_phrases_it(String asked) {
            assertThat(resolver.resolve(asked).canonicalNames())
                    .describedAs(asked)
                    .containsExactly("MESA");
        }

        @ParameterizedTest
        @ValueSource(strings = {"meesa uses?", "meso uses?"})
        void reach_it_from_a_misheard_spelling_too(String asked) {
            assertThat(resolver.resolve(asked).canonicalNames())
                    .describedAs(asked)
                    .containsExactly("MESA");
        }

        /**
         * No phrase table for any of this. Every one of these carries its intent in the English
         * word the visitor code-switched into — "use", "useful" — except the last, which is why
         * "pannum" is the single Tamil verb in the vocabulary.
         */
        @ParameterizedTest
        @ValueSource(strings = {
            "MESA enna use?", "mesa ethuku use?", "mesa restaurant-ku epdi useful?",
            "mesa enna pannum?", "meesa enna pannum?"
        })
        void reach_it_in_tamil_and_tanglish(String asked) {
            assertThat(resolver.resolve(asked).canonicalNames())
                    .describedAs(asked)
                    .containsExactly("MESA");
        }

        @Test
        void reach_the_rest_of_the_approved_vocabulary_the_same_way() {
            assertThat(resolver.resolve("mindra uses?").canonicalNames()).containsExactly("Mindra");
            assertThat(resolver.resolve("smart mirror use?").canonicalNames()).containsExactly("Smart Mirror");
            assertThat(resolver.resolve("Arooraa Smart Home useful for?").canonicalNames())
                    .containsExactly("Arooraa Smart Home");
            assertThat(resolver.resolve("what arooraa does?").canonicalNames()).containsExactly("AROORAA");
        }

        @Test
        void still_recognise_the_subject_of_a_confidentiality_probe() {
            // Recognition makes the boundary stricter, never weaker: this now reads as the probe it
            // is. What happens next is the confidentiality classifier's decision, not this one's.
            assertThat(resolver.resolve("What database does mesa use internally?").canonicalNames())
                    .containsExactly("MESA");
        }
    }

    /**
     * A5.2.4, the other half: an everyday spelling has an everyday meaning, and a clause can look
     * like a product question and be about something else entirely.
     *
     * <p>"Tell me about mesa landforms" resolved to MESA before this milestone — the intent phrase
     * supplied the support and nothing was reading what the sentence was plainly about.
     */
    @Nested
    class Words_whose_ordinary_meaning_is_named_outright {

        @ParameterizedTest
        @ValueSource(strings = {
            "Tell me about mesa landforms", "what is a mesa landform used for?",
            "tell me about the mesa plateau", "how does a mesa butte form?",
            "what is mesa arizona used for?", "tell me about the aurora borealis"
        })
        void are_left_alone_however_product_shaped_the_rest_of_the_clause_looks(String asked) {
            assertThat(resolver.resolve(asked).changed()).describedAs(asked).isFalse();
        }

        @Test
        void does_not_veto_a_spelling_that_could_only_be_ours() {
            // "meesa" is ours whatever surrounds it — the veto is for words that are already
            // ordinary words, not for spellings nobody types by accident.
            assertThat(resolver.resolve("Tell me about meesa landforms").canonicalNames())
                    .containsExactly("MESA");
        }

        @Test
        void does_not_veto_our_own_domain_vocabulary() {
            // MESA is restaurant software, so tables, dining and restaurants are our words too —
            // the veto names only meanings that could never be ours.
            assertThat(resolver.resolve("is mesa useful for table reservations?").canonicalNames())
                    .containsExactly("MESA");
            assertThat(resolver.resolve("mesa useful for a dining room concept?").canonicalNames())
                    .containsExactly("MESA");
        }
    }

    @Nested
    class Words_that_are_also_ordinary_words {

        @Test
        void are_left_alone_when_the_sentence_is_not_about_a_product() {
            // The owner's own counterexample, and the reason certainty is graded rather than binary.
            EntityResolution resolution = resolver.resolve("I want a mesa in my dining room");

            assertThat(resolution.changed()).isFalse();
            assertThat(resolution.canonicalText()).isEqualTo("I want a mesa in my dining room");
        }

        @Test
        void are_left_alone_across_a_clause_boundary_that_is_about_a_product() {
            // Support has to be near. The second half is unmistakably about us; the first half is
            // unmistakably about furniture, and a whole-message scan would let one vouch for the other.
            EntityResolution resolution =
                    resolver.resolve("I want a mesa in my dining room, but tell me about your products too");

            assertThat(resolution.changed()).isFalse();
        }

        @Test
        void are_left_alone_when_the_everyday_word_is_a_natural_phenomenon() {
            assertThat(resolver.resolve("The aurora was beautiful last night").changed()).isFalse();
        }

        @Test
        void are_recognised_once_the_sentence_asks_about_a_product() {
            assertThat(resolver.resolve("What is mesa?").canonicalNames()).containsExactly("MESA");
            assertThat(resolver.resolve("Tell me about misa").canonicalNames()).containsExactly("MESA");
        }

        @Test
        void are_recognised_on_that_entitys_own_page() {
            // Page context is context, never authorization — see PageContextRegistry.
            assertThat(resolver.resolve("mesa", "/products/mesa").canonicalNames()).containsExactly("MESA");
            assertThat(resolver.resolve("mesa", "/careers").changed()).isFalse();
            assertThat(resolver.resolve("mesa", "/not/a/real/page").changed()).isFalse();
        }

        @Test
        void are_recognised_when_the_same_message_already_named_that_entity_clearly() {
            EntityResolution resolution = resolver.resolve("Meesa sounds useful. Does mesa handle takeaway?");

            assertThat(resolution.canonicalNames()).containsExactly("MESA");
            assertThat(resolution.canonicalText()).isEqualTo("MESA sounds useful. Does MESA handle takeaway?");
        }

        @Test
        void are_not_recognised_because_a_different_entity_was_named_clearly() {
            // Naming Mindra says nothing about whether "mesa" meant a table.
            EntityResolution resolution = resolver.resolve("Mindraa looks good. I want a mesa in my kitchen");

            assertThat(resolution.canonicalNames()).containsExactly("Mindra");
        }
    }

    @Nested
    class Everything_that_is_not_ours {

        @ParameterizedTest
        @ValueSource(strings = {
                "Can you modernise my existing application?",
                "I run a small cafe and everything is on paper",
                "What services does the team offer?",
                "எனக்கு ஒரு புதிய செயலி வேண்டும்",
                "naan oru app develop panna venum",
                "Tell me about the mess in my kitchen",
                "Tell me about miso soup",
                "That was a messy release",
        })
        void is_returned_exactly_as_it_arrived(String message) {
            EntityResolution resolution = resolver.resolve(message);

            assertThat(resolution.changed()).isFalse();
            assertThat(resolution.canonicalText()).isEqualTo(message);
        }

        @Test
        void survives_text_with_nothing_in_it() {
            assertThat(resolver.resolve(null).canonicalText()).isEmpty();
            assertThat(resolver.resolve("   ").changed()).isFalse();
            assertThat(resolver.resolve("!!! ???").changed()).isFalse();
        }
    }

    @Nested
    class The_confidence_threshold {

        @Test
        void keeps_a_near_miss_of_an_everyday_word_below_it_whatever_the_context() {
            // "aurera" is one vowel from "aurora", which is itself only recognised with support.
            // A fuzzy match to a word that is already an ordinary word never resolves — that is the
            // one cell of the table with no route to a rewrite.
            assertThat(resolver.resolve("Tell me about aurera").changed()).isFalse();
        }

        @Test
        void is_never_reported_to_anybody() {
            // The score exists so one number governs one decision. It is on the mention for
            // diagnostics and reasoning, and no caller renders it — see EntityResolution.Mention.
            EntityResolution resolution = resolver.resolve("Tell me about Meesa");

            assertThat(resolution.mentions()).singleElement().satisfies(mention -> {
                assertThat(mention.confidence()).isGreaterThanOrEqualTo(0.75);
                assertThat(mention.matchedText()).isEqualTo("Meesa");
            });
            assertThat(resolution.canonicalText()).doesNotContain("0.");
        }
    }
}

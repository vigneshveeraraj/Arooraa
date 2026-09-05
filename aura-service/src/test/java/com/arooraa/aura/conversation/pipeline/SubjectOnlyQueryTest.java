package com.arooraa.aura.conversation.pipeline;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A5.2.4. The line this class draws is the one thing keeping a query rewrite from becoming a way
 * to answer questions the corpus cannot answer, so both sides of it are pinned here.
 */
class SubjectOnlyQueryTest {

    private static final List<String> MESA = List.of("MESA");

    @Nested
    class A_question_that_is_only_its_subject {

        @ParameterizedTest
        @ValueSource(strings = {
            "MESA uses?", "MESA use?", "what is MESA used for?", "what does MESA do?",
            "MESA useful?", "MESA usage?", "what is the purpose of MESA?", "MESA benefits?",
            "MESA enna use?", "MESA ethuku use?", "MESA enna pannum?", "tell me about MESA"
        })
        void is_searched_for_as_its_subject(String asked) {
            assertThat(SubjectOnlyQuery.contextualize(asked, MESA))
                    .describedAs(asked)
                    .isEqualTo("Tell me about MESA");
        }

        @Test
        void names_every_subject_it_recognised() {
            assertThat(SubjectOnlyQuery.contextualize("what are MESA and Mindra used for?",
                    List.of("MESA", "Mindra")))
                    .isEqualTo("Tell me about MESA and Mindra");
        }

        @Test
        void handles_a_subject_whose_name_is_more_than_one_word() {
            assertThat(SubjectOnlyQuery.contextualize("Smart Mirror uses?", List.of("Smart Mirror")))
                    .isEqualTo("Tell me about Smart Mirror");
        }
    }

    @Nested
    class A_question_that_asks_something_of_its_own {

        /**
         * The important half. Nothing in the approved corpus gives a customer count, and rewriting
         * this to "Tell me about MESA" would have retrieved a general product description and let
         * it stand as the answer — a fabricated answer assembled entirely out of true documents.
         */
        @Test
        void is_left_exactly_as_the_visitor_wrote_it() {
            String asked = "How many paying MESA customers do you have?";
            assertThat(SubjectOnlyQuery.contextualize(asked, MESA)).isEqualTo(asked);
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "MESA pricing?", "what does MESA cost?", "does MESA integrate with Zomato?",
            "how does MESA help restaurants?", "MESA useful for restaurant?",
            "What database does MESA use internally?", "who are MESA's customers?"
        })
        void succeeds_or_comes_back_empty_on_its_own_merits(String asked) {
            assertThat(SubjectOnlyQuery.contextualize(asked, MESA)).describedAs(asked).isEqualTo(asked);
        }

        @Test
        void an_unrecognised_word_counts_as_content_rather_than_as_filler() {
            // The list of empty words is deliberately short, and being wrong about a word should
            // leave the visitor's question alone rather than replace it.
            String asked = "MESA supersedes?";
            assertThat(SubjectOnlyQuery.contextualize(asked, MESA)).isEqualTo(asked);
        }
    }

    @Nested
    class With_no_recognised_subject {

        @Test
        void nothing_is_rewritten() {
            assertThat(SubjectOnlyQuery.contextualize("what is this used for?", List.of()))
                    .isEqualTo("what is this used for?");
            assertThat(SubjectOnlyQuery.contextualize("uses?", null)).isEqualTo("uses?");
        }
    }
}

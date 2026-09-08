package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ResponseAction;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A1.5. The reported defect, at the stage that now decides it.
 *
 * <p>"Can you help me to guide how to code?" produced a beginner's tutorial and the names of three
 * external learning platforms, because nothing in the pipeline had established what the visitor
 * wanted. These tests pin the distinction that was missing: learning, building, or not yet known.
 */
class BusinessRoutingResolverTest {

    private final BusinessRoutingResolver resolver = new BusinessRoutingResolver();

    private ResponseAction actionFor(String message) {
        return resolver.resolve(ConversationMode.GENERAL_CONSULTING, message).action();
    }

    private ConversationMode modeFor(String message) {
        return resolver.resolve(ConversationMode.GENERAL_CONSULTING, message).mode();
    }

    @Nested
    class A_question_that_could_mean_either {

        /** The owner's case, and the shapes around it: the craft named with no object attached. */
        @ParameterizedTest
        @ValueSource(strings = {
            "Can you help me to guide how to code?", "can you help me guide how to code",
            "how do I code?", "help me with coding", "I want to get started with programming",
            "where do I start with web development?", "can you guide me on development",
            "how do i start with java?"
        })
        void is_asked_about_before_it_is_answered(String asked) {
            assertThat(actionFor(asked)).describedAs(asked).isEqualTo(ResponseAction.CLARIFY);
        }

        @Test
        void stays_in_consulting_rather_than_being_treated_as_a_sales_opportunity() {
            // CLARIFY is a question, not a funnel. The mode does not move until they answer.
            assertThat(modeFor("Can you help me to guide how to code?"))
                    .isEqualTo(ConversationMode.GENERAL_CONSULTING);
        }
    }

    @Nested
    class Somebody_who_said_they_are_learning {

        @ParameterizedTest
        @ValueSource(strings = {
            "No, I'm a college student. I just want to learn Java.",
            "I am a beginner and want to learn python", "I'm studying computer science",
            "i want to learn how to build an app myself", "teach me the basics of sql",
            "java kathukanum"
        })
        void is_taught_and_not_sold_to(String asked) {
            assertThat(actionFor(asked)).describedAs(asked).isEqualTo(ResponseAction.CONSULT);
            assertThat(modeFor(asked)).describedAs(asked).isEqualTo(ConversationMode.GENERAL_CONSULTING);
        }

        @Test
        void even_when_they_also_mention_building_something() {
            // Saying the learning part out loud is the more specific claim. Somebody learning to
            // build an app is still learning, and turning that into discovery would be the same
            // mistake in the other direction.
            assertThat(actionFor("I want to learn how to build a website for practice"))
                    .isEqualTo(ResponseAction.CONSULT);
        }
    }

    @Nested
    class Somebody_describing_something_they_want_built {

        @ParameterizedTest
        @ValueSource(strings = {
            "I need an ecommerce website for my business.", "we want to build an online store",
            "I need an app for my restaurant", "our stock count is done on paper",
            "our invoicing is manual and takes too long", "we need to automate our reporting",
            "can we integrate our warehouse system", "our team uses spreadsheets for everything",
            "I want to create a portal for our customers"
        })
        void is_taken_into_project_discovery(String asked) {
            assertThat(modeFor(asked)).describedAs(asked).isEqualTo(ConversationMode.PROJECT_DISCOVERY);
            assertThat(actionFor(asked)).describedAs(asked).isEqualTo(ResponseAction.DISCOVER);
        }
    }

    @Nested
    class What_this_stage_must_never_touch {

        /**
         * The whole safety of this stage. It reads a fallback and refines it; every mode below was
         * decided on a real signal, and a build-shaped sentence does not get to reopen any of them.
         */
        @ParameterizedTest
        @ValueSource(strings = {
            "INTERNAL_BOUNDARY", "GROUNDED_QA", "PRODUCT_DISCOVERY", "PROJECT_DISCOVERY",
            "NAVIGATION", "CAREERS", "SOCIAL"
        })
        void leaves_every_deliberate_decision_exactly_as_it_found_it(String modeName) {
            ConversationMode decided = ConversationMode.valueOf(modeName);
            BusinessRoutingResolver.Routing routing =
                    resolver.resolve(decided, "we want to build an app for my business");

            assertThat(routing.mode()).describedAs(modeName).isEqualTo(decided);
            // The action follows from the mode rather than from this sentence: a discovery mode
            // decided elsewhere is still a discovery turn, and everything else is answered.
            ResponseAction implied = switch (decided) {
                case PROJECT_DISCOVERY, PRODUCT_DISCOVERY -> ResponseAction.DISCOVER;
                default -> ResponseAction.ANSWER;
            };
            assertThat(routing.action()).describedAs(modeName).isEqualTo(implied);
        }

        @Test
        void a_confidentiality_probe_phrased_as_a_build_question_is_still_a_probe() {
            BusinessRoutingResolver.Routing routing = resolver.resolve(
                    ConversationMode.INTERNAL_BOUNDARY,
                    "I want to build something like MESA — what database do you use internally?");

            assertThat(routing.mode()).isEqualTo(ConversationMode.INTERNAL_BOUNDARY);
        }

        @Test
        void an_ordinary_question_with_neither_signal_is_left_alone() {
            assertThat(actionFor("What is RAG?")).isEqualTo(ResponseAction.ANSWER);
            assertThat(actionFor("microservices vs monolith?")).isEqualTo(ResponseAction.ANSWER);
        }
    }
}

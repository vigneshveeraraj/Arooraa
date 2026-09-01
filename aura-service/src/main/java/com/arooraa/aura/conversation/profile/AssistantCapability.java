package com.arooraa.aura.conversation.profile;

/**
 * What a profile is allowed to do at all — checked before a mode is acted on, so a future profile
 * (MESA Aura, Mindra Aura) can be given a genuinely narrower surface than the website assistant
 * rather than being trusted to stay in its lane by prompt alone.
 *
 * <p>Tools/actions (booking, ticket creation, account lookups) are the obvious next members and
 * are deliberately absent: A3 ships no tool execution of any kind.
 */
public enum AssistantCapability {

    /** May answer AROORAA-specific questions from approved retrieved evidence. */
    GROUNDED_ANSWERS,

    /** May discuss technology in general, applied to the visitor's own system. */
    GENERAL_CONSULTING,

    /** May explore a visitor's idea/problem conversationally. */
    PROJECT_DISCOVERY,

    /** May answer careers/hiring questions. */
    CAREERS,

    /** May point at public pages and next steps. */
    NAVIGATION
}

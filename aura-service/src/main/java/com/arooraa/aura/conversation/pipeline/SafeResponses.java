package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.Language;

/**
 * What Aura says when it cannot say what it was going to — a guardrail stop, a provider failure,
 * or no configured provider at all.
 *
 * <p>Written in Aura's own voice and in the visitor's language, because a fallback is still a turn
 * in a conversation: "Your request could not be processed" is exactly the failure mode the quality
 * bar rejects. These are the only fixed strings in the system; everything a visitor reads in
 * normal operation is generated.
 */
public final class SafeResponses {

    private SafeResponses() {
    }

    /** Used when the guardrail stops a generated answer — deliberately vague about why. */
    public static String guardrailStop(Language language, ConversationMode mode) {
        if (mode == ConversationMode.INTERNAL_BOUNDARY) {
            return switch (language) {
                case ENGLISH -> "That one's on the private side of the line for me 🙂 — but if you're weighing "
                        + "the same decision for your own system, I'd genuinely enjoy digging into that with you.";
                case TAMIL -> "அது எங்கள் உள்ளக விஷயம், அதை நான் பகிர முடியாது 🙂 — ஆனா உங்க சொந்த system-க்கு "
                        + "இதே மாதிரி முடிவு எடுக்கணும்னா, நான் நிச்சயம் உதவுவேன்.";
                case TANGLISH -> "Adhu engaloda internal side 🙂 — but same decision-a unga own system-ku "
                        + "edukkanum-na, adha discuss panna naan ready.";
            };
        }
        return switch (language) {
            case ENGLISH -> "Let me try that again — I don't want to give you something I'm not sure about. "
                    + "Could you tell me a bit more about what you're after?";
            case TAMIL -> "இதை இன்னொரு முறை சொல்றேன் — உறுதியில்லாத ஒன்றை உங்களுக்கு சொல்ல விரும்பலை. "
                    + "நீங்க எதை தெரிஞ்சுக்கணும்னு கொஞ்சம் சொல்ல முடியுமா?";
            case TANGLISH -> "Adha thirumba try pannuren — sure illaadha onnu solla விரும்பla. "
                    + "Neenga enna therinjukanum-nu konjam sollunga?";
        };
    }

    /** The provider is configured but the call failed (timeout, rate limit, outage). */
    public static String providerUnavailable(Language language) {
        return switch (language) {
            case ENGLISH -> "Sorry — I'm having trouble thinking straight just now, my language service isn't "
                    + "responding. Give me a moment and try again?";
            case TAMIL -> "மன்னிக்கவும் — இப்போ என்னால் சரியா பதில் சொல்ல முடியலை, கொஞ்சம் கழிச்சு "
                    + "மறுபடியும் முயற்சி பண்ணுங்க.";
            case TANGLISH -> "Sorry — ippo enakku correct-a reply panna mudiyala. Konjam kalichu thirumba "
                    + "try pannunga?";
        };
    }

    /** No chat provider is configured at all — the safe default posture, not an error. */
    public static String providerDisabled(Language language) {
        return switch (language) {
            case ENGLISH -> "I'm here, but my language service isn't switched on in this environment yet — "
                    + "so I can't hold up my end of the conversation properly right now.";
            case TAMIL -> "நான் இருக்கேன், ஆனா இந்த environment-ல என்னோட language service இன்னும் "
                    + "இயக்கப்படலை — அதனால இப்போ சரியா பேச முடியலை.";
            case TANGLISH -> "Naan irukken, but indha environment-la enoda language service innum on "
                    + "pannala — so ippo proper-a pesa mudiyadhu.";
        };
    }
}

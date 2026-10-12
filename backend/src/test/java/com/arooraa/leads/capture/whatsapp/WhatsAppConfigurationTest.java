package com.arooraa.leads.capture.whatsapp;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class WhatsAppConfigurationTest {
    @Test
    void enabledWhatsAppRejectsNetworkClassifierInsideTheConversationTransaction() {
        var enabled = CloudApiWhatsAppGatewayTest.properties(true, false);
        assertThrows(IllegalStateException.class, () -> new WhatsAppConfiguration(enabled, "ollama"));
        assertDoesNotThrow(() -> new WhatsAppConfiguration(enabled, "none"));
    }

    @Test
    void disabledWhatsAppPreservesTheExistingSimulatorModelConfiguration() {
        var disabled = CloudApiWhatsAppGatewayTest.properties(false, false);
        assertDoesNotThrow(() -> new WhatsAppConfiguration(disabled, "ollama"));
    }

    @Test
    void liveSendingCannotBeEnabledWithoutTheWebhook() {
        var inconsistent = CloudApiWhatsAppGatewayTest.properties(false, true);
        assertThrows(IllegalStateException.class, () -> new WhatsAppConfiguration(inconsistent, "none"));
    }
}

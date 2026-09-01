package com.arooraa.aura.retrieval;

import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;

public record RetrievalRequest(String query, AssistantProfile profile, Channel channel) {
}

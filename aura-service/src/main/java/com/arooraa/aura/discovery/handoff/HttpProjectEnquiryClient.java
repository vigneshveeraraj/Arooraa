package com.arooraa.aura.discovery.handoff;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Aura's one call into the existing Start Project workflow.
 *
 * <p>The same public endpoint the website's own form posts to, with the same idempotency header —
 * so nothing about how enquiries are created, referenced, queued or emailed changes, and there is
 * no second lead store anywhere. This service is a caller, not an owner.
 *
 * <p>The wire body is assembled here and nowhere else. It sends the GUIDED submission shape with
 * every choice the visitor was never asked mapped to that shape's own "not sure" value — see
 * {@link ProjectEnquiryMapper} for why guessing would be worse than saying so.
 */
public class HttpProjectEnquiryClient implements ProjectEnquiryClient {

    private static final Logger log = LoggerFactory.getLogger(HttpProjectEnquiryClient.class);

    private final RestClient restClient;

    public HttpProjectEnquiryClient(RestClient.Builder builder, String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public EnquiryReceipt submit(ProjectEnquirySubmission submission, String idempotencyKey) {
        EnquiryResponse response;
        try {
            response = restClient.post()
                    .uri("/api/v1/project-enquiries")
                    .header("Idempotency-Key", idempotencyKey)
                    .body(wireBody(submission))
                    .retrieve()
                    .body(EnquiryResponse.class);
        } catch (HttpClientErrorException e) {
            // The workflow refused the request. Its validation messages describe our field names
            // and our mapping, which is our problem to fix and nothing a visitor should read.
            log.warn("Start Project workflow rejected an Aura handoff (status {}).", e.getStatusCode().value());
            throw new HandoffUnavailableException("HANDOFF_REJECTED",
                    "I couldn't send that to the team just now. Could you try again in a moment?");
        } catch (HttpServerErrorException | ResourceAccessException e) {
            log.warn("Start Project workflow unreachable for an Aura handoff.");
            throw new HandoffUnavailableException("HANDOFF_UNAVAILABLE",
                    "I couldn't reach the team just now. Could you try again in a moment?");
        }

        if (response == null || response.enquiryNumber() == null || response.enquiryNumber().isBlank()) {
            // Without a reference there is nothing to tell the visitor and nothing to stop a second
            // submission, so this is a failure even though the call succeeded.
            log.warn("Start Project workflow returned no enquiry reference.");
            throw new HandoffUnavailableException("HANDOFF_UNAVAILABLE",
                    "I couldn't confirm that reached the team. Could you try again in a moment?");
        }
        return new EnquiryReceipt(response.enquiryNumber(), response.message());
    }

    /**
     * The GUIDED shape, filled deterministically. The five enum choices Aura never asks about take
     * the workflow's own "not sure" values; {@code website} is its honeypot and must stay empty.
     */
    private EnquiryRequest wireBody(ProjectEnquirySubmission submission) {
        return new EnquiryRequest(
                "GUIDED",
                submission.name(),
                submission.companyName(),
                submission.businessEmail(),
                submission.phone(),
                submission.country(),
                submission.role(),
                "NEEDS_GUIDANCE",
                "NEEDS_RECOMMENDATION",
                submission.problemStatement(),
                "NOT_SURE",
                List.of(),
                "STILL_EXPLORING",
                "STILL_DEFINING",
                submission.existingSystemContext(),
                submission.preferredContactMethod(),
                submission.source(),
                submission.sourceContext(),
                "");
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private record EnquiryRequest(
            String submissionVersion,
            String name,
            String companyName,
            String businessEmail,
            String phone,
            String country,
            String role,
            String solutionModel,
            String engagementModel,
            String problemStatement,
            String projectStage,
            List<String> productTypes,
            String guidedTimeline,
            String guidedBudgetRange,
            String existingSystemContext,
            String preferredContactMethod,
            String source,
            String sourceContext,
            String website) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record EnquiryResponse(String enquiryNumber, String message) {
    }
}

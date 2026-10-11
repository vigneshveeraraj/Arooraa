package com.arooraa.leads.admin.leads.service;

import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import com.arooraa.leads.admin.leads.domain.LeadType;
import com.arooraa.leads.admin.leads.exception.LeadNotFoundException;
import com.arooraa.leads.admin.leads.repository.LeadActivityRepository;
import com.arooraa.leads.admin.leads.repository.LeadManagementRepository;
import com.arooraa.leads.admin.leads.repository.LeadNoteRepository;
import com.arooraa.leads.admin.leads.web.dto.AdminLeadDetail;
import com.arooraa.leads.admin.leads.web.dto.AdminLeadSummary;
import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadCaptureStatus;
import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.domain.PreferredCallTime;
import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import org.springframework.data.domain.Page;
import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.EngagementModel;
import com.arooraa.leads.project.domain.GuidedBudgetRange;
import com.arooraa.leads.project.domain.GuidedTimeline;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProductType;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.ProjectStage;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.SolutionModel;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.repository.DemoRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * The synthetic MESA reference is a pure, on-read-only derivation from a DemoRequest's id
 * (see AdminLeadQueryService.syntheticMesaReference Javadoc / docs/mesa-reference-number.md).
 * These tests exist specifically to prove that "pure function" claim: same id in, same
 * reference out, every time, regardless of how many times it's computed.
 */
class AdminLeadQueryServiceTest {

    private ProjectEnquiryRepository projectEnquiryRepository;
    private DemoRequestRepository demoRequestRepository;
    private LeadCaptureRepository leadCaptureRepository;
    private LeadManagementRepository leadManagementRepository;
    private AdminLeadQueryService service;

    @BeforeEach
    void setUp() {
        demoRequestRepository = mock(DemoRequestRepository.class);
        projectEnquiryRepository = mock(ProjectEnquiryRepository.class);
        leadCaptureRepository = mock(LeadCaptureRepository.class);
        leadManagementRepository = mock(LeadManagementRepository.class);
        LeadNoteRepository leadNoteRepository = mock(LeadNoteRepository.class);
        LeadActivityRepository leadActivityRepository = mock(LeadActivityRepository.class);
        AdminUserRepository adminUserRepository = mock(AdminUserRepository.class);
        DayWindowResolver dayWindowResolver = mock(DayWindowResolver.class);

        when(leadManagementRepository.findByLeadTypeAndLeadId(any(), any())).thenReturn(Optional.empty());
        when(leadNoteRepository.findByLeadTypeAndLeadIdOrderByCreatedAtAsc(any(), any())).thenReturn(List.of());
        when(leadActivityRepository.findByLeadTypeAndLeadIdOrderByCreatedAtDesc(any(), any())).thenReturn(List.of());

        service = new AdminLeadQueryService(demoRequestRepository, projectEnquiryRepository, leadCaptureRepository,
                leadManagementRepository, leadNoteRepository, leadActivityRepository, adminUserRepository,
                dayWindowResolver);
    }

    private static ProjectEnquiry legacyEnquiry() {
        return new ProjectEnquiry("ARO-2026-000001", "Arun Kumar", "ABC Logistics", "arun@example.com",
                "+919876543210", "+919876543210", "India", ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT,
                "We need a logistics tracking platform for our operations across five cities.", false,
                BudgetRange.FROM_2L_TO_5L, Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE,
                "WEBSITE", "/start-project", "hashed-ip", "JUnit-Agent", null, null, null, null);
    }

    private static ProjectEnquiry guidedEnquiry() {
        ProjectEnquiry enquiry = new ProjectEnquiry("ARO-2026-000002", "Priya Nair", "Nair Foods", "priya@example.com",
                "+919876500200", "+919876500200", "India", null, null, null, null, null, null,
                PreferredContactMethod.EMAIL, "WEBSITE", "/start-project", "hashed-ip", "JUnit-Agent", null, null,
                null, null);
        enquiry.applyGuidedFields(SolutionModel.NEW_PRODUCT, EngagementModel.DESIGN_BUILD,
                "We want to launch a new customer ordering app.", ProjectStage.IDEA,
                Set.of(ProductType.MOBILE_APPLICATION), GuidedTimeline.WITHIN_1_TO_3_MONTHS,
                GuidedBudgetRange.UNDER_5L, null, "Founder", "IN", null, true, null, null, null);
        return enquiry;
    }

    @Test
    void projectDetailDoesNotThrowAndOmitsLegacyOnlyFieldsForAGuidedRow() {
        UUID id = UUID.randomUUID();
        when(projectEnquiryRepository.findById(id)).thenReturn(Optional.of(guidedEnquiry()));

        AdminLeadDetail detail = assertDoesNotThrow(() -> service.detail(LeadType.PROJECT_ENQUIRY, id));

        assertEquals("Priya Nair", detail.customerName());
        assertNull(detail.submittedFields().get("Description"),
                "a guided row has no legacy description; the field must be omitted, not null-crash");
        assertEquals("New Product", detail.submittedFields().get("Solution model"));
        assertEquals("Mobile Application", detail.submittedFields().get("Product types"));
        assertEquals("Within 1 To 3 Months", detail.submittedFields().get("Timeline"));
        assertEquals("Yes", detail.submittedFields().get("WhatsApp consent"));
        assertEquals("Guided", detail.submittedFields().get("Submission type"));
    }

    @Test
    void projectDetailStillRendersLegacyFieldsForALegacyRow() {
        UUID id = UUID.randomUUID();
        when(projectEnquiryRepository.findById(id)).thenReturn(Optional.of(legacyEnquiry()));

        AdminLeadDetail detail = assertDoesNotThrow(() -> service.detail(LeadType.PROJECT_ENQUIRY, id));

        assertEquals("Custom Software", detail.submittedFields().get("Service type"));
        assertEquals("No", detail.submittedFields().get("Existing system"));
        assertEquals("From 1 To 3 Months", detail.submittedFields().get("Timeline"));
        assertEquals("Legacy", detail.submittedFields().get("Submission type"));
        assertNull(detail.submittedFields().get("Solution model"));
    }

    @Test
    void syntheticMesaReferenceIsStableForTheSameId() {
        UUID id = UUID.fromString("1a2b3c4d-5e6f-4789-9abc-def012345678");

        String first = AdminLeadQueryService.syntheticMesaReference(id);
        String second = AdminLeadQueryService.syntheticMesaReference(id);

        assertEquals(first, second, "the same id must always produce the same reference");
        assertEquals("MESA-1A2B3C4D", first);
    }

    @Test
    void syntheticMesaReferenceMatchesTheDocumentedFormat() {
        for (int i = 0; i < 20; i++) {
            String reference = AdminLeadQueryService.syntheticMesaReference(UUID.randomUUID());
            assertTrue(reference.matches("^MESA-[0-9A-F]{8}$"), "unexpected format: " + reference);
        }
    }

    @Test
    void differentIdsProduceDifferentReferencesInPractice() {
        UUID a = UUID.fromString("11111111-1111-4111-9111-111111111111");
        UUID b = UUID.fromString("22222222-2222-4222-9222-222222222222");

        assertTrue(!AdminLeadQueryService.syntheticMesaReference(a)
                .equals(AdminLeadQueryService.syntheticMesaReference(b)));
    }

    @Test
    void listMasksThePhoneAndResolvesDirectionForAGuidedProjectEnquiry() {
        when(projectEnquiryRepository.search(any(), any(), any())).thenReturn(List.of(guidedEnquiry()));

        Page<AdminLeadSummary> page = service.list(LeadType.PROJECT_ENQUIRY, null, null, null, null, 0, 20);
        AdminLeadSummary summary = page.getContent().get(0);

        assertEquals("+91••••••••00", summary.maskedPhone(), "first 3 and last 2 characters stay visible");
        assertTrue(summary.maskedPhone() != null && !summary.maskedPhone().equals(summary.phone()),
                "the list view must never show the raw phone number");
        assertEquals("New Product", summary.direction(), "a guided row's direction comes from its solution model");
        assertEquals("Email", summary.preferredContactMethod());
    }

    @Test
    void listResolvesDirectionFromProjectTypeForALegacyProjectEnquiry() {
        when(projectEnquiryRepository.search(any(), any(), any())).thenReturn(List.of(legacyEnquiry()));

        Page<AdminLeadSummary> page = service.list(LeadType.PROJECT_ENQUIRY, null, null, null, null, 0, 20);
        AdminLeadSummary summary = page.getContent().get(0);

        assertEquals("New Product", summary.direction(), "a legacy row has no solution model, so its project type is used instead");
    }

    @Test
    void listLeavesTheNewProjectOnlyFieldsNullForAMesaDemoRow() {
        DemoRequestRepository demoRequestRepository = mock(DemoRequestRepository.class);
        LeadManagementRepository leadManagementRepository = mock(LeadManagementRepository.class);
        LeadNoteRepository leadNoteRepository = mock(LeadNoteRepository.class);
        LeadActivityRepository leadActivityRepository = mock(LeadActivityRepository.class);
        AdminUserRepository adminUserRepository = mock(AdminUserRepository.class);
        DayWindowResolver dayWindowResolver = mock(DayWindowResolver.class);
        when(leadManagementRepository.findByLeadTypeInAndLeadIdIn(any(), any())).thenReturn(List.of());

        com.arooraa.leads.domain.DemoRequest demo = mock(com.arooraa.leads.domain.DemoRequest.class);
        when(demo.getId()).thenReturn(UUID.randomUUID());
        when(demo.getContactName()).thenReturn("Priya");
        when(demo.getStatus()).thenReturn(com.arooraa.leads.domain.LeadStatus.NEW);
        when(demo.getCreatedAt()).thenReturn(java.time.Instant.now());
        when(demoRequestRepository.search(any(), any(), any(), any())).thenReturn(List.of(demo));

        AdminLeadQueryService demoService = new AdminLeadQueryService(demoRequestRepository, projectEnquiryRepository,
                mock(LeadCaptureRepository.class), leadManagementRepository, leadNoteRepository, leadActivityRepository,
                adminUserRepository, dayWindowResolver);

        Page<AdminLeadSummary> page = demoService.list(LeadType.MESA_DEMO, null, null, null, null, 0, 20);
        AdminLeadSummary summary = page.getContent().get(0);

        assertNull(summary.maskedPhone());
        assertNull(summary.direction());
        assertNull(summary.preferredContactMethod());
    }

    // ---- LEAD_CAPTURE ----

    private static LeadCapture webCapture() {
        return LeadCapture.fromWebForm("LC-7Q2M9X", LeadRequirement.AI_AUTOMATION, "+919840012345",
                "I agree that AROORAA may contact me on this number about this enquiry.", LeadLanguage.TA,
                new LeadCapture.Attribution("/ta/grow-your-business", null, "google", null, "tn-growth", null),
                "hashed-ip");
    }

    private static LeadCapture mockedCapture(Instant createdAt) {
        LeadCapture capture = mock(LeadCapture.class);
        when(capture.getId()).thenReturn(UUID.randomUUID());
        when(capture.getLeadReference()).thenReturn("LC-ABCDEF");
        when(capture.getPhone()).thenReturn("+919840012345");
        when(capture.getRequirement()).thenReturn(LeadRequirement.WEBSITE);
        when(capture.getStatus()).thenReturn(LeadCaptureStatus.NEW);
        when(capture.getCreatedAt()).thenReturn(createdAt);
        return capture;
    }

    @Test
    void leadCaptureDetailShowsRequirementPhoneLanguageConsentAndSourceWithoutInventingIdentity() {
        LeadCapture capture = webCapture();
        capture.choosePreferredLanguage(LeadLanguage.EN);
        capture.answerPreferredCallTime(PreferredCallTime.EVENING);
        when(leadCaptureRepository.findById(capture.getId())).thenReturn(Optional.of(capture));

        AdminLeadDetail detail = service.detail(LeadType.LEAD_CAPTURE, capture.getId());

        assertEquals(LeadType.LEAD_CAPTURE, detail.leadType());
        assertEquals("LC-7Q2M9X", detail.referenceNumber());
        assertEquals("NEW", detail.status());
        assertEquals("+919840012345", detail.phone(), "the detail view shows the real number, like other lead types");
        assertNull(detail.customerName(), "a capture has no name; it must not be invented");
        assertNull(detail.email(), "a capture has no email; it must not be invented");
        assertNull(detail.companyOrRestaurant());
        assertNull(detail.cityOrCountry());

        Map<String, String> fields = detail.submittedFields();
        assertEquals("Ai Automation", fields.get("Requirement"));
        assertEquals("English", fields.get("Preferred language"));
        assertEquals("Tamil", fields.get("Page language"));
        assertEquals("Evening", fields.get("Preferred call time"));
        assertEquals("Yes", fields.get("Consent given"));
        assertEquals("Web Form", fields.get("Consent source"));
        assertEquals("I agree that AROORAA may contact me on this number about this enquiry.", fields.get("Consent text"));
        assertTrue(fields.containsKey("Consent recorded at"));
        assertEquals("Website", fields.get("Source"));
        assertEquals("/ta/grow-your-business", fields.get("Source page"));
        assertEquals("tn-growth", fields.get("UTM campaign"));
        assertFalse(fields.containsKey("Referrer"), "absent attribution is omitted, not shown blank");
        assertFalse(fields.containsKey("Business type"));
        assertTrue(fields.values().stream().noneMatch(v -> v.contains("hashed-ip")), "ip hash must never be exposed");
    }

    @Test
    void leadCaptureDetailOmitsUnansweredConversationFields() {
        LeadCapture capture = webCapture();
        when(leadCaptureRepository.findById(capture.getId())).thenReturn(Optional.of(capture));

        Map<String, String> fields = service.detail(LeadType.LEAD_CAPTURE, capture.getId()).submittedFields();

        assertFalse(fields.containsKey("Preferred language"), "null until the customer chooses in the conversation");
        assertFalse(fields.containsKey("Preferred call time"));
        assertEquals("No", fields.get("Handoff to a person requested"));
    }

    @Test
    void missingLeadCaptureIsNotFound() {
        UUID missing = UUID.randomUUID();
        when(leadCaptureRepository.findById(missing)).thenReturn(Optional.empty());

        assertThrows(LeadNotFoundException.class, () -> service.detail(LeadType.LEAD_CAPTURE, missing));
    }

    @Test
    void listReturnsACaptureWithNullIdentityAMaskedPhoneAndTheRequirementAsDirection() {
        LeadCapture capture = mockedCapture(Instant.now());
        when(leadManagementRepository.findByLeadTypeInAndLeadIdIn(any(), any())).thenReturn(List.of());
        when(leadCaptureRepository.search(any(), any(), any())).thenReturn(List.of(capture));

        Page<AdminLeadSummary> page = service.list(LeadType.LEAD_CAPTURE, null, null, null, null, 0, 20);
        AdminLeadSummary summary = page.getContent().get(0);

        assertEquals(LeadType.LEAD_CAPTURE, summary.leadType());
        assertEquals("LC-ABCDEF", summary.referenceNumber());
        assertNull(summary.customerName());
        assertNull(summary.email());
        assertNull(summary.companyOrRestaurant());
        assertEquals("+91••••••••45", summary.maskedPhone());
        assertEquals("Website", summary.direction());
        assertNull(summary.preferredContactMethod());
    }

    @Test
    void typeFilterKeepsCapturesIsolatedFromOtherLeadTypes() {
        LeadCapture capture = mockedCapture(Instant.now());
        when(leadManagementRepository.findByLeadTypeInAndLeadIdIn(any(), any())).thenReturn(List.of());
        when(leadCaptureRepository.search(any(), any(), any())).thenReturn(List.of(capture));
        when(projectEnquiryRepository.search(any(), any(), any())).thenReturn(List.of(legacyEnquiry()));

        service.list(LeadType.LEAD_CAPTURE, null, null, null, null, 0, 20);
        verify(projectEnquiryRepository, never()).search(any(), any(), any());
        verify(demoRequestRepository, never()).search(any(), any(), any(), any());

        service.list(LeadType.PROJECT_ENQUIRY, null, null, null, null, 0, 20);
        service.list(LeadType.MESA_DEMO, null, null, null, null, 0, 20);
        verify(leadCaptureRepository, times(1)).search(any(), any(), any());
    }

    @Test
    void statusFilterAndSearchArePassedToTheCaptureQuery() {
        when(leadManagementRepository.findByLeadTypeInAndLeadIdIn(any(), any())).thenReturn(List.of());
        when(leadCaptureRepository.search(any(), any(), any())).thenReturn(List.of());

        service.list(null, "CONTACTED", "  LC-7Q2  ", null, null, 0, 20);

        verify(leadCaptureRepository).search(eq(LeadCaptureStatus.CONTACTED), eq("%lc-7q2%"), any());
    }
}

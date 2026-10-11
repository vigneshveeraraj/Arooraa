package com.arooraa.leads.admin.leads.service;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import com.arooraa.leads.admin.leads.domain.LeadManagement;
import com.arooraa.leads.admin.leads.domain.LeadType;
import com.arooraa.leads.admin.leads.domain.LostReason;
import com.arooraa.leads.admin.leads.exception.AdminValidationException;
import com.arooraa.leads.admin.leads.exception.LeadManagementConflictException;
import com.arooraa.leads.admin.leads.exception.LeadNotFoundException;
import com.arooraa.leads.admin.leads.repository.LeadActivityRepository;
import com.arooraa.leads.admin.leads.repository.LeadManagementRepository;
import com.arooraa.leads.admin.leads.repository.LeadNoteRepository;
import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadCaptureStatus;
import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.domain.LeadStatus;
import com.arooraa.leads.domain.OutletCount;
import com.arooraa.leads.domain.PrimaryChallenge;
import com.arooraa.leads.domain.RestaurantType;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.repository.DemoRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LeadManagementServiceTest {

    private final DemoRequestRepository demoRequestRepository = mock(DemoRequestRepository.class);
    private final ProjectEnquiryRepository projectEnquiryRepository = mock(ProjectEnquiryRepository.class);
    private final LeadCaptureRepository leadCaptureRepository = mock(LeadCaptureRepository.class);
    private final LeadManagementRepository leadManagementRepository = mock(LeadManagementRepository.class);
    private final LeadNoteRepository leadNoteRepository = mock(LeadNoteRepository.class);
    private final LeadActivityRepository leadActivityRepository = mock(LeadActivityRepository.class);
    private final AdminUserRepository adminUserRepository = mock(AdminUserRepository.class);

    private LeadManagementService service;
    private UUID leadId;
    private DemoRequest demoRequest;

    @BeforeEach
    void setUp() {
        service = new LeadManagementService(demoRequestRepository, projectEnquiryRepository, leadCaptureRepository,
                leadManagementRepository, leadNoteRepository, leadActivityRepository, adminUserRepository);

        leadId = UUID.randomUUID();
        demoRequest = new DemoRequest("Priya Sharma", "Spice Route", "+919876543210", null, "Chennai",
                OutletCount.ONE, RestaurantType.CASUAL_DINING, PrimaryChallenge.BILLING_POS, null, null, null, null,
                "/", "hashed-ip", "JUnit", null, null, null, null);
        when(demoRequestRepository.findById(leadId)).thenReturn(Optional.of(demoRequest));
        when(demoRequestRepository.existsById(leadId)).thenReturn(true);
        when(demoRequestRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
        when(leadManagementRepository.findByLeadTypeAndLeadId(LeadType.MESA_DEMO, leadId)).thenReturn(Optional.empty());
        when(leadManagementRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void rejectsAnUnknownStatusValue() {
        assertThrows(AdminValidationException.class,
                () -> service.updateStatus(LeadType.MESA_DEMO, leadId, "NOT_A_REAL_STATUS", null, null, null));
    }

    @Test
    void requiresALostReasonWhenMarkingLost() {
        assertThrows(AdminValidationException.class,
                () -> service.updateStatus(LeadType.MESA_DEMO, leadId, "LOST", null, null, null));
    }

    @Test
    void acceptsLostWithAValidReason() {
        service.updateStatus(LeadType.MESA_DEMO, leadId, "LOST", "BUDGET", null, null);
        assertEquals(LeadStatus.LOST, demoRequest.getStatus());
    }

    @Test
    void rejectsAnUnknownLostReason() {
        assertThrows(AdminValidationException.class,
                () -> service.updateStatus(LeadType.MESA_DEMO, leadId, "LOST", "NOT_A_REAL_REASON", null, null));
    }

    @Test
    void statusUpdateOnNonexistentLeadThrowsNotFound() {
        UUID missing = UUID.randomUUID();
        when(demoRequestRepository.findById(missing)).thenReturn(Optional.empty());

        assertThrows(LeadNotFoundException.class,
                () -> service.updateStatus(LeadType.MESA_DEMO, missing, "CONTACTED", null, null, null));
    }

    @Test
    void mismatchedExpectedVersionIsRejectedAsConflictBeforeAnyWrite() {
        // demoRequest starts at version 0 (never persisted); expecting version 5 must conflict
        assertThrows(LeadManagementConflictException.class,
                () -> service.updateStatus(LeadType.MESA_DEMO, leadId, "CONTACTED", null, 5L, null));
    }

    @Test
    void staleWriteDetectedAtFlushIsTranslatedToConflict() {
        when(demoRequestRepository.saveAndFlush(any())).thenThrow(new ObjectOptimisticLockingFailureException(DemoRequest.class, leadId));

        assertThrows(LeadManagementConflictException.class,
                () -> service.updateStatus(LeadType.MESA_DEMO, leadId, "CONTACTED", null, null, null));
    }

    @Test
    void followUpUpdateOnNonexistentLeadThrowsNotFound() {
        UUID missing = UUID.randomUUID();
        when(demoRequestRepository.existsById(missing)).thenReturn(false);

        assertThrows(LeadNotFoundException.class,
                () -> service.updateFollowUp(LeadType.MESA_DEMO, missing, java.time.Instant.now(), null, null));
    }

    @Test
    void assignmentToAnUnknownAdminIsRejected() {
        UUID unknownAdmin = UUID.randomUUID();
        when(adminUserRepository.findById(unknownAdmin)).thenReturn(Optional.empty());

        assertThrows(AdminValidationException.class,
                () -> service.updateAssignment(LeadType.MESA_DEMO, leadId, unknownAdmin, null, null));
    }

    @Test
    void assignmentToAnInactiveAdminIsRejected() throws Exception {
        AdminUser inactive = new AdminUser("inactive@arooraa.test", "hashed", "Inactive");
        var activeField = AdminUser.class.getDeclaredField("active");
        activeField.setAccessible(true);
        activeField.set(inactive, false);
        when(adminUserRepository.findById(inactive.getId())).thenReturn(Optional.of(inactive));

        assertThrows(AdminValidationException.class,
                () -> service.updateAssignment(LeadType.MESA_DEMO, leadId, inactive.getId(), null, null));
    }

    @Test
    void getOrCreateReusesExistingRowInsteadOfDuplicating() {
        LeadManagement existing = new LeadManagement(LeadType.MESA_DEMO, leadId);
        when(leadManagementRepository.findByLeadTypeAndLeadId(LeadType.MESA_DEMO, leadId)).thenReturn(Optional.of(existing));

        LeadManagement result = service.getOrCreate(LeadType.MESA_DEMO, leadId);

        assertEquals(existing, result);
    }

    // ---- LEAD_CAPTURE ----

    private LeadCapture stubbedCapture() {
        LeadCapture capture = LeadCapture.fromWebForm("LC-7Q2M9X", LeadRequirement.WEBSITE, "+919840012345",
                "I agree that AROORAA may contact me on this number about this enquiry.", LeadLanguage.TA,
                new LeadCapture.Attribution(null, null, null, null, null, null), "hashed-ip");
        when(leadCaptureRepository.findById(capture.getId())).thenReturn(Optional.of(capture));
        when(leadCaptureRepository.existsById(capture.getId())).thenReturn(true);
        when(leadCaptureRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
        when(leadManagementRepository.findByLeadTypeAndLeadId(LeadType.LEAD_CAPTURE, capture.getId()))
                .thenReturn(Optional.empty());
        return capture;
    }

    @Test
    void updatesALeadCaptureStatusOnTheCaptureRowItself() {
        LeadCapture capture = stubbedCapture();

        service.updateStatus(LeadType.LEAD_CAPTURE, capture.getId(), "CONTACTED", null, 0L, null);

        assertEquals(LeadCaptureStatus.CONTACTED, capture.getStatus());
        verify(leadCaptureRepository).saveAndFlush(capture);
        verify(demoRequestRepository, never()).saveAndFlush(any());
    }

    @Test
    void leadCaptureStatusWithAStaleVersionIsAConflict() {
        LeadCapture capture = stubbedCapture();

        assertThrows(LeadManagementConflictException.class,
                () -> service.updateStatus(LeadType.LEAD_CAPTURE, capture.getId(), "CONTACTED", null, 3L, null));
        assertEquals(LeadCaptureStatus.NEW, capture.getStatus());
    }

    @Test
    void leadCaptureStaleWriteDetectedAtFlushIsTranslatedToConflict() {
        LeadCapture capture = stubbedCapture();
        when(leadCaptureRepository.saveAndFlush(any()))
                .thenThrow(new ObjectOptimisticLockingFailureException(LeadCapture.class, capture.getId()));

        assertThrows(LeadManagementConflictException.class,
                () -> service.updateStatus(LeadType.LEAD_CAPTURE, capture.getId(), "CONTACTED", null, null, null));
    }

    @Test
    void lostLeadCaptureRecordsTheLostReasonOnTheCaptureOverlay() {
        LeadCapture capture = stubbedCapture();

        service.updateStatus(LeadType.LEAD_CAPTURE, capture.getId(), "LOST", "NO_RESPONSE", null, null);

        assertEquals(LeadCaptureStatus.LOST, capture.getStatus());
        verify(leadManagementRepository, atLeastOnce()).saveAndFlush(argThat((LeadManagement m) ->
                m.getLeadType() == LeadType.LEAD_CAPTURE && m.getLeadId().equals(capture.getId())
                        && m.getLostReason() == LostReason.NO_RESPONSE));
    }

    @Test
    void notesAndFollowUpsOnAMissingLeadCaptureAreNotFound() {
        UUID missing = UUID.randomUUID();
        when(leadCaptureRepository.existsById(missing)).thenReturn(false);

        assertThrows(LeadNotFoundException.class,
                () -> service.addNote(LeadType.LEAD_CAPTURE, missing, UUID.randomUUID(), "Called."));
        assertThrows(LeadNotFoundException.class,
                () -> service.updateFollowUp(LeadType.LEAD_CAPTURE, missing, java.time.Instant.now(), null, null));
    }

    @Test
    void aCaptureIdIsNeverResolvedAgainstAnotherLeadTypesTable() {
        LeadCapture capture = stubbedCapture();

        // The same UUID addressed as MESA_DEMO must not find the capture.
        when(demoRequestRepository.existsById(capture.getId())).thenReturn(false);
        assertThrows(LeadNotFoundException.class,
                () -> service.addNote(LeadType.MESA_DEMO, capture.getId(), UUID.randomUUID(), "Wrong type."));
    }
}

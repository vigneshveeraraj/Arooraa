package com.arooraa.leads.admin.leads.service;

import com.arooraa.leads.admin.leads.domain.LeadManagement;
import com.arooraa.leads.admin.leads.domain.LeadType;
import com.arooraa.leads.admin.leads.repository.LeadManagementRepository;
import com.arooraa.leads.admin.leads.web.dto.DashboardSummary;
import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadCaptureStatus;
import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import com.arooraa.leads.domain.LeadStatus;
import com.arooraa.leads.project.domain.EnquiryStatus;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.repository.DemoRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Lead captures must count towards every aggregate the dashboard shows, while the original
 * per-type subtotals (newProjectEnquiries, newMesaDemoRequests) keep their meaning.
 */
class AdminDashboardServiceTest {

    private final DemoRequestRepository demoRequestRepository = mock(DemoRequestRepository.class);
    private final ProjectEnquiryRepository projectEnquiryRepository = mock(ProjectEnquiryRepository.class);
    private final LeadCaptureRepository leadCaptureRepository = mock(LeadCaptureRepository.class);
    private final LeadManagementRepository leadManagementRepository = mock(LeadManagementRepository.class);

    private AdminDashboardService service;

    @BeforeEach
    void setUp() {
        service = new AdminDashboardService(demoRequestRepository, projectEnquiryRepository, leadCaptureRepository,
                leadManagementRepository, new DayWindowResolver());

        when(projectEnquiryRepository.countByStatus(any())).thenReturn(0L);
        when(demoRequestRepository.countByStatus(any())).thenReturn(0L);
        when(leadCaptureRepository.countByStatus(any())).thenReturn(0L);
        when(leadManagementRepository.findByLeadTypeAndFollowUpAtIsNotNull(any())).thenReturn(List.of());
    }

    private static LeadCapture capture(LeadCaptureStatus status) {
        LeadCapture capture = LeadCapture.fromWebForm("LC-TEST01", LeadRequirement.WEBSITE, "+919840012345", "Consent sentence.", LeadLanguage.EN,
                new LeadCapture.Attribution(null, null, null, null, null, null), "hashed-ip");
        capture.updateStatus(status);
        return capture;
    }

    private static LeadManagement followUp(LeadCapture capture, Instant at) {
        LeadManagement management = new LeadManagement(LeadType.LEAD_CAPTURE, capture.getId());
        management.setFollowUpAt(at);
        return management;
    }

    @Test
    void newCapturesAreReportedSeparatelyAndIncludedInTheTotal() {
        when(projectEnquiryRepository.countByStatus(EnquiryStatus.NEW)).thenReturn(3L);
        when(demoRequestRepository.countByStatus(LeadStatus.NEW)).thenReturn(2L);
        when(leadCaptureRepository.countByStatus(LeadCaptureStatus.NEW)).thenReturn(4L);

        DashboardSummary summary = service.dashboard("UTC");

        assertEquals(3L, summary.newProjectEnquiries(), "existing subtotal keeps its meaning");
        assertEquals(2L, summary.newMesaDemoRequests(), "captures must never be counted as MESA");
        assertEquals(4L, summary.newLeadCaptures());
        assertEquals(9L, summary.totalNewLeads());
    }

    @Test
    void pipelineCountsIncludeCaptures() {
        when(leadCaptureRepository.countByStatus(LeadCaptureStatus.QUALIFIED)).thenReturn(1L);
        when(leadCaptureRepository.countByStatus(LeadCaptureStatus.PROPOSAL_SENT)).thenReturn(2L);
        when(leadCaptureRepository.countByStatus(LeadCaptureStatus.NEGOTIATION)).thenReturn(3L);
        when(leadCaptureRepository.countByStatus(LeadCaptureStatus.WON)).thenReturn(4L);
        when(leadCaptureRepository.countByStatus(LeadCaptureStatus.LOST)).thenReturn(5L);
        when(projectEnquiryRepository.countByStatus(EnquiryStatus.WON)).thenReturn(10L);

        DashboardSummary summary = service.dashboard("UTC");

        assertEquals(1L, summary.qualified());
        assertEquals(2L, summary.proposalSent());
        assertEquals(3L, summary.negotiation());
        assertEquals(14L, summary.won());
        assertEquals(5L, summary.lost());
    }

    @Test
    void captureFollowUpsCountAsOverdueOrDueTodayUnlessClosed() {
        Instant startOfToday = new DayWindowResolver().resolveToday("UTC").startOfDay();
        LeadCapture overdueOpen = capture(LeadCaptureStatus.CONTACTED);
        LeadCapture overdueWon = capture(LeadCaptureStatus.WON);
        LeadCapture dueTodayOpen = capture(LeadCaptureStatus.NEW);

        List<LeadManagement> rows = List.of(
                followUp(overdueOpen, startOfToday.minus(Duration.ofDays(2))),
                followUp(overdueWon, startOfToday.minus(Duration.ofDays(2))),
                followUp(dueTodayOpen, startOfToday.plus(Duration.ofMinutes(1))));
        when(leadManagementRepository.findByLeadTypeAndFollowUpAtIsNotNull(LeadType.LEAD_CAPTURE)).thenReturn(rows);
        when(leadCaptureRepository.findAllById(any())).thenReturn(List.of(overdueOpen, overdueWon, dueTodayOpen));

        DashboardSummary summary = service.dashboard("UTC");

        assertEquals(1L, summary.overdueFollowUps(), "a WON capture's old follow-up is not overdue");
        assertEquals(1L, summary.followUpsDueToday());
    }
}

package com.arooraa.leads.admin.leads.service;

import com.arooraa.leads.admin.leads.domain.LeadManagement;
import com.arooraa.leads.admin.leads.domain.LeadType;
import com.arooraa.leads.admin.leads.repository.LeadManagementRepository;
import com.arooraa.leads.admin.leads.web.dto.DashboardSummary;
import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadCaptureStatus;
import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.domain.LeadStatus;
import com.arooraa.leads.project.domain.EnquiryStatus;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.repository.DemoRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * All lead types share one status vocabulary (LeadStatus was widened to match EnquiryStatus
 * in Milestone 2C, and LeadCaptureStatus was created with the same values), so every count
 * here is a simple, uniform sum across the domain tables rather than a bespoke per-type
 * interpretation.
 */
@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final DemoRequestRepository demoRequestRepository;
    private final ProjectEnquiryRepository projectEnquiryRepository;
    private final LeadCaptureRepository leadCaptureRepository;
    private final LeadManagementRepository leadManagementRepository;
    private final DayWindowResolver dayWindowResolver;

    public AdminDashboardService(DemoRequestRepository demoRequestRepository,
                                  ProjectEnquiryRepository projectEnquiryRepository,
                                  LeadCaptureRepository leadCaptureRepository,
                                  LeadManagementRepository leadManagementRepository,
                                  DayWindowResolver dayWindowResolver) {
        this.demoRequestRepository = demoRequestRepository;
        this.projectEnquiryRepository = projectEnquiryRepository;
        this.leadCaptureRepository = leadCaptureRepository;
        this.leadManagementRepository = leadManagementRepository;
        this.dayWindowResolver = dayWindowResolver;
    }

    public DashboardSummary dashboard(String timezone) {
        long newProjectEnquiries = projectEnquiryRepository.countByStatus(EnquiryStatus.NEW);
        long newMesaDemoRequests = demoRequestRepository.countByStatus(LeadStatus.NEW);
        long newLeadCaptures = leadCaptureRepository.countByStatus(LeadCaptureStatus.NEW);

        long qualified = projectEnquiryRepository.countByStatus(EnquiryStatus.QUALIFIED)
                + demoRequestRepository.countByStatus(LeadStatus.QUALIFIED)
                + leadCaptureRepository.countByStatus(LeadCaptureStatus.QUALIFIED);
        long proposalSent = projectEnquiryRepository.countByStatus(EnquiryStatus.PROPOSAL_SENT)
                + demoRequestRepository.countByStatus(LeadStatus.PROPOSAL_SENT)
                + leadCaptureRepository.countByStatus(LeadCaptureStatus.PROPOSAL_SENT);
        long negotiation = projectEnquiryRepository.countByStatus(EnquiryStatus.NEGOTIATION)
                + demoRequestRepository.countByStatus(LeadStatus.NEGOTIATION)
                + leadCaptureRepository.countByStatus(LeadCaptureStatus.NEGOTIATION);
        long won = projectEnquiryRepository.countByStatus(EnquiryStatus.WON)
                + demoRequestRepository.countByStatus(LeadStatus.WON)
                + leadCaptureRepository.countByStatus(LeadCaptureStatus.WON);
        long lost = projectEnquiryRepository.countByStatus(EnquiryStatus.LOST)
                + demoRequestRepository.countByStatus(LeadStatus.LOST)
                + leadCaptureRepository.countByStatus(LeadCaptureStatus.LOST);

        List<LeadManagement> projectFollowUps = leadManagementRepository.findByLeadTypeAndFollowUpAtIsNotNull(LeadType.PROJECT_ENQUIRY);
        List<LeadManagement> mesaFollowUps = leadManagementRepository.findByLeadTypeAndFollowUpAtIsNotNull(LeadType.MESA_DEMO);
        List<LeadManagement> captureFollowUps = leadManagementRepository.findByLeadTypeAndFollowUpAtIsNotNull(LeadType.LEAD_CAPTURE);
        Map<UUID, String> projectStatuses = projectStatusesFor(projectFollowUps);
        Map<UUID, String> mesaStatuses = mesaStatusesFor(mesaFollowUps);
        Map<UUID, String> captureStatuses = captureStatusesFor(captureFollowUps);

        DayWindowResolver.DayWindow window = dayWindowResolver.resolveToday(timezone);
        long dueToday = countInWindow(projectFollowUps, projectStatuses, window, true)
                + countInWindow(mesaFollowUps, mesaStatuses, window, true)
                + countInWindow(captureFollowUps, captureStatuses, window, true);
        long overdue = countInWindow(projectFollowUps, projectStatuses, window, false)
                + countInWindow(mesaFollowUps, mesaStatuses, window, false)
                + countInWindow(captureFollowUps, captureStatuses, window, false);

        return new DashboardSummary(newProjectEnquiries + newMesaDemoRequests + newLeadCaptures,
                newProjectEnquiries, newMesaDemoRequests, dueToday, overdue, qualified, proposalSent, negotiation,
                won, lost, newLeadCaptures);
    }

    private Map<UUID, String> projectStatusesFor(List<LeadManagement> rows) {
        List<UUID> ids = rows.stream().map(LeadManagement::getLeadId).toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return projectEnquiryRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(ProjectEnquiry::getId, pe -> pe.getStatus().name()));
    }

    private Map<UUID, String> mesaStatusesFor(List<LeadManagement> rows) {
        List<UUID> ids = rows.stream().map(LeadManagement::getLeadId).toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return demoRequestRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(DemoRequest::getId, dr -> dr.getStatus().name()));
    }

    private Map<UUID, String> captureStatusesFor(List<LeadManagement> rows) {
        List<UUID> ids = rows.stream().map(LeadManagement::getLeadId).toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return leadCaptureRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(LeadCapture::getId, lc -> lc.getStatus().name()));
    }

    private long countInWindow(List<LeadManagement> rows, Map<UUID, String> statuses,
                                DayWindowResolver.DayWindow window, boolean dueToday) {
        long count = 0;
        for (LeadManagement m : rows) {
            String status = statuses.get(m.getLeadId());
            if ("WON".equals(status) || "LOST".equals(status)) {
                continue;
            }
            Instant followUp = m.getFollowUpAt();
            if (followUp == null) {
                continue;
            }
            boolean matches = dueToday
                    ? !followUp.isBefore(window.startOfDay()) && followUp.isBefore(window.startOfNextDay())
                    : followUp.isBefore(window.startOfDay());
            if (matches) {
                count++;
            }
        }
        return count;
    }
}

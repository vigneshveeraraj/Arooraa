package com.arooraa.leads.admin.leads.service;

import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import com.arooraa.leads.admin.leads.domain.ActivityType;
import com.arooraa.leads.admin.leads.domain.LeadActivity;
import com.arooraa.leads.admin.leads.domain.LeadManagement;
import com.arooraa.leads.admin.leads.domain.LeadNote;
import com.arooraa.leads.admin.leads.domain.LeadType;
import com.arooraa.leads.admin.leads.domain.LostReason;
import com.arooraa.leads.admin.leads.exception.AdminValidationException;
import com.arooraa.leads.admin.leads.exception.LeadManagementConflictException;
import com.arooraa.leads.admin.leads.exception.LeadNotFoundException;
import com.arooraa.leads.admin.leads.repository.LeadActivityRepository;
import com.arooraa.leads.admin.leads.repository.LeadManagementRepository;
import com.arooraa.leads.admin.leads.repository.LeadNoteRepository;
import com.arooraa.leads.domain.LeadStatus;
import com.arooraa.leads.project.domain.EnquiryStatus;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.repository.DemoRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Owns every admin write path (status, follow-up, assignment, estimated value, lost
 * reason, notes) and records the matching activity row atomically in the same
 * transaction. Domain-table status stays on demo_requests/project_enquiries; everything
 * else lives in lead_management, keyed by (lead_type, lead_id) — see LeadManagement.
 */
@Service
public class LeadManagementService {

    private static final Logger log = LoggerFactory.getLogger(LeadManagementService.class);

    private static final Set<String> VALID_STATUSES = Set.of(
            "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST");
    private static final String CONFLICT_MESSAGE = "This lead was changed by someone else. Reload and try again.";

    private final DemoRequestRepository demoRequestRepository;
    private final ProjectEnquiryRepository projectEnquiryRepository;
    private final LeadManagementRepository leadManagementRepository;
    private final LeadNoteRepository leadNoteRepository;
    private final LeadActivityRepository leadActivityRepository;
    private final AdminUserRepository adminUserRepository;

    public LeadManagementService(DemoRequestRepository demoRequestRepository,
                                  ProjectEnquiryRepository projectEnquiryRepository,
                                  LeadManagementRepository leadManagementRepository,
                                  LeadNoteRepository leadNoteRepository,
                                  LeadActivityRepository leadActivityRepository,
                                  AdminUserRepository adminUserRepository) {
        this.demoRequestRepository = demoRequestRepository;
        this.projectEnquiryRepository = projectEnquiryRepository;
        this.leadManagementRepository = leadManagementRepository;
        this.leadNoteRepository = leadNoteRepository;
        this.leadActivityRepository = leadActivityRepository;
        this.adminUserRepository = adminUserRepository;
    }

    @Transactional
    public LeadManagement getOrCreate(LeadType leadType, UUID leadId) {
        return leadManagementRepository.findByLeadTypeAndLeadId(leadType, leadId)
                .orElseGet(() -> {
                    try {
                        return leadManagementRepository.saveAndFlush(new LeadManagement(leadType, leadId));
                    } catch (DataIntegrityViolationException raceLost) {
                        return leadManagementRepository.findByLeadTypeAndLeadId(leadType, leadId)
                                .orElseThrow(() -> raceLost);
                    }
                });
    }

    @Transactional
    public void updateStatus(LeadType leadType, UUID leadId, String statusName, String lostReasonName,
                              Long expectedVersion, UUID actorAdminId) {
        String newStatus = statusName.trim().toUpperCase(Locale.ROOT);
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new AdminValidationException("Unknown status: " + statusName);
        }

        LostReason lostReason = null;
        if ("LOST".equals(newStatus)) {
            if (lostReasonName == null || lostReasonName.isBlank()) {
                throw new AdminValidationException("A lost reason is required when marking a lead as LOST.");
            }
            lostReason = parseLostReason(lostReasonName);
        }

        String oldStatus = switch (leadType) {
            case PROJECT_ENQUIRY -> updateProjectEnquiryStatus(leadId, newStatus, expectedVersion);
            case MESA_DEMO -> updateDemoRequestStatus(leadId, newStatus, expectedVersion);
        };

        if (lostReason != null) {
            LeadManagement management = getOrCreate(leadType, leadId);
            management.setLostReason(lostReason);
            saveManagement(management);
        }

        recordActivity(leadType, leadId, actorAdminId, ActivityType.STATUS_CHANGED, oldStatus, newStatus);
        log.info("admin lead status changed leadType={} leadId={} from={} to={}", leadType, leadId, oldStatus, newStatus);
    }

    private String updateProjectEnquiryStatus(UUID leadId, String newStatus, Long expectedVersion) {
        ProjectEnquiry entity = projectEnquiryRepository.findById(leadId)
                .orElseThrow(() -> new LeadNotFoundException("Project enquiry not found"));
        checkVersion(expectedVersion, entity.getVersion());
        String oldStatus = entity.getStatus().name();
        entity.updateStatus(EnquiryStatus.valueOf(newStatus));
        try {
            projectEnquiryRepository.saveAndFlush(entity);
        } catch (ObjectOptimisticLockingFailureException conflict) {
            throw new LeadManagementConflictException(CONFLICT_MESSAGE);
        }
        return oldStatus;
    }

    private String updateDemoRequestStatus(UUID leadId, String newStatus, Long expectedVersion) {
        var entity = demoRequestRepository.findById(leadId)
                .orElseThrow(() -> new LeadNotFoundException("MESA demo request not found"));
        checkVersion(expectedVersion, entity.getVersion());
        String oldStatus = entity.getStatus().name();
        entity.updateStatus(LeadStatus.valueOf(newStatus));
        try {
            demoRequestRepository.saveAndFlush(entity);
        } catch (ObjectOptimisticLockingFailureException conflict) {
            throw new LeadManagementConflictException(CONFLICT_MESSAGE);
        }
        return oldStatus;
    }

    @Transactional
    public void updateFollowUp(LeadType leadType, UUID leadId, Instant followUpAt, Long expectedVersion, UUID actorAdminId) {
        ensureLeadExists(leadType, leadId);
        LeadManagement management = getOrCreate(leadType, leadId);
        checkVersion(expectedVersion, management.getVersion());

        String oldValue = management.getFollowUpAt() == null ? null : management.getFollowUpAt().toString();
        management.setFollowUpAt(followUpAt);
        saveManagement(management);

        String newValue = followUpAt == null ? null : followUpAt.toString();
        recordActivity(leadType, leadId, actorAdminId, ActivityType.FOLLOW_UP_SET, oldValue, newValue);
    }

    @Transactional
    public void updateAssignment(LeadType leadType, UUID leadId, UUID assignedAdminId, Long expectedVersion, UUID actorAdminId) {
        ensureLeadExists(leadType, leadId);
        if (assignedAdminId != null) {
            var assignee = adminUserRepository.findById(assignedAdminId)
                    .orElseThrow(() -> new AdminValidationException("Unknown admin user."));
            if (!assignee.isActive()) {
                throw new AdminValidationException("Cannot assign a lead to an inactive admin user.");
            }
        }

        LeadManagement management = getOrCreate(leadType, leadId);
        checkVersion(expectedVersion, management.getVersion());

        UUID oldAssignee = management.getAssignedAdminId();
        management.assignTo(assignedAdminId);
        saveManagement(management);

        recordActivity(leadType, leadId, actorAdminId, ActivityType.ASSIGNED_CHANGED,
                oldAssignee == null ? null : oldAssignee.toString(),
                assignedAdminId == null ? null : assignedAdminId.toString());
    }

    @Transactional
    public void updateEstimatedValue(LeadType leadType, UUID leadId, BigDecimal estimatedValue, String currency,
                                      Long expectedVersion, UUID actorAdminId) {
        ensureLeadExists(leadType, leadId);
        LeadManagement management = getOrCreate(leadType, leadId);
        checkVersion(expectedVersion, management.getVersion());

        String oldValue = management.getEstimatedValue() == null ? null
                : management.getEstimatedValue() + " " + management.getEstimatedValueCurrency();
        String resolvedCurrency = estimatedValue == null ? null
                : (currency == null || currency.isBlank() ? "INR" : currency.trim().toUpperCase(Locale.ROOT));
        management.setEstimatedValue(estimatedValue, resolvedCurrency);
        saveManagement(management);

        String newValue = estimatedValue == null ? null : estimatedValue + " " + resolvedCurrency;
        recordActivity(leadType, leadId, actorAdminId, ActivityType.ESTIMATED_VALUE_SET, oldValue, newValue);
    }

    @Transactional
    public LeadNote addNote(LeadType leadType, UUID leadId, UUID adminId, String noteText) {
        ensureLeadExists(leadType, leadId);
        LeadNote note = new LeadNote(leadType, leadId, adminId, noteText.trim());
        leadNoteRepository.save(note);
        recordActivity(leadType, leadId, adminId, ActivityType.NOTE_ADDED, null, null);
        return note;
    }

    public List<LeadNote> notes(LeadType leadType, UUID leadId) {
        return leadNoteRepository.findByLeadTypeAndLeadIdOrderByCreatedAtAsc(leadType, leadId);
    }

    private void ensureLeadExists(LeadType leadType, UUID leadId) {
        boolean exists = switch (leadType) {
            case PROJECT_ENQUIRY -> projectEnquiryRepository.existsById(leadId);
            case MESA_DEMO -> demoRequestRepository.existsById(leadId);
        };
        if (!exists) {
            throw new LeadNotFoundException("Lead not found");
        }
    }

    private void checkVersion(Long expectedVersion, long actualVersion) {
        if (expectedVersion != null && expectedVersion.longValue() != actualVersion) {
            throw new LeadManagementConflictException(CONFLICT_MESSAGE);
        }
    }

    private void saveManagement(LeadManagement management) {
        try {
            leadManagementRepository.saveAndFlush(management);
        } catch (ObjectOptimisticLockingFailureException conflict) {
            throw new LeadManagementConflictException(CONFLICT_MESSAGE);
        }
    }

    private void recordActivity(LeadType leadType, UUID leadId, UUID actorAdminId, ActivityType type,
                                 String oldValue, String newValue) {
        leadActivityRepository.save(new LeadActivity(
                leadType, leadId, actorAdminId, type, truncate(oldValue), truncate(newValue)));
    }

    private static String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() > 200 ? value.substring(0, 200) : value;
    }

    private static LostReason parseLostReason(String raw) {
        try {
            return LostReason.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new AdminValidationException("Unknown lost reason: " + raw);
        }
    }
}

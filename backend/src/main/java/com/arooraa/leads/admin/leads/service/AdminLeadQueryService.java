package com.arooraa.leads.admin.leads.service;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import com.arooraa.leads.admin.leads.domain.LeadActivity;
import com.arooraa.leads.admin.leads.domain.LeadManagement;
import com.arooraa.leads.admin.leads.domain.LeadNote;
import com.arooraa.leads.admin.leads.domain.LeadType;
import com.arooraa.leads.admin.leads.exception.AdminValidationException;
import com.arooraa.leads.admin.leads.exception.LeadNotFoundException;
import com.arooraa.leads.admin.leads.repository.LeadActivityRepository;
import com.arooraa.leads.admin.leads.repository.LeadManagementRepository;
import com.arooraa.leads.admin.leads.repository.LeadNoteRepository;
import com.arooraa.leads.admin.leads.web.dto.ActivityResponse;
import com.arooraa.leads.admin.leads.web.dto.AdminLeadDetail;
import com.arooraa.leads.admin.leads.web.dto.AdminLeadSummary;
import com.arooraa.leads.admin.leads.web.dto.FollowUpFilter;
import com.arooraa.leads.admin.leads.web.dto.ManagementInfo;
import com.arooraa.leads.admin.leads.web.dto.NoteResponse;
import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.domain.LeadStatus;
import com.arooraa.leads.project.domain.EnquiryStatus;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.repository.DemoRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminLeadQueryService {

    /** Scale guard for the current Java-side merge/sort approach — see class Javadoc. */
    private static final int MAX_ROWS_PER_TYPE = 2000;
    private static final Set<String> VALID_STATUSES = Set.of(
            "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST");

    private final DemoRequestRepository demoRequestRepository;
    private final ProjectEnquiryRepository projectEnquiryRepository;
    private final LeadManagementRepository leadManagementRepository;
    private final LeadNoteRepository leadNoteRepository;
    private final LeadActivityRepository leadActivityRepository;
    private final AdminUserRepository adminUserRepository;
    private final DayWindowResolver dayWindowResolver;

    public AdminLeadQueryService(DemoRequestRepository demoRequestRepository,
                                  ProjectEnquiryRepository projectEnquiryRepository,
                                  LeadManagementRepository leadManagementRepository,
                                  LeadNoteRepository leadNoteRepository,
                                  LeadActivityRepository leadActivityRepository,
                                  AdminUserRepository adminUserRepository,
                                  DayWindowResolver dayWindowResolver) {
        this.demoRequestRepository = demoRequestRepository;
        this.projectEnquiryRepository = projectEnquiryRepository;
        this.leadManagementRepository = leadManagementRepository;
        this.leadNoteRepository = leadNoteRepository;
        this.leadActivityRepository = leadActivityRepository;
        this.adminUserRepository = adminUserRepository;
        this.dayWindowResolver = dayWindowResolver;
    }

    public Page<AdminLeadSummary> list(LeadType leadTypeFilter, String statusFilter, String search,
                                        FollowUpFilter followUpFilter, String timezone, int page, int size) {
        if (statusFilter != null && !VALID_STATUSES.contains(statusFilter)) {
            throw new AdminValidationException("Unknown status: " + statusFilter);
        }
        if (search != null && search.length() > 200) {
            throw new AdminValidationException("Search text is too long.");
        }
        if (page < 0 || size < 1 || size > 200) {
            throw new AdminValidationException("Invalid pagination parameters.");
        }

        String searchPattern = null;
        String idPattern = null;
        if (search != null && !search.isBlank()) {
            String lowered = search.trim().toLowerCase(Locale.ROOT);
            searchPattern = "%" + lowered + "%";
            String strippedForId = lowered.startsWith("mesa-") ? lowered.substring(5) : lowered;
            idPattern = "%" + strippedForId + "%";
        }

        List<AdminLeadSummary> merged = new ArrayList<>();
        if (leadTypeFilter == null || leadTypeFilter == LeadType.PROJECT_ENQUIRY) {
            EnquiryStatus enquiryStatus = statusFilter == null ? null : EnquiryStatus.valueOf(statusFilter);
            for (ProjectEnquiry pe : projectEnquiryRepository.search(enquiryStatus, searchPattern, PageRequest.of(0, MAX_ROWS_PER_TYPE))) {
                merged.add(toSummary(pe));
            }
        }
        if (leadTypeFilter == null || leadTypeFilter == LeadType.MESA_DEMO) {
            LeadStatus demoStatus = statusFilter == null ? null : LeadStatus.valueOf(statusFilter);
            for (DemoRequest dr : demoRequestRepository.search(demoStatus, searchPattern, idPattern, PageRequest.of(0, MAX_ROWS_PER_TYPE))) {
                merged.add(toSummary(dr));
            }
        }

        merged = decorateWithManagement(merged);
        merged.sort(Comparator.comparing(AdminLeadSummary::createdAt).reversed());

        if (followUpFilter != null) {
            merged = applyFollowUpFilter(merged, followUpFilter, timezone);
        }

        int total = merged.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        return new PageImpl<>(merged.subList(from, to), PageRequest.of(page, size), total);
    }

    private List<AdminLeadSummary> applyFollowUpFilter(List<AdminLeadSummary> rows, FollowUpFilter filter, String timezone) {
        if (filter == FollowUpFilter.ANY_SET) {
            return rows.stream().filter(r -> r.followUpAt() != null).collect(Collectors.toList());
        }
        DayWindowResolver.DayWindow window = dayWindowResolver.resolveToday(timezone);
        return rows.stream()
                .filter(r -> r.followUpAt() != null && !"WON".equals(r.status()) && !"LOST".equals(r.status()))
                .filter(r -> filter == FollowUpFilter.DUE_TODAY
                        ? !r.followUpAt().isBefore(window.startOfDay()) && r.followUpAt().isBefore(window.startOfNextDay())
                        : r.followUpAt().isBefore(window.startOfDay()))
                .collect(Collectors.toList());
    }

    public AdminLeadDetail detail(LeadType leadType, UUID id) {
        return switch (leadType) {
            case PROJECT_ENQUIRY -> projectDetail(id);
            case MESA_DEMO -> mesaDetail(id);
        };
    }

    private AdminLeadDetail projectDetail(UUID id) {
        ProjectEnquiry pe = projectEnquiryRepository.findById(id)
                .orElseThrow(() -> new LeadNotFoundException("Project enquiry not found"));

        Map<String, String> fields = new LinkedHashMap<>();
        putIfPresent(fields, "Service type", humanize(pe.getServiceType().name()));
        putIfPresent(fields, "Project type", humanize(pe.getProjectType().name()));
        putIfPresent(fields, "Description", pe.getDescription());
        fields.put("Existing system", pe.isExistingSystem() ? "Yes" : "No");
        putIfPresent(fields, "Budget range", humanize(pe.getBudgetRange().name()));
        putIfPresent(fields, "Timeline", humanize(pe.getTimeline().name()));
        putIfPresent(fields, "Preferred contact method", humanize(pe.getPreferredContactMethod().name()));
        putIfPresent(fields, "Source", pe.getSource());
        putIfPresent(fields, "Source page", pe.getSourcePage());
        putIfPresent(fields, "Referrer", pe.getReferrer());
        putIfPresent(fields, "UTM source", pe.getUtmSource());
        putIfPresent(fields, "UTM medium", pe.getUtmMedium());
        putIfPresent(fields, "UTM campaign", pe.getUtmCampaign());

        return new AdminLeadDetail(pe.getId(), LeadType.PROJECT_ENQUIRY, pe.getEnquiryNumber(), pe.getStatus().name(),
                pe.getVersion(), pe.getCreatedAt(), pe.getName(), pe.getCompanyName(), pe.getBusinessEmail(),
                pe.getPhone(), pe.getCountry(), fields, buildManagementInfo(LeadType.PROJECT_ENQUIRY, id),
                buildNotes(LeadType.PROJECT_ENQUIRY, id), buildActivity(LeadType.PROJECT_ENQUIRY, id));
    }

    private AdminLeadDetail mesaDetail(UUID id) {
        DemoRequest dr = demoRequestRepository.findById(id)
                .orElseThrow(() -> new LeadNotFoundException("MESA demo request not found"));

        Map<String, String> fields = new LinkedHashMap<>();
        putIfPresent(fields, "Number of outlets", humanize(dr.getOutletCount().name()));
        putIfPresent(fields, "Restaurant type", humanize(dr.getRestaurantType().name()));
        putIfPresent(fields, "Primary challenge", humanize(dr.getPrimaryChallenge().name()));
        putIfPresent(fields, "Current software", dr.getCurrentSoftware());
        if (dr.getPreferredDemoDate() != null) {
            fields.put("Preferred demo date", dr.getPreferredDemoDate().toString());
        }
        putIfPresent(fields, "Preferred demo time", dr.getPreferredDemoTime());
        putIfPresent(fields, "Additional message", dr.getAdditionalMessage());
        putIfPresent(fields, "Source page", dr.getSourcePage());
        putIfPresent(fields, "Referrer", dr.getReferrer());
        putIfPresent(fields, "UTM source", dr.getUtmSource());
        putIfPresent(fields, "UTM medium", dr.getUtmMedium());
        putIfPresent(fields, "UTM campaign", dr.getUtmCampaign());

        return new AdminLeadDetail(dr.getId(), LeadType.MESA_DEMO, syntheticMesaReference(dr.getId()), dr.getStatus().name(),
                dr.getVersion(), dr.getCreatedAt(), dr.getContactName(), dr.getRestaurantName(), dr.getBusinessEmail(),
                dr.getNormalizedWhatsappNumber(), dr.getCity(), fields, buildManagementInfo(LeadType.MESA_DEMO, id),
                buildNotes(LeadType.MESA_DEMO, id), buildActivity(LeadType.MESA_DEMO, id));
    }

    private ManagementInfo buildManagementInfo(LeadType leadType, UUID leadId) {
        return leadManagementRepository.findByLeadTypeAndLeadId(leadType, leadId)
                .map(m -> {
                    String assignedName = m.getAssignedAdminId() == null ? null
                            : adminUserRepository.findById(m.getAssignedAdminId()).map(AdminUser::getDisplayName).orElse(null);
                    return new ManagementInfo(m.getAssignedAdminId(), assignedName, m.getFollowUpAt(),
                            m.getEstimatedValue(), m.getEstimatedValueCurrency(),
                            m.getLostReason() == null ? null : m.getLostReason().name(),
                            m.getInternalSummary(), m.getLastContactedAt(), m.getVersion());
                })
                .orElseGet(() -> new ManagementInfo(null, null, null, null, null, null, null, null, 0L));
    }

    private List<NoteResponse> buildNotes(LeadType leadType, UUID leadId) {
        List<LeadNote> notes = leadNoteRepository.findByLeadTypeAndLeadIdOrderByCreatedAtAsc(leadType, leadId);
        Map<UUID, String> adminNames = batchAdminNames(
                notes.stream().map(LeadNote::getAdminUserId).collect(Collectors.toSet()));
        return notes.stream()
                .map(n -> new NoteResponse(n.getId(), adminNames.getOrDefault(n.getAdminUserId(), "Unknown"),
                        n.getNote(), n.getCreatedAt()))
                .toList();
    }

    private List<ActivityResponse> buildActivity(LeadType leadType, UUID leadId) {
        List<LeadActivity> rows = leadActivityRepository.findByLeadTypeAndLeadIdOrderByCreatedAtDesc(leadType, leadId);
        Map<UUID, String> adminNames = batchAdminNames(rows.stream()
                .map(LeadActivity::getActorAdminId).filter(Objects::nonNull).collect(Collectors.toSet()));
        return rows.stream()
                .map(a -> new ActivityResponse(a.getId(),
                        a.getActorAdminId() == null ? "System" : adminNames.getOrDefault(a.getActorAdminId(), "Unknown"),
                        a.getActivityType().name(), a.getOldValue(), a.getNewValue(), a.getCreatedAt()))
                .toList();
    }

    private Map<UUID, String> batchAdminNames(Set<UUID> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return adminUserRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(AdminUser::getId, AdminUser::getDisplayName));
    }

    private List<AdminLeadSummary> decorateWithManagement(List<AdminLeadSummary> base) {
        if (base.isEmpty()) {
            return base;
        }
        List<LeadType> types = base.stream().map(AdminLeadSummary::leadType).distinct().toList();
        List<UUID> ids = base.stream().map(AdminLeadSummary::id).toList();
        List<LeadManagement> managementRows = leadManagementRepository.findByLeadTypeInAndLeadIdIn(types, ids);
        Map<String, LeadManagement> byKey = managementRows.stream()
                .collect(Collectors.toMap(m -> key(m.getLeadType(), m.getLeadId()), m -> m));
        Map<UUID, String> adminNames = batchAdminNames(managementRows.stream()
                .map(LeadManagement::getAssignedAdminId).filter(Objects::nonNull).collect(Collectors.toSet()));

        List<AdminLeadSummary> decorated = new ArrayList<>(base.size());
        for (AdminLeadSummary s : base) {
            LeadManagement m = byKey.get(key(s.leadType(), s.id()));
            if (m == null) {
                decorated.add(s);
                continue;
            }
            String assignedName = m.getAssignedAdminId() == null ? null : adminNames.get(m.getAssignedAdminId());
            decorated.add(new AdminLeadSummary(s.id(), s.leadType(), s.referenceNumber(), s.customerName(),
                    s.companyOrRestaurant(), s.email(), s.phone(), s.cityOrCountry(), s.status(), s.createdAt(),
                    m.getFollowUpAt(), assignedName, m.getEstimatedValue(), m.getEstimatedValueCurrency()));
        }
        return decorated;
    }

    private static String key(LeadType type, UUID id) {
        return type.name() + "|" + id;
    }

    private static AdminLeadSummary toSummary(ProjectEnquiry pe) {
        return new AdminLeadSummary(pe.getId(), LeadType.PROJECT_ENQUIRY, pe.getEnquiryNumber(), pe.getName(),
                pe.getCompanyName(), pe.getBusinessEmail(), pe.getPhone(), pe.getCountry(), pe.getStatus().name(),
                pe.getCreatedAt(), null, null, null, null);
    }

    private static AdminLeadSummary toSummary(DemoRequest dr) {
        return new AdminLeadSummary(dr.getId(), LeadType.MESA_DEMO, syntheticMesaReference(dr.getId()),
                dr.getContactName(), dr.getRestaurantName(), dr.getBusinessEmail(), dr.getNormalizedWhatsappNumber(),
                dr.getCity(), dr.getStatus().name(), dr.getCreatedAt(), null, null, null, null);
    }

    /**
     * DemoRequest has no stored reference number (unlike ProjectEnquiry.enquiryNumber) —
     * deliberately not added in Milestone 2C to avoid touching the tested MESA write path.
     * This derives a label purely from the existing id: a pure function of {@code id}, so
     * it is stable/deterministic for a given lead (calling it twice for the same id always
     * returns the same string) without persisting anything new. It is NOT a database
     * business identifier — it is computed on read, never stored, and exists only to give
     * the admin UI something reference-shaped to display and search on. See
     * docs/mesa-reference-number.md for the full rationale and search behaviour.
     */
    static String syntheticMesaReference(UUID id) {
        return "MESA-" + id.toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private static String humanize(String enumName) {
        String[] words = enumName.split("_");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (w.isEmpty()) {
                continue;
            }
            if (!sb.isEmpty()) {
                sb.append(' ');
            }
            sb.append(w.substring(0, 1)).append(w.substring(1).toLowerCase(Locale.ROOT));
        }
        return sb.toString();
    }

    private static void putIfPresent(Map<String, String> map, String label, String value) {
        if (value != null && !value.isBlank()) {
            map.put(label, value);
        }
    }
}

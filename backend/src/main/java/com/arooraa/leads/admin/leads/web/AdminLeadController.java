package com.arooraa.leads.admin.leads.web;

import com.arooraa.leads.admin.auth.service.AdminPrincipal;
import com.arooraa.leads.admin.leads.domain.LeadType;
import com.arooraa.leads.admin.leads.exception.AdminValidationException;
import com.arooraa.leads.admin.leads.service.AdminLeadQueryService;
import com.arooraa.leads.admin.leads.service.LeadManagementService;
import com.arooraa.leads.admin.leads.web.dto.AdminLeadDetail;
import com.arooraa.leads.admin.leads.web.dto.AdminLeadSummary;
import com.arooraa.leads.admin.leads.web.dto.AssignmentUpdateRequest;
import com.arooraa.leads.admin.leads.web.dto.EstimatedValueUpdateRequest;
import com.arooraa.leads.admin.leads.web.dto.FollowUpFilter;
import com.arooraa.leads.admin.leads.web.dto.FollowUpUpdateRequest;
import com.arooraa.leads.admin.leads.web.dto.NoteCreateRequest;
import com.arooraa.leads.admin.leads.web.dto.NoteResponse;
import com.arooraa.leads.admin.leads.web.dto.StatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/leads")
public class AdminLeadController {

    private final AdminLeadQueryService queryService;
    private final LeadManagementService managementService;

    public AdminLeadController(AdminLeadQueryService queryService, LeadManagementService managementService) {
        this.queryService = queryService;
        this.managementService = managementService;
    }

    @GetMapping
    public Page<AdminLeadSummary> list(
            @RequestParam(required = false) String leadType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String followUp,
            @RequestParam(required = false) String timezone,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return queryService.list(parseLeadType(leadType), status, search, parseFollowUpFilter(followUp), timezone, page, size);
    }

    @GetMapping("/{type}/{id}")
    public AdminLeadDetail detail(@PathVariable String type, @PathVariable UUID id) {
        return queryService.detail(requireLeadType(type), id);
    }

    @PatchMapping("/{type}/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable String type, @PathVariable UUID id,
                                              @Valid @RequestBody StatusUpdateRequest request,
                                              @AuthenticationPrincipal AdminPrincipal principal) {
        managementService.updateStatus(requireLeadType(type), id, request.status(), request.lostReason(),
                request.expectedVersion(), principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{type}/{id}/follow-up")
    public ResponseEntity<Void> updateFollowUp(@PathVariable String type, @PathVariable UUID id,
                                                @RequestBody FollowUpUpdateRequest request,
                                                @AuthenticationPrincipal AdminPrincipal principal) {
        managementService.updateFollowUp(requireLeadType(type), id, request.followUpAt(), request.expectedVersion(),
                principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{type}/{id}/assignment")
    public ResponseEntity<Void> updateAssignment(@PathVariable String type, @PathVariable UUID id,
                                                  @RequestBody AssignmentUpdateRequest request,
                                                  @AuthenticationPrincipal AdminPrincipal principal) {
        managementService.updateAssignment(requireLeadType(type), id, request.assignedAdminId(), request.expectedVersion(),
                principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{type}/{id}/estimated-value")
    public ResponseEntity<Void> updateEstimatedValue(@PathVariable String type, @PathVariable UUID id,
                                                       @Valid @RequestBody EstimatedValueUpdateRequest request,
                                                       @AuthenticationPrincipal AdminPrincipal principal) {
        managementService.updateEstimatedValue(requireLeadType(type), id, request.estimatedValue(), request.currency(),
                request.expectedVersion(), principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{type}/{id}/notes")
    public ResponseEntity<NoteResponse> addNote(@PathVariable String type, @PathVariable UUID id,
                                                 @Valid @RequestBody NoteCreateRequest request,
                                                 @AuthenticationPrincipal AdminPrincipal principal) {
        var note = managementService.addNote(requireLeadType(type), id, principal.getId(), request.note());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new NoteResponse(note.getId(), principal.getDisplayName(), note.getNote(), note.getCreatedAt()));
    }

    private static LeadType parseLeadType(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return requireLeadType(raw);
    }

    private static LeadType requireLeadType(String raw) {
        try {
            return LeadType.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new AdminValidationException("Unknown lead type: " + raw);
        }
    }

    private static FollowUpFilter parseFollowUpFilter(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return FollowUpFilter.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new AdminValidationException("Unknown followUp filter: " + raw);
        }
    }
}

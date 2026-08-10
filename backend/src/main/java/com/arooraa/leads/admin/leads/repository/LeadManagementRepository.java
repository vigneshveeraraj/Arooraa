package com.arooraa.leads.admin.leads.repository;

import com.arooraa.leads.admin.leads.domain.LeadManagement;
import com.arooraa.leads.admin.leads.domain.LeadType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeadManagementRepository extends JpaRepository<LeadManagement, UUID> {

    Optional<LeadManagement> findByLeadTypeAndLeadId(LeadType leadType, UUID leadId);

    List<LeadManagement> findByLeadTypeInAndLeadIdIn(List<LeadType> leadTypes, List<UUID> leadIds);

    List<LeadManagement> findByLeadTypeAndFollowUpAtIsNotNull(LeadType leadType);
}

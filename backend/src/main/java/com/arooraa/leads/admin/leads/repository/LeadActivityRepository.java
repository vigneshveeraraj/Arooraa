package com.arooraa.leads.admin.leads.repository;

import com.arooraa.leads.admin.leads.domain.LeadActivity;
import com.arooraa.leads.admin.leads.domain.LeadType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeadActivityRepository extends JpaRepository<LeadActivity, UUID> {

    List<LeadActivity> findByLeadTypeAndLeadIdOrderByCreatedAtDesc(LeadType leadType, UUID leadId);
}

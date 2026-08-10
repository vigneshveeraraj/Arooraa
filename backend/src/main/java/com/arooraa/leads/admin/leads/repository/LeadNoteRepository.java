package com.arooraa.leads.admin.leads.repository;

import com.arooraa.leads.admin.leads.domain.LeadNote;
import com.arooraa.leads.admin.leads.domain.LeadType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeadNoteRepository extends JpaRepository<LeadNote, UUID> {

    List<LeadNote> findByLeadTypeAndLeadIdOrderByCreatedAtAsc(LeadType leadType, UUID leadId);
}

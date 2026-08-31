package com.arooraa.leads.project.repository;

import com.arooraa.leads.project.domain.EnquiryStatus;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectEnquiryRepository extends JpaRepository<ProjectEnquiry, UUID> {

    /** Idempotency-key replay lookup (W3.2B §23) — distinct from the time-window duplicate check below. */
    Optional<ProjectEnquiry> findByIdempotencyKey(String idempotencyKey);

    @Query("""
            select p from ProjectEnquiry p
            where p.normalizedPhone = :phone
              and lower(p.businessEmail) = lower(:businessEmail)
              and p.createdAt >= :since
            order by p.createdAt desc
            """)
    List<ProjectEnquiry> findRecentDuplicates(@Param("phone") String phone,
                                              @Param("businessEmail") String businessEmail,
                                              @Param("since") Instant since);

    long countByStatus(EnquiryStatus status);

    /** Admin lead search (Milestone 2C): reference number, name, company, email, phone. */
    @Query("""
            select p from ProjectEnquiry p
            where (:status is null or p.status = :status)
              and (:search is null or
                   lower(p.enquiryNumber) like :search
                   or lower(p.name) like :search
                   or lower(coalesce(p.companyName, '')) like :search
                   or lower(p.businessEmail) like :search
                   or lower(p.phone) like :search)
            order by p.createdAt desc
            """)
    List<ProjectEnquiry> search(@Param("status") EnquiryStatus status,
                                 @Param("search") String search,
                                 Pageable pageable);
}

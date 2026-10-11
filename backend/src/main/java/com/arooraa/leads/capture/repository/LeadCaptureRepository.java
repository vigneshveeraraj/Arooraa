package com.arooraa.leads.capture.repository;

import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadCaptureStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeadCaptureRepository extends JpaRepository<LeadCapture, UUID> {

    Optional<LeadCapture> findByIdempotencyKey(String idempotencyKey);

    Optional<LeadCapture> findByLeadReference(String leadReference);

    boolean existsByLeadReference(String leadReference);

    long countByStatus(LeadCaptureStatus status);

    /**
     * Admin lead search, same shape as ProjectEnquiryRepository.search: reference, phone and
     * business type (all substring, case-insensitive). There is no name or email to match.
     */
    @Query("""
            select c from LeadCapture c
            where (:status is null or c.status = :status)
              and (:search is null or
                   lower(c.leadReference) like :search
                   or lower(c.phone) like :search
                   or lower(coalesce(c.businessType, '')) like :search)
            order by c.createdAt desc
            """)
    List<LeadCapture> search(@Param("status") LeadCaptureStatus status,
                             @Param("search") String search,
                             Pageable pageable);
}

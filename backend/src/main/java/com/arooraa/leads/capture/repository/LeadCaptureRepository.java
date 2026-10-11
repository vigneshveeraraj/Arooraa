package com.arooraa.leads.capture.repository;

import com.arooraa.leads.capture.domain.LeadCapture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LeadCaptureRepository extends JpaRepository<LeadCapture, UUID> {

    Optional<LeadCapture> findByIdempotencyKey(String idempotencyKey);

    Optional<LeadCapture> findByLeadReference(String leadReference);

    boolean existsByLeadReference(String leadReference);
}

package com.arooraa.leads.careers.repository;

import com.arooraa.leads.careers.domain.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {

    Optional<JobApplication> findByIdempotencyKey(String idempotencyKey);
}

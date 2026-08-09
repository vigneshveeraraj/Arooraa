package com.arooraa.leads.project.repository;

import com.arooraa.leads.project.domain.ProjectEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ProjectEnquiryRepository extends JpaRepository<ProjectEnquiry, UUID> {

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
}

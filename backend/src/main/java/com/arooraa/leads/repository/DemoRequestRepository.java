package com.arooraa.leads.repository;

import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.domain.LeadStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface DemoRequestRepository extends JpaRepository<DemoRequest, UUID> {

    @Query("""
            select d from DemoRequest d
            where d.normalizedWhatsappNumber = :phone
              and lower(d.restaurantName) = lower(:restaurantName)
              and d.createdAt >= :since
            order by d.createdAt desc
            """)
    List<DemoRequest> findRecentDuplicates(@Param("phone") String phone,
                                           @Param("restaurantName") String restaurantName,
                                           @Param("since") Instant since);

    long countByStatus(LeadStatus status);

    /**
     * Admin lead search (Milestone 2C). :search matches customer/restaurant name, email
     * and phone (all substring, case-insensitive); :idPattern additionally matches against
     * the lowercase UUID text so the admin UI's synthetic "MESA-XXXXXXXX" reference
     * (derived from this id, never stored) is still searchable.
     */
    @Query("""
            select d from DemoRequest d
            where (:status is null or d.status = :status)
              and (:search is null or
                   lower(d.contactName) like :search
                   or lower(d.restaurantName) like :search
                   or lower(coalesce(d.businessEmail, '')) like :search
                   or lower(d.normalizedWhatsappNumber) like :search
                   or lower(str(d.id)) like :idPattern)
            order by d.createdAt desc
            """)
    List<DemoRequest> search(@Param("status") LeadStatus status,
                              @Param("search") String search,
                              @Param("idPattern") String idPattern,
                              Pageable pageable);
}

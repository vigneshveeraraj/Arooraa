package com.arooraa.leads.repository;

import com.arooraa.leads.domain.DemoRequest;
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
}

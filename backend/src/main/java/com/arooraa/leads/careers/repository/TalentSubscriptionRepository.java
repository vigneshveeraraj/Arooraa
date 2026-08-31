package com.arooraa.leads.careers.repository;

import com.arooraa.leads.careers.domain.TalentSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TalentSubscriptionRepository extends JpaRepository<TalentSubscription, UUID> {

    Optional<TalentSubscription> findByEmail(String email);
}

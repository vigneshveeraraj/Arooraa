package com.arooraa.leads.contact.repository;

import com.arooraa.leads.contact.domain.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, UUID> {

    Optional<ContactMessage> findByIdempotencyKey(String idempotencyKey);
}

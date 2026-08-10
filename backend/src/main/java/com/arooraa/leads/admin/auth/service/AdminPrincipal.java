package com.arooraa.leads.admin.auth.service;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Carries the admin's id/displayName through the Spring Security authentication
 * context, so controllers can attribute actions (notes, activity rows) to a real
 * admin_users row without a second lookup by email.
 */
public class AdminPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String passwordHash;
    private final String displayName;
    private final boolean active;

    public AdminPrincipal(AdminUser adminUser) {
        this.id = adminUser.getId();
        this.email = adminUser.getEmail();
        this.passwordHash = adminUser.getPasswordHash();
        this.displayName = adminUser.getDisplayName();
        this.active = adminUser.isActive();
    }

    public UUID getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ADMIN"));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}

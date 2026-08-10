package com.arooraa.leads.admin.auth.service;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminUserDetailsServiceTest {

    private final AdminUserRepository repository = mock(AdminUserRepository.class);
    private final AdminUserDetailsService service = new AdminUserDetailsService(repository);

    @Test
    void loadsAnActiveAdminAsEnabled() {
        AdminUser admin = new AdminUser("owner@arooraa.test", "hashed", "Owner");
        when(repository.findByEmail(eq("owner@arooraa.test"))).thenReturn(Optional.of(admin));

        UserDetails details = service.loadUserByUsername("owner@arooraa.test");

        assertEquals("owner@arooraa.test", details.getUsername());
        assertTrue(details.isEnabled());
        assertTrue(details.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMIN")));
    }

    @Test
    void normalizesEmailCaseBeforeLookup() {
        AdminUser admin = new AdminUser("owner@arooraa.test", "hashed", "Owner");
        when(repository.findByEmail(eq("owner@arooraa.test"))).thenReturn(Optional.of(admin));

        service.loadUserByUsername("Owner@Arooraa.test");
        // no exception means the uppercase input was normalized before the repository lookup
    }

    @Test
    void inactiveAdminIsNotEnabled() throws Exception {
        AdminUser admin = new AdminUser("inactive@arooraa.test", "hashed", "Inactive");
        var activeField = AdminUser.class.getDeclaredField("active");
        activeField.setAccessible(true);
        activeField.set(admin, false);
        when(repository.findByEmail(eq("inactive@arooraa.test"))).thenReturn(Optional.of(admin));

        UserDetails details = service.loadUserByUsername("inactive@arooraa.test");

        assertFalse(details.isEnabled());
    }

    @Test
    void throwsForUnknownEmail() {
        when(repository.findByEmail(eq("nobody@arooraa.test"))).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername("nobody@arooraa.test"));
    }
}

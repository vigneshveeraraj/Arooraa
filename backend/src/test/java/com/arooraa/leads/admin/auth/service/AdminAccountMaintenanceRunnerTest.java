package com.arooraa.leads.admin.auth.service;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminAccountMaintenanceRunnerTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void createsANewAdminWhenTheEmailDoesNotExistYet() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);
        when(repository.findByEmail("new-admin@arooraa.test")).thenReturn(Optional.empty());

        AdminAccountMaintenanceRunner runner = new AdminAccountMaintenanceRunner(
                repository, passwordEncoder, "new-admin@arooraa.test", "a-strong-password-123", "New Admin");
        runner.run(null);

        ArgumentCaptor<AdminUser> captor = ArgumentCaptor.forClass(AdminUser.class);
        verify(repository).save(captor.capture());
        AdminUser saved = captor.getValue();
        assertEquals("new-admin@arooraa.test", saved.getEmail());
        assertTrue(passwordEncoder.matches("a-strong-password-123", saved.getPasswordHash()));
    }

    @Test
    void resetsThePasswordOfAnExistingAdminWithoutChangingItsIdentity() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);
        AdminUser existing = new AdminUser("owner@arooraa.test", "$2a$10$old-hash-placeholder-000000000000000000", "Owner");
        String originalHash = existing.getPasswordHash();
        when(repository.findByEmail("owner@arooraa.test")).thenReturn(Optional.of(existing));

        AdminAccountMaintenanceRunner runner = new AdminAccountMaintenanceRunner(
                repository, passwordEncoder, "owner@arooraa.test", "a-new-strong-password-456", "Owner");
        runner.run(null);

        ArgumentCaptor<AdminUser> captor = ArgumentCaptor.forClass(AdminUser.class);
        verify(repository).save(captor.capture());
        AdminUser saved = captor.getValue();
        assertEquals(existing.getId(), saved.getId(), "reset must reuse the existing admin's identity, not create a new one");
        assertNotEquals(originalHash, saved.getPasswordHash());
        assertTrue(passwordEncoder.matches("a-new-strong-password-456", saved.getPasswordHash()));
    }

    @Test
    void doesNotReactivateAnInactiveAdminAsASideEffectOfResettingItsPassword() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);
        AdminUser existing = new AdminUser("inactive@arooraa.test", "$2a$10$old-hash-placeholder-000000000000000000", "Inactive");
        existing.setActive(false);
        when(repository.findByEmail("inactive@arooraa.test")).thenReturn(Optional.of(existing));

        AdminAccountMaintenanceRunner runner = new AdminAccountMaintenanceRunner(
                repository, passwordEncoder, "inactive@arooraa.test", "a-new-strong-password-456", "Inactive");
        runner.run(null);

        ArgumentCaptor<AdminUser> captor = ArgumentCaptor.forClass(AdminUser.class);
        verify(repository).save(captor.capture());
        assertEquals(false, captor.getValue().isActive());
    }

    @Test
    void refusesWhenEmailOrPasswordIsBlank() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);

        new AdminAccountMaintenanceRunner(repository, passwordEncoder, "", "a-strong-password-123", "Admin").run(null);
        new AdminAccountMaintenanceRunner(repository, passwordEncoder, "owner@arooraa.test", "", "Admin").run(null);

        verify(repository, never()).save(any());
        verify(repository, never()).findByEmail(any());
    }

    @Test
    void refusesWhenPasswordIsTooShort() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);

        new AdminAccountMaintenanceRunner(repository, passwordEncoder, "owner@arooraa.test", "short", "Admin").run(null);

        verify(repository, never()).save(any());
    }
}

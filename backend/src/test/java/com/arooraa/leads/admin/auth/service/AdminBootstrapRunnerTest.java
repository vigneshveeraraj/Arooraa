package com.arooraa.leads.admin.auth.service;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminBootstrapRunnerTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void createsAdminWithHashedPasswordWhenTableEmptyAndEnvVarsSet() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);
        when(repository.count()).thenReturn(0L);

        AdminBootstrapRunner runner = new AdminBootstrapRunner(
                repository, passwordEncoder, "owner@arooraa.test", "a-strong-password-123", "Owner");
        runner.run(null);

        ArgumentCaptor<AdminUser> captor = ArgumentCaptor.forClass(AdminUser.class);
        verify(repository).save(captor.capture());
        AdminUser saved = captor.getValue();

        assertEquals("owner@arooraa.test", saved.getEmail());
        assertNotEquals("a-strong-password-123", saved.getPasswordHash());
        assertTrue(passwordEncoder.matches("a-strong-password-123", saved.getPasswordHash()));
    }

    @Test
    void skipsWhenAnAdminAlreadyExists() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);
        when(repository.count()).thenReturn(1L);

        AdminBootstrapRunner runner = new AdminBootstrapRunner(
                repository, passwordEncoder, "owner@arooraa.test", "a-strong-password-123", "Owner");
        runner.run(null);

        verify(repository, never()).save(any());
    }

    @Test
    void skipsWhenEnvVarsAreBlank() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);
        when(repository.count()).thenReturn(0L);

        AdminBootstrapRunner runner = new AdminBootstrapRunner(repository, passwordEncoder, "", "", "Owner");
        runner.run(null);

        verify(repository, never()).save(any());
    }

    @Test
    void skipsWhenPasswordIsTooShort() throws Exception {
        AdminUserRepository repository = mock(AdminUserRepository.class);
        when(repository.count()).thenReturn(0L);

        AdminBootstrapRunner runner = new AdminBootstrapRunner(
                repository, passwordEncoder, "owner@arooraa.test", "short", "Owner");
        runner.run(null);

        verify(repository, never()).save(any());
    }
}

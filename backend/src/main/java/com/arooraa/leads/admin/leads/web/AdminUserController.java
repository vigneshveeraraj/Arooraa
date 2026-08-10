package com.arooraa.leads.admin.leads.web;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import com.arooraa.leads.admin.leads.web.dto.AdminUserSummary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

/** Exposes only active admins, for the assignment dropdown (Part N) — no team/role management here. */
@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final AdminUserRepository adminUserRepository;

    public AdminUserController(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @GetMapping
    public List<AdminUserSummary> activeAdmins() {
        return adminUserRepository.findAll().stream()
                .filter(AdminUser::isActive)
                .sorted(Comparator.comparing(AdminUser::getDisplayName, String.CASE_INSENSITIVE_ORDER))
                .map(a -> new AdminUserSummary(a.getId(), a.getEmail(), a.getDisplayName()))
                .toList();
    }
}

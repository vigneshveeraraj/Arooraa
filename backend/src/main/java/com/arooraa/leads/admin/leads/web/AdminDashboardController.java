package com.arooraa.leads.admin.leads.web;

import com.arooraa.leads.admin.leads.service.AdminDashboardService;
import com.arooraa.leads.admin.leads.web.dto.DashboardSummary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardSummary dashboard(@RequestParam(required = false) String timezone) {
        return dashboardService.dashboard(timezone);
    }
}

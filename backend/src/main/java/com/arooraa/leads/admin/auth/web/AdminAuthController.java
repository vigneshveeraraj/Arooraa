package com.arooraa.leads.admin.auth.web;

import com.arooraa.leads.admin.auth.service.AdminAuthService;
import com.arooraa.leads.admin.auth.web.dto.AdminSessionResponse;
import com.arooraa.leads.admin.auth.web.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

    private final AdminAuthService authService;

    public AdminAuthController(AdminAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AdminSessionResponse> login(@Valid @RequestBody LoginRequest request,
                                                        HttpServletRequest httpRequest,
                                                        HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.login(request.email(), request.password(), httpRequest, httpResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    /** Protected by the security filter chain — reaching this method implies a valid session. */
    @GetMapping("/session")
    public ResponseEntity<AdminSessionResponse> session(Authentication authentication) {
        return ResponseEntity.ok(authService.currentSession(authentication));
    }
}

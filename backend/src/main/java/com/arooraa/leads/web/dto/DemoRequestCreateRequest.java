package com.arooraa.leads.web.dto;

import com.arooraa.leads.domain.OutletCount;
import com.arooraa.leads.domain.PrimaryChallenge;
import com.arooraa.leads.domain.RestaurantType;
import com.arooraa.leads.validation.MustBeBlank;
import com.arooraa.leads.validation.ValidIndianMobile;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DemoRequestCreateRequest(
        @NotBlank @Size(max = 100) String contactName,
        @NotBlank @Size(max = 150) String restaurantName,
        @NotBlank @ValidIndianMobile String whatsappNumber,
        @NotBlank @Size(max = 100) String city,
        @NotNull OutletCount outletCount,
        @NotNull RestaurantType restaurantType,
        @NotNull PrimaryChallenge primaryChallenge,

        @Email @Size(max = 254) String businessEmail,
        @Size(max = 150) String currentSoftware,
        LocalDate preferredDemoDate,
        @Size(max = 50) String preferredDemoTime,
        @Size(max = 2000) String additionalMessage,
        @Size(max = 500) String sourcePage,
        @Size(max = 1000) String referrer,
        @Size(max = 200) String utmSource,
        @Size(max = 200) String utmMedium,
        @Size(max = 200) String utmCampaign,
        @MustBeBlank String website
) {
    public DemoRequestCreateRequest {
        contactName = trim(contactName);
        restaurantName = trim(restaurantName);
        whatsappNumber = trim(whatsappNumber);
        city = trim(city);
        businessEmail = trim(businessEmail);
        currentSoftware = trim(currentSoftware);
        preferredDemoTime = trim(preferredDemoTime);
        additionalMessage = trim(additionalMessage);
        sourcePage = trim(sourcePage);
        referrer = trim(referrer);
        utmSource = trim(utmSource);
        utmMedium = trim(utmMedium);
        utmCampaign = trim(utmCampaign);
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}

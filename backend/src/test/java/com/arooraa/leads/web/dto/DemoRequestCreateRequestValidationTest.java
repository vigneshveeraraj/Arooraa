package com.arooraa.leads.web.dto;

import com.arooraa.leads.domain.OutletCount;
import com.arooraa.leads.domain.PrimaryChallenge;
import com.arooraa.leads.domain.RestaurantType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;

class DemoRequestCreateRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeFactory() {
        factory.close();
    }

    private static DemoRequestCreateRequest valid() {
        return new DemoRequestCreateRequest(
                "Priya Sharma", "Spice Route", "9876543210", "Chennai",
                OutletCount.ONE, RestaurantType.CASUAL_DINING, PrimaryChallenge.BILLING_POS,
                "owner@spiceroute.example", "PaperMenu", null, null, null, null, null, null, null, null, null);
    }

    @Test
    void validRequestHasNoViolations() {
        assertTrue(validator.validate(valid()).isEmpty());
    }

    @Test
    void rejectsBlankContactName() {
        DemoRequestCreateRequest req = withContactName("   ");
        assertHasViolationOn(req, "contactName");
    }

    @Test
    void rejectsBlankRestaurantName() {
        DemoRequestCreateRequest v = valid();
        DemoRequestCreateRequest req = new DemoRequestCreateRequest(
                v.contactName(), "", v.whatsappNumber(), v.city(), v.outletCount(), v.restaurantType(),
                v.primaryChallenge(), v.businessEmail(), v.currentSoftware(), v.preferredDemoDate(),
                v.preferredDemoTime(), v.additionalMessage(), v.sourcePage(), v.referrer(), v.utmSource(),
                v.utmMedium(), v.utmCampaign(), v.website());
        assertHasViolationOn(req, "restaurantName");
    }

    @Test
    void rejectsBlankCity() {
        DemoRequestCreateRequest v = valid();
        DemoRequestCreateRequest req = new DemoRequestCreateRequest(
                v.contactName(), v.restaurantName(), v.whatsappNumber(), "  ", v.outletCount(), v.restaurantType(),
                v.primaryChallenge(), v.businessEmail(), v.currentSoftware(), v.preferredDemoDate(),
                v.preferredDemoTime(), v.additionalMessage(), v.sourcePage(), v.referrer(), v.utmSource(),
                v.utmMedium(), v.utmCampaign(), v.website());
        assertHasViolationOn(req, "city");
    }

    @Test
    void rejectsMissingOutletCount() {
        DemoRequestCreateRequest v = valid();
        DemoRequestCreateRequest req = new DemoRequestCreateRequest(
                v.contactName(), v.restaurantName(), v.whatsappNumber(), v.city(), null, v.restaurantType(),
                v.primaryChallenge(), v.businessEmail(), v.currentSoftware(), v.preferredDemoDate(),
                v.preferredDemoTime(), v.additionalMessage(), v.sourcePage(), v.referrer(), v.utmSource(),
                v.utmMedium(), v.utmCampaign(), v.website());
        assertHasViolationOn(req, "outletCount");
    }

    @Test
    void rejectsInvalidWhatsappNumber() {
        DemoRequestCreateRequest req = withWhatsapp("12345");
        assertHasViolationOn(req, "whatsappNumber");
    }

    @Test
    void acceptsAllSupportedWhatsappFormats() {
        for (String candidate : new String[] {"9876543210", "919876543210", "+919876543210", "+91 98765 43210"}) {
            assertTrue(validator.validate(withWhatsapp(candidate)).isEmpty(), "expected valid: " + candidate);
        }
    }

    @Test
    void rejectsInvalidBusinessEmail() {
        DemoRequestCreateRequest v = valid();
        DemoRequestCreateRequest req = new DemoRequestCreateRequest(
                v.contactName(), v.restaurantName(), v.whatsappNumber(), v.city(), v.outletCount(),
                v.restaurantType(), v.primaryChallenge(), "not-an-email", v.currentSoftware(),
                v.preferredDemoDate(), v.preferredDemoTime(), v.additionalMessage(), v.sourcePage(), v.referrer(),
                v.utmSource(), v.utmMedium(), v.utmCampaign(), v.website());
        assertHasViolationOn(req, "businessEmail");
    }

    @Test
    void rejectsPopulatedHoneypotField() {
        DemoRequestCreateRequest v = valid();
        DemoRequestCreateRequest req = new DemoRequestCreateRequest(
                v.contactName(), v.restaurantName(), v.whatsappNumber(), v.city(), v.outletCount(),
                v.restaurantType(), v.primaryChallenge(), v.businessEmail(), v.currentSoftware(),
                v.preferredDemoDate(), v.preferredDemoTime(), v.additionalMessage(), v.sourcePage(), v.referrer(),
                v.utmSource(), v.utmMedium(), v.utmCampaign(), "http://spam.example");
        assertHasViolationOn(req, "website");
    }

    @Test
    void trimsSurroundingWhitespaceFromTextFields() {
        DemoRequestCreateRequest v = valid();
        DemoRequestCreateRequest req = new DemoRequestCreateRequest(
                "  Priya Sharma  ", v.restaurantName(), v.whatsappNumber(), v.city(), v.outletCount(),
                v.restaurantType(), v.primaryChallenge(), v.businessEmail(), v.currentSoftware(),
                v.preferredDemoDate(), v.preferredDemoTime(), v.additionalMessage(), v.sourcePage(), v.referrer(),
                v.utmSource(), v.utmMedium(), v.utmCampaign(), v.website());
        assertTrue(req.contactName().equals("Priya Sharma"));
    }

    private static DemoRequestCreateRequest withContactName(String contactName) {
        DemoRequestCreateRequest v = valid();
        return new DemoRequestCreateRequest(
                contactName, v.restaurantName(), v.whatsappNumber(), v.city(), v.outletCount(), v.restaurantType(),
                v.primaryChallenge(), v.businessEmail(), v.currentSoftware(), v.preferredDemoDate(),
                v.preferredDemoTime(), v.additionalMessage(), v.sourcePage(), v.referrer(), v.utmSource(),
                v.utmMedium(), v.utmCampaign(), v.website());
    }

    private static DemoRequestCreateRequest withWhatsapp(String whatsappNumber) {
        DemoRequestCreateRequest v = valid();
        return new DemoRequestCreateRequest(
                v.contactName(), v.restaurantName(), whatsappNumber, v.city(), v.outletCount(), v.restaurantType(),
                v.primaryChallenge(), v.businessEmail(), v.currentSoftware(), v.preferredDemoDate(),
                v.preferredDemoTime(), v.additionalMessage(), v.sourcePage(), v.referrer(), v.utmSource(),
                v.utmMedium(), v.utmCampaign(), v.website());
    }

    private static void assertHasViolationOn(DemoRequestCreateRequest request, String propertyName) {
        Set<ConstraintViolation<DemoRequestCreateRequest>> violations = validator.validate(request);
        Set<String> fields = violations.stream()
                .map(v -> v.getPropertyPath().toString())
                .collect(Collectors.toSet());
        assertTrue(fields.contains(propertyName), "expected violation on " + propertyName + " but got " + fields);
    }
}

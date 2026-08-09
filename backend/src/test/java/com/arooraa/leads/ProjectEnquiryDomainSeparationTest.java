package com.arooraa.leads;

import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.domain.OutletCount;
import com.arooraa.leads.domain.PrimaryChallenge;
import com.arooraa.leads.domain.RestaurantType;
import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.Timeline;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Milestone 2B requires the MESA demo-request domain and the AROORAA project-enquiry
 * domain to be completely separate models, not a shared/overloaded entity. This test
 * makes that separation an automated, enforced regression guard rather than just a
 * convention.
 */
class ProjectEnquiryDomainSeparationTest {

    @Test
    void demoRequestHasNoProjectEnquiryFieldTypes() {
        Set<Class<?>> forbidden = Set.of(ServiceType.class, ProjectType.class, BudgetRange.class, Timeline.class);
        assertNoFieldOfTypes(DemoRequest.class, forbidden);
    }

    @Test
    void projectEnquiryHasNoRestaurantFieldTypes() {
        Set<Class<?>> forbidden = Set.of(RestaurantType.class, OutletCount.class, PrimaryChallenge.class);
        assertNoFieldOfTypes(ProjectEnquiry.class, forbidden);
    }

    @Test
    void projectEnquiryDoesNotImportDemoRequestPackage() throws Exception {
        List<Field> fields = List.of(ProjectEnquiry.class.getDeclaredFields());
        for (Field field : fields) {
            assertFalse(field.getType().getPackageName().equals("com.arooraa.leads.domain"),
                    "ProjectEnquiry must not use a type from the MESA demo-request domain package: " + field);
        }
    }

    private static void assertNoFieldOfTypes(Class<?> entityClass, Set<Class<?>> forbiddenTypes) {
        Set<Class<?>> actualTypes = Stream.of(entityClass.getDeclaredFields())
                .map(Field::getType)
                .collect(java.util.stream.Collectors.toSet());
        for (Class<?> forbidden : forbiddenTypes) {
            assertTrue(!actualTypes.contains(forbidden),
                    entityClass.getSimpleName() + " must not declare a field of type " + forbidden.getSimpleName());
        }
    }
}

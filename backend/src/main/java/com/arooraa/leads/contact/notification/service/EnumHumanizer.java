package com.arooraa.leads.contact.notification.service;

/** Small, package-private "SOME_ENUM_VALUE" -> "Some enum value" helper — kept independent of {@code project.notification.support.EnumHumanizer} so Contact has no cross-package dependency. */
final class EnumHumanizer {

    private EnumHumanizer() {
    }

    static String humanize(Enum<?> value) {
        if (value == null) {
            return null;
        }
        String[] words = value.name().split("_");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (result.length() > 0) {
                result.append(' ');
            }
            result.append(word.charAt(0)).append(word.substring(1).toLowerCase());
        }
        return result.toString();
    }
}

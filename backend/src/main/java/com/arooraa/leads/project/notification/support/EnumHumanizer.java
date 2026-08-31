package com.arooraa.leads.project.notification.support;

import java.util.Locale;

/**
 * "NEW_PRODUCT" -> "New Product". A standalone copy of the same small formatting rule
 * AdminLeadQueryService already uses privately for its own display fields — not extracted into
 * a shared utility because W3.2C is scoped to leave /admin untouched (§44), and this is a
 * three-line formatting rule, not logic worth coupling two otherwise-independent call sites to.
 */
public final class EnumHumanizer {

    private EnumHumanizer() {
    }

    public static String humanize(Enum<?> value) {
        return value == null ? null : humanize(value.name());
    }

    public static String humanize(String enumName) {
        if (enumName == null) {
            return null;
        }
        String[] words = enumName.split("_");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (w.isEmpty()) {
                continue;
            }
            if (!sb.isEmpty()) {
                sb.append(' ');
            }
            sb.append(w.substring(0, 1)).append(w.substring(1).toLowerCase(Locale.ROOT));
        }
        return sb.toString();
    }
}

package com.arooraa.leads.contact.notification.template;

import org.springframework.web.util.HtmlUtils;

/** A deliberate near-duplicate of the recruitment/project chrome — kept package-private and independent so Contact has no compile-time dependency on either package. */
final class EmailHtmlChrome {

    private static final String BRAND_COLOR = "#2a359c";
    private static final String TEXT_COLOR = "#1f2430";
    private static final String MUTED_COLOR = "#5b6472";
    private static final String BORDER_COLOR = "#e2e4ea";

    private EmailHtmlChrome() {
    }

    static String wrap(String preheader, String bodyHtml) {
        return """
                <!doctype html>
                <html>
                  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:%s;">
                    <div style="display:none;max-height:0;overflow:hidden;">%s</div>
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:24px 0;">
                      <tr><td align="center">
                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border:1px solid %s;border-radius:8px;overflow:hidden;">
                          <tr>
                            <td style="background-color:%s;padding:20px 28px;">
                              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.03em;">AROORAA</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:28px;font-size:14px;line-height:1.6;">
                              %s
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px 28px;border-top:1px solid %s;">
                              <p style="margin:0;font-size:12px;color:%s;">AROORAA &mdash; Product Engineering &amp; Innovation</p>
                            </td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                  </body>
                </html>
                """.formatted(TEXT_COLOR, esc(preheader), BORDER_COLOR, BRAND_COLOR, bodyHtml, BORDER_COLOR, MUTED_COLOR);
    }

    static String esc(String value) {
        return value == null ? "" : HtmlUtils.htmlEscape(value);
    }

    static String row(String label, String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return """
                <tr>
                  <td style="padding:5px 12px 5px 0;font-size:13px;color:%s;width:170px;vertical-align:top;white-space:nowrap;">%s</td>
                  <td style="padding:5px 0;font-size:13px;color:%s;vertical-align:top;">%s</td>
                </tr>
                """.formatted(MUTED_COLOR, esc(label), TEXT_COLOR, esc(value));
    }

    static String sectionHeading(String text) {
        return """
                <p style="margin:22px 0 8px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:%s;">%s</p>
                """.formatted(MUTED_COLOR, esc(text));
    }

    static String detailsTable(String rowsHtml) {
        if (rowsHtml.isBlank()) {
            return "";
        }
        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">" + rowsHtml + "</table>";
    }
}

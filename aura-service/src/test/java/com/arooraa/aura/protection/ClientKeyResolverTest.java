package com.arooraa.aura.protection;

import com.arooraa.aura.protection.config.ProtectionProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Who a request is counted against — the question with two silent, opposite failure modes.
 *
 * <p>Trust the forwarded header with no proxy in front and every caller picks their own identity,
 * so the limiter counts nothing. Ignore it behind a proxy and every visitor on earth shares one
 * bucket, so the limiter counts nothing useful. Neither shows up as an error, which is why this is
 * configuration rather than a guess.
 */
class ClientKeyResolverTest {

    private static ClientKeyResolver resolver(boolean trustProxyHeaders) {
        return new ClientKeyResolver(new ProtectionProperties(true, trustProxyHeaders, 100,
                null, null, null, null, null, null, null));
    }

    private static MockHttpServletRequest request(String remoteAddr, String forwardedFor) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr(remoteAddr);
        if (forwardedFor != null) request.addHeader("X-Forwarded-For", forwardedFor);
        return request;
    }

    @Test
    void ignoresAHeaderTheCallerCouldHaveInvented() {
        // The default, and the one that matters most: without a proxy in front, this header is a
        // string the caller typed, and honouring it would let one script be a million visitors.
        assertThat(resolver(false).resolve(request("203.0.113.7", "198.51.100.9")))
                .isEqualTo("203.0.113.7");
    }

    @Test
    void usesTheOriginalClientWhenAProxyIsTrusted() {
        assertThat(resolver(true).resolve(request("10.0.0.2", "198.51.100.9")))
                .isEqualTo("198.51.100.9");
    }

    @Test
    void readsTheLeftmostEntryOfAProxyChain() {
        assertThat(resolver(true).resolve(request("10.0.0.2", "198.51.100.9, 10.0.0.1, 10.0.0.2")))
                .isEqualTo("198.51.100.9");
    }

    @Test
    void fallsBackToTheSocketWhenATrustedProxySendsNoHeader() {
        assertThat(resolver(true).resolve(request("10.0.0.2", null))).isEqualTo("10.0.0.2");
        assertThat(resolver(true).resolve(request("10.0.0.2", "   "))).isEqualTo("10.0.0.2");
    }

    @Test
    void refusesToLetAForgedHeaderBecomeAnUnboundedMapKey() {
        // The key is held in the limiter's map until it is evicted, so its length is the caller's
        // choice unless something bounds it. The worst case has to be a shared bucket.
        String enormous = "x".repeat(100_000);

        assertThat(resolver(true).resolve(request("10.0.0.2", enormous)).length())
                .isLessThanOrEqualTo(64);
    }

    @Test
    void alwaysReturnsSomethingToCountAgainst() {
        // A request with no address at all must not become an exemption from rate limiting.
        assertThat(resolver(false).resolve(request(null, null))).isNotBlank();
    }
}

package com.arooraa.leads.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class IpHasherTest {

    @Test
    void sameSecretAndIpProduceDeterministicHash() {
        IpHasher first = new IpHasher("test-secret-one");
        IpHasher second = new IpHasher("test-secret-one");

        assertEquals(first.hash("203.0.113.42"), second.hash("203.0.113.42"));
    }

    @Test
    void differentSecretsProduceDifferentHashes() {
        IpHasher first = new IpHasher("test-secret-one");
        IpHasher second = new IpHasher("test-secret-two");

        assertNotEquals(first.hash("203.0.113.42"), second.hash("203.0.113.42"));
    }

    @Test
    void hashDoesNotContainRawIp() {
        IpHasher hasher = new IpHasher("test-secret-one");
        String hash = hasher.hash("203.0.113.42");

        assertTrue(hash.matches("^[0-9a-f]{64}$"));
        assertNotEquals("203.0.113.42", hash);
    }
}

package com.medikart.common.time;

import static org.assertj.core.api.Assertions.assertThat;

import com.medikart.TestcontainersConfiguration;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.TimeZone;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

/** Server time: UTC clock and HTTP Date header on every response (D1.5-09, D1.7). */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
class ServerTimeTests {

    private static final HttpClient HTTP = HttpClient.newHttpClient();

    @LocalServerPort
    private int port;

    @Autowired
    private Clock clock;

    @Test
    void jvmDefaultTimezoneIsUtc() {
        assertThat(TimeZone.getDefault().toZoneId().normalized()).isEqualTo(ZoneOffset.UTC);
    }

    @Test
    void serverClockIsUtcAtMillisecondPrecision() {
        Instant now = clock.instant();

        assertThat(clock.getZone()).isEqualTo(ZoneOffset.UTC);
        assertThat(now.getNano() % 1_000_000).isZero();
        assertThat(Duration.between(now, Instant.now()).abs()).isLessThan(Duration.ofSeconds(1));
    }

    /** Public endpoint (200, /health since plan 4.11), protected endpoint (401) and unknown path (401). */
    @ParameterizedTest
    @ValueSource(strings = {"/api/v1/health", "/api/v1/users/me", "/actuator/does-not-exist"})
    void everyResponseCarriesTheDateHeader(String path) throws Exception {
        Instant before = clock.instant().minusSeconds(1);

        HttpResponse<Void> response = HTTP.send(
                HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                        .build(),
                HttpResponse.BodyHandlers.discarding());

        String date = response.headers().firstValue("Date").orElseThrow();
        Instant serverTime =
                ZonedDateTime.parse(date, DateTimeFormatter.RFC_1123_DATE_TIME).toInstant();

        assertThat(date).endsWith(" GMT");
        assertThat(serverTime).isBetween(before, clock.instant().plusSeconds(1));
    }
}

package com.medikart.common.error;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/** The error code catalog matches report §10.3. */
class ErrorCodeTests {

    /** Written out from the table of report §10.3 (one entry per code), plus the two additions. */
    private static final Map<String, Integer> EXPECTED = Map.ofEntries(
            Map.entry("UNAUTHENTICATED", 401),
            Map.entry("FORBIDDEN", 403),
            Map.entry("FORBIDDEN_FIELD", 403),
            Map.entry("DOCTOR_ACCOUNT", 403),
            Map.entry("NOT_FOUND", 404),
            Map.entry("VALIDATION_ERROR", 422),
            Map.entry("SLOT_TAKEN", 409),
            Map.entry("OUT_OF_WINDOW", 422),
            Map.entry("SLOT_NOT_IN_SCHEDULE", 422),
            Map.entry("LIMIT_REACHED", 422),
            Map.entry("ONE_PER_DAY", 422),
            Map.entry("DOCTOR_NOT_AVAILABLE", 422),
            Map.entry("CANCEL_TOO_LATE", 422),
            Map.entry("INVALID_TRANSITION", 409),
            Map.entry("NOT_COMPLETED", 422),
            Map.entry("ALREADY_REVIEWED", 409),
            Map.entry("SCHEDULE_CONFLICT", 409),
            Map.entry("EXCEPTION_CONFLICT", 409),
            Map.entry("SLOT_DURATION_LOCKED", 409),
            Map.entry("OVERLAPPING_RANGES", 422),
            Map.entry("CROSSES_MIDNIGHT", 422),
            Map.entry("HAS_UPCOMING_APPOINTMENTS", 409),
            Map.entry("EMAIL_EXISTS", 409),
            Map.entry("ALREADY_ACTIVATED", 409),
            Map.entry("QUERY_TOO_SHORT", 422),
            Map.entry("RANGE_TOO_LARGE", 422),
            Map.entry("FILE_TOO_LARGE", 413),
            Map.entry("UNSUPPORTED_FORMAT", 415),
            Map.entry("RATE_LIMITED", 429),
            Map.entry("APP_VERSION_UNSUPPORTED", 426),
            Map.entry("INTERNAL_ERROR", 500),
            // not in the report: requests refused by Spring MVC before any business rule
            Map.entry("MALFORMED_REQUEST", 400),
            Map.entry("METHOD_NOT_ALLOWED", 405));

    @Test
    void everyCodeOfTheReportHasItsHttpStatus() {
        Map<String, Integer> actual =
                Stream.of(ErrorCode.values()).collect(Collectors.toMap(ErrorCode::name, ErrorCode::httpStatus));

        assertThat(actual).isEqualTo(EXPECTED);
    }
}

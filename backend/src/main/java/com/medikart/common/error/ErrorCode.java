package com.medikart.common.error;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Error code catalog (report §10.3): the {@code code} of every error body, with its HTTP status.
 * Clients translate the code; the message is technical and in English.
 *
 * <p>{@link #MALFORMED_REQUEST} and {@link #METHOD_NOT_ALLOWED} are not in the report: they cover
 * requests that Spring MVC rejects before any business rule runs (unreadable JSON, a badly
 * formatted date or time, wrong HTTP method).
 */
@Schema(enumAsRef = true)
public enum ErrorCode {
    // Authentication and access
    UNAUTHENTICATED(401),
    FORBIDDEN(403),
    FORBIDDEN_FIELD(403),
    DOCTOR_ACCOUNT(403),
    NOT_FOUND(404),

    // Validation
    VALIDATION_ERROR(422),
    QUERY_TOO_SHORT(422),
    RANGE_TOO_LARGE(422),

    // Booking
    SLOT_TAKEN(409),
    OUT_OF_WINDOW(422),
    SLOT_NOT_IN_SCHEDULE(422),
    LIMIT_REACHED(422),
    ONE_PER_DAY(422),
    DOCTOR_NOT_AVAILABLE(422),
    CANCEL_TOO_LATE(422),
    INVALID_TRANSITION(409),

    // Ratings
    NOT_COMPLETED(422),
    ALREADY_REVIEWED(409),

    // Doctor schedule
    SCHEDULE_CONFLICT(409),
    EXCEPTION_CONFLICT(409),
    SLOT_DURATION_LOCKED(409),
    OVERLAPPING_RANGES(422),
    CROSSES_MIDNIGHT(422),

    // Administration
    HAS_UPCOMING_APPOINTMENTS(409),
    EMAIL_EXISTS(409),
    ALREADY_ACTIVATED(409),

    // Files
    FILE_TOO_LARGE(413),
    UNSUPPORTED_FORMAT(415),

    // Platform
    RATE_LIMITED(429),
    APP_VERSION_UNSUPPORTED(426),
    INTERNAL_ERROR(500),

    // Not in the report (see above)
    MALFORMED_REQUEST(400),
    METHOD_NOT_ALLOWED(405);

    private final int httpStatus;

    ErrorCode(int httpStatus) {
        this.httpStatus = httpStatus;
    }

    public int httpStatus() {
        return httpStatus;
    }
}

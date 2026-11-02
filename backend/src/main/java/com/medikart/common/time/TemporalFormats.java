package com.medikart.common.time;

import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;

/**
 * Text formats of the civil temporal types (ERD §1, D1.5-02), shared by the JSON API and the
 * MongoDB storage. Both are strict: a value with another shape is refused, never adjusted.
 *
 * <p>An {@code instant} has no format here: it is a {@link java.time.Instant}, written in ISO-8601
 * UTC with {@code Z} in JSON and stored as a BSON Date.
 */
public final class TemporalFormats {

    /** {@code localDate}: calendar day, {@code YYYY-MM-DD} (e.g. {@code 2026-10-02}). */
    public static final DateTimeFormatter LOCAL_DATE =
            DateTimeFormatter.ofPattern("uuuu-MM-dd").withResolverStyle(ResolverStyle.STRICT);

    /** {@code localTime}: clock time, {@code HH:mm} on 24 hours (e.g. {@code 14:30}). */
    public static final DateTimeFormatter LOCAL_TIME =
            DateTimeFormatter.ofPattern("HH:mm").withResolverStyle(ResolverStyle.STRICT);

    private TemporalFormats() {}
}

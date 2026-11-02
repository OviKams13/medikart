package com.medikart.common.time;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import tools.jackson.databind.JacksonModule;
import tools.jackson.databind.ext.javatime.deser.LocalDateDeserializer;
import tools.jackson.databind.ext.javatime.deser.LocalTimeDeserializer;
import tools.jackson.databind.ext.javatime.ser.LocalDateSerializer;
import tools.jackson.databind.ext.javatime.ser.LocalTimeSerializer;
import tools.jackson.databind.module.SimpleModule;

/**
 * Dates and times of the backend (plan 4.8, report §8.7 and §10.1, ERD §1).
 *
 * <ul>
 *   <li>{@code instant}: {@link java.time.Instant}, JSON {@code 2026-10-02T12:30:00Z}, BSON Date.
 *   <li>{@code localDate}: {@link LocalDate}, JSON and MongoDB string {@code 2026-10-02}.
 *   <li>{@code localTime}: {@link LocalTime}, JSON and MongoDB string {@code 14:30}.
 *   <li>duration: {@code int} with the unit in the field name, no special handling.
 * </ul>
 *
 * <p>The JVM default timezone is set to UTC in {@code MedikartApplication}; nothing here relies
 * on it. The HTTP {@code Date} header (server time, D1.7) is added by Tomcat to every response.
 */
@Configuration(proxyBeanMethods = false)
class TimeConfig {

    /**
     * Server time (D1.5-09): the only source of "now" for server-side rules. UTC, and rounded to
     * the millisecond, the precision of a BSON Date, so that an instant reads back as written.
     */
    @Bean
    Clock clock() {
        return Clock.tick(Clock.systemUTC(), Duration.ofMillis(1));
    }

    /** Strict JSON formats for the civil types; registered by Spring Boot on its JSON mapper. */
    @Bean
    JacksonModule civilTemporalTypesModule() {
        return new SimpleModule("medikart-civil-temporal-types")
                .addSerializer(LocalDate.class, new LocalDateSerializer(TemporalFormats.LOCAL_DATE))
                .addDeserializer(LocalDate.class, new LocalDateDeserializer(TemporalFormats.LOCAL_DATE))
                .addSerializer(LocalTime.class, new LocalTimeSerializer(TemporalFormats.LOCAL_TIME))
                .addDeserializer(LocalTime.class, new LocalTimeDeserializer(TemporalFormats.LOCAL_TIME));
    }

    /** Replaces Spring Boot's default conversions; see {@link MongoTimeConverters}. */
    @Bean
    MongoCustomConversions mongoCustomConversions() {
        return MongoCustomConversions.create(adapter -> adapter.registerConverters(MongoTimeConverters.all()));
    }
}

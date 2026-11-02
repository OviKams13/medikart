package com.medikart.common.time;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;

/**
 * Stores {@code localDate} and {@code localTime} as strings (report §8.7, ERD §1). Without them,
 * Spring Data would turn a {@link LocalDate} or {@link LocalTime} into a BSON Date, that is, into
 * an instant computed with a timezone.
 *
 * <p>{@link java.time.Instant} needs no converter: Spring Data stores it as a BSON Date (UTC,
 * millisecond precision).
 */
final class MongoTimeConverters {

    static List<Converter<?, ?>> all() {
        return List.of(
                LocalDateToString.INSTANCE,
                StringToLocalDate.INSTANCE,
                LocalTimeToString.INSTANCE,
                StringToLocalTime.INSTANCE);
    }

    private MongoTimeConverters() {}

    @WritingConverter
    enum LocalDateToString implements Converter<LocalDate, String> {
        INSTANCE;

        @Override
        public String convert(LocalDate source) {
            return TemporalFormats.LOCAL_DATE.format(source);
        }
    }

    @ReadingConverter
    enum StringToLocalDate implements Converter<String, LocalDate> {
        INSTANCE;

        @Override
        public LocalDate convert(String source) {
            return LocalDate.parse(source, TemporalFormats.LOCAL_DATE);
        }
    }

    @WritingConverter
    enum LocalTimeToString implements Converter<LocalTime, String> {
        INSTANCE;

        @Override
        public String convert(LocalTime source) {
            return TemporalFormats.LOCAL_TIME.format(source);
        }
    }

    @ReadingConverter
    enum StringToLocalTime implements Converter<String, LocalTime> {
        INSTANCE;

        @Override
        public LocalTime convert(String source) {
            return LocalTime.parse(source, TemporalFormats.LOCAL_TIME);
        }
    }
}

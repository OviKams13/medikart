package com.medikart.common.time;

import static org.assertj.core.api.Assertions.assertThat;

import com.medikart.TestcontainersConfiguration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;
import java.util.TimeZone;
import org.bson.Document;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

/** MongoDB storage of the temporal types, on a real MongoDB (report §8.7, ERD §1). */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class TemporalStorageTests {

    private static final String COLLECTION = "temporal_samples";

    /**
     * 23:30 UTC on 2 October is already 3 October in Lubumbashi (UTC+2): the civil date is stored
     * as given, never derived from the instant.
     */
    private static final Sample SAMPLE = new Sample(
            "sample-1",
            Instant.parse("2026-10-02T23:30:00.123Z"),
            LocalDate.of(2026, 10, 3),
            LocalTime.of(1, 30),
            1800);

    record Sample(@Id String id, Instant startAt, LocalDate doctorLocalDate, LocalTime from, int durationSec) {}

    @Autowired
    private MongoTemplate mongoTemplate;

    @AfterEach
    void dropCollection() {
        mongoTemplate.dropCollection(COLLECTION);
    }

    @Test
    void storesEachTypeInItsMongoType() {
        mongoTemplate.insert(SAMPLE, COLLECTION);

        Document raw = rawDocument();

        assertThat(raw.get("startAt")).isInstanceOf(Date.class);
        assertThat(raw.getDate("startAt").getTime()).isEqualTo(SAMPLE.startAt().toEpochMilli());
        assertThat(raw.get("doctorLocalDate")).isEqualTo("2026-10-03");
        assertThat(raw.get("from")).isEqualTo("01:30");
        assertThat(raw.get("durationSec")).isEqualTo(1800);
    }

    @Test
    void readsBackExactlyWhatWasWritten() {
        mongoTemplate.insert(SAMPLE, COLLECTION);

        assertThat(mongoTemplate.findById(SAMPLE.id(), Sample.class, COLLECTION))
                .isEqualTo(SAMPLE);
    }

    @Test
    void queriesCivilDatesAndInstantsWithTheirStoredFormat() {
        mongoTemplate.insert(SAMPLE, COLLECTION);

        Query byDay = Query.query(Criteria.where("doctorLocalDate").is(LocalDate.of(2026, 10, 3)));
        Query byInstantRange = Query.query(Criteria.where("startAt")
                .gte(Instant.parse("2026-10-02T23:00:00Z"))
                .lt(Instant.parse("2026-10-03T00:00:00Z")));

        assertThat(mongoTemplate.find(byDay, Sample.class, COLLECTION)).containsExactly(SAMPLE);
        assertThat(mongoTemplate.find(byInstantRange, Sample.class, COLLECTION)).containsExactly(SAMPLE);
    }

    /** UTC+14, UTC-11 and the two DRC timezones: the stored values never move. */
    @ParameterizedTest
    @ValueSource(strings = {"Pacific/Kiritimati", "Pacific/Pago_Pago", "Africa/Kinshasa", "Africa/Lubumbashi"})
    void doesNotDependOnTheJvmDefaultTimezone(String zone) {
        TimeZone original = TimeZone.getDefault();
        try {
            TimeZone.setDefault(TimeZone.getTimeZone(zone));

            mongoTemplate.insert(SAMPLE, COLLECTION);
            Document raw = rawDocument();

            assertThat(raw.getDate("startAt").getTime())
                    .isEqualTo(SAMPLE.startAt().toEpochMilli());
            assertThat(raw.get("doctorLocalDate")).isEqualTo("2026-10-03");
            assertThat(raw.get("from")).isEqualTo("01:30");
            assertThat(mongoTemplate.findById(SAMPLE.id(), Sample.class, COLLECTION))
                    .isEqualTo(SAMPLE);
        } finally {
            TimeZone.setDefault(original);
        }
    }

    private Document rawDocument() {
        return mongoTemplate.findById(SAMPLE.id(), Document.class, COLLECTION);
    }
}

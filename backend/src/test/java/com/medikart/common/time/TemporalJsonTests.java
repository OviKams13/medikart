package com.medikart.common.time;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.medikart.TestcontainersConfiguration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** JSON format of the temporal types through Spring MVC (report §10.1, ERD §1). */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false) // security is not the subject here
@Import({TestcontainersConfiguration.class, TemporalJsonTests.SampleController.class})
class TemporalJsonTests {

    record Sample(Instant startAt, LocalDate doctorLocalDate, LocalTime from, int durationSec) {}

    @RestController
    static class SampleController {

        @GetMapping("/test/temporal")
        Sample sample() {
            return new Sample(
                    Instant.parse("2026-10-02T12:30:00Z"), LocalDate.of(2026, 10, 2), LocalTime.of(14, 30), 1800);
        }

        @PostMapping("/test/temporal")
        Sample echo(@RequestBody Sample sample) {
            return sample;
        }

        @GetMapping("/test/temporal/params")
        Sample params(@RequestParam LocalDate date, @RequestParam LocalTime time) {
            return new Sample(Instant.parse("2026-10-02T12:30:00Z"), date, time, 0);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void writesEachTypeInItsApiFormat() throws Exception {
        mockMvc.perform(get("/test/temporal"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                        {"startAt":"2026-10-02T12:30:00Z","doctorLocalDate":"2026-10-02",\
                        "from":"14:30","durationSec":1800}""", JsonCompareMode.STRICT))
                // an instant is a string, never a number
                .andExpect(jsonPath("$.startAt").isString());
    }

    @Test
    void readsAndWritesBackTheSameValues() throws Exception {
        String body = """
                {"startAt":"2026-10-02T12:30:00.123Z","doctorLocalDate":"2026-10-03","from":"08:05","durationSec":900}""";

        mockMvc.perform(post("/test/temporal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().json(body, JsonCompareMode.STRICT));
    }

    @Test
    void normalizesAnInstantWithAnOffsetToUtc() throws Exception {
        mockMvc.perform(post("/test/temporal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("2026-10-02T14:30:00+02:00", "2026-10-02", "14:30")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startAt").value("2026-10-02T12:30:00Z"));
    }

    @Test
    void cutsAnInstantToTheMillisecond() throws Exception {
        mockMvc.perform(post("/test/temporal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("2026-10-02T12:30:00.123456789Z", "2026-10-02", "14:30")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startAt").value("2026-10-02T12:30:00.123Z"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"2026-10-02T12:30:00Z", "2026-10-02T12:30:00", "2026-02-30", "2026-10-2", "02/10/2026"})
    void refusesALocalDateInAnotherShape(String localDate) throws Exception {
        mockMvc.perform(post("/test/temporal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("2026-10-02T12:30:00Z", localDate, "14:30")))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {"14:30:00", "24:00", "9:30", "2:30 PM", "2026-10-02T14:30"})
    void refusesALocalTimeInAnotherShape(String localTime) throws Exception {
        mockMvc.perform(post("/test/temporal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("2026-10-02T12:30:00Z", "2026-10-02", localTime)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void readsCivilTypesFromQueryParameters() throws Exception {
        mockMvc.perform(get("/test/temporal/params").param("date", "2026-10-02").param("time", "14:30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorLocalDate").value("2026-10-02"))
                .andExpect(jsonPath("$.from").value("14:30"));
    }

    private static String json(String startAt, String doctorLocalDate, String from) {
        return """
                {"startAt":"%s","doctorLocalDate":"%s","from":"%s","durationSec":0}""".formatted(startAt, doctorLocalDate, from);
    }
}

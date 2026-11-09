package com.medikart.common.error;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.medikart.TestcontainersConfiguration;
import com.medikart.common.trace.TraceIdFilter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * The single error format (report §10.1): {@code { code, message, details, traceId }} on every
 * kind of failure, with the status and code of report §10.3. Security filters are active, so the
 * 401 and 403 answers of Spring Security are checked too.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Import({TestcontainersConfiguration.class, ErrorFormatTests.FailingController.class})
class ErrorFormatTests {

    record Body(@NotBlank String name, @Min(1) int count) {}

    record Slot(Instant startAt, LocalDate doctorLocalDate, LocalTime from) {}

    @RestController
    static class FailingController {

        @GetMapping("/test/errors/business")
        String business() {
            throw new ApiException(
                    ErrorCode.SLOT_TAKEN, "The slot was taken in the meantime", List.of(Map.of("slotId", "abc")));
        }

        @PostMapping("/test/errors/body")
        String body(@Valid @RequestBody Body body) {
            return body.name();
        }

        @PostMapping("/test/errors/slot")
        Slot slot(@RequestBody Slot slot) {
            return slot;
        }

        @GetMapping("/test/errors/size")
        String size(@RequestParam @Min(1) int size) {
            return "ok";
        }

        @GetMapping("/test/errors/date")
        String date(@RequestParam LocalDate date) {
            return date.toString();
        }

        @GetMapping("/test/errors/required")
        String required(@RequestParam String q) {
            return q;
        }

        @GetMapping("/test/errors/boom")
        String boom() {
            throw new IllegalStateException("secret internal detail: db password is hunter2");
        }

        @GetMapping("/test/errors/denied")
        String denied() {
            throw new AccessDeniedException("not yours");
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Test
    void aBusinessErrorKeepsItsCodeStatusAndDetails() throws Exception {
        mockMvc.perform(get("/test/errors/business"))
                .andExpect(status().isConflict())
                .andExpect(header().string("Content-Type", "application/json"))
                .andExpect(jsonPath("$.code").value("SLOT_TAKEN"))
                .andExpect(jsonPath("$.message").value("The slot was taken in the meantime"))
                .andExpect(jsonPath("$.details[0].slotId").value("abc"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void theBodyHasExactlyTheFourFields() throws Exception {
        MvcResult result = mockMvc.perform(get("/test/errors/business")).andReturn();

        JsonNode body = jsonMapper.readTree(result.getResponse().getContentAsString());

        assertThat(body.propertyNames()).containsExactlyInAnyOrder("code", "message", "details", "traceId");
    }

    @Test
    void theTraceIdOfTheBodyIsTheOneOfTheHeader() throws Exception {
        MvcResult result = mockMvc.perform(get("/test/errors/business")).andReturn();

        String header = result.getResponse().getHeader(TraceIdFilter.HEADER);
        JsonNode body = jsonMapper.readTree(result.getResponse().getContentAsString());

        assertThat(header).matches("[0-9a-f]{32}");
        assertThat(body.get("traceId").asString()).isEqualTo(header);
    }

    @Test
    void everyRequestGetsItsOwnTraceIdAndTheOneSentByTheClientIsIgnored() throws Exception {
        String first = mockMvc.perform(get("/test/errors/business").header(TraceIdFilter.HEADER, "forged"))
                .andReturn()
                .getResponse()
                .getHeader(TraceIdFilter.HEADER);
        String second = mockMvc.perform(get("/test/errors/business"))
                .andReturn()
                .getResponse()
                .getHeader(TraceIdFilter.HEADER);

        assertThat(first).isNotEqualTo("forged").isNotEqualTo(second);
    }

    // --- 422 VALIDATION_ERROR -------------------------------------------------------------

    @Test
    void anInvalidFieldIsA422WithTheFieldsInDetails() throws Exception {
        mockMvc.perform(post("/test/errors/body")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"count\":0}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details[?(@.field=='name')]").isNotEmpty())
                .andExpect(jsonPath("$.details[?(@.field=='count')]").isNotEmpty())
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void aConstraintOnAParameterIsA422WithTheParameterInDetails() throws Exception {
        mockMvc.perform(get("/test/errors/size").param("size", "0"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details[0].field").value("size"));
    }

    // --- 400 MALFORMED_REQUEST: dates and times (left open at 4.8) --------------------------

    @ParameterizedTest
    @CsvSource(
            delimiter = '|',
            value = {
                "doctorLocalDate | 2026-02-30            | Expected a date formatted YYYY-MM-DD",
                "doctorLocalDate | 2026-10-02T12:30:00Z  | Expected a date formatted YYYY-MM-DD",
                "doctorLocalDate | 02/10/2026            | Expected a date formatted YYYY-MM-DD",
                "from            | 14:30:00              | Expected a time formatted HH:mm",
                "from            | 24:00                 | Expected a time formatted HH:mm",
                "from            | 2:30 PM               | Expected a time formatted HH:mm",
                "startAt         | tomorrow              | Expected an ISO-8601 instant, e.g. 2026-10-02T12:30:00Z",
            })
    void aBadlyFormattedDateOrTimeInTheBodyIsA400WithTheField(String field, String value, String expected)
            throws Exception {
        Map<String, String> sample = new java.util.LinkedHashMap<>(
                Map.of("startAt", "2026-10-02T12:30:00Z", "doctorLocalDate", "2026-10-02", "from", "14:30"));
        sample.put(field, value);

        mockMvc.perform(post("/test/errors/slot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(sample)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
                .andExpect(jsonPath("$.message").value("Malformed request body"))
                .andExpect(jsonPath("$.details[0].field").value(field))
                .andExpect(jsonPath("$.details[0].message").value(expected))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void theRefusedValueIsNeverEchoedBack() throws Exception {
        MvcResult result = mockMvc.perform(post("/test/errors/slot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"doctorLocalDate\":\"secret-value-123\"}"))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertThat(result.getResponse().getContentAsString()).doesNotContain("secret-value-123");
    }

    @Test
    void aBadlyFormattedDateInAQueryParameterIsA400WithTheParameter() throws Exception {
        mockMvc.perform(get("/test/errors/date").param("date", "2026-02-30"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
                .andExpect(jsonPath("$.details[0].field").value("date"))
                .andExpect(jsonPath("$.details[0].message").value("Expected a date formatted YYYY-MM-DD"));
    }

    @Test
    void brokenJsonIsA400WithoutDetails() throws Exception {
        mockMvc.perform(post("/test/errors/slot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void aMissingRequestBodyIsA400() throws Exception {
        mockMvc.perform(post("/test/errors/slot").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }

    @Test
    void aMissingRequiredParameterIsA400WithTheParameter() throws Exception {
        mockMvc.perform(get("/test/errors/required"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
                .andExpect(jsonPath("$.details[0].field").value("q"));
    }

    // --- Other errors raised by Spring MVC --------------------------------------------------

    @Test
    void anUnknownRouteIsA404() throws Exception {
        mockMvc.perform(get("/test/errors/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void aWrongHttpMethodIsA405() throws Exception {
        mockMvc.perform(post("/test/errors/business"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
    }

    @Test
    void anUnsupportedContentTypeIsA415() throws Exception {
        mockMvc.perform(post("/test/errors/slot")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("x"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("UNSUPPORTED_FORMAT"));
    }

    // --- 500 INTERNAL_ERROR -----------------------------------------------------------------

    @Test
    void anUnexpectedExceptionIsA500WithAFixedMessageAndNoLeak() throws Exception {
        MvcResult result = mockMvc.perform(get("/test/errors/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("Internal server error"))
                .andExpect(jsonPath("$.details").isEmpty())
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andReturn();

        assertThat(result.getResponse().getContentAsString())
                .doesNotContain("hunter2")
                .doesNotContain("IllegalStateException")
                .doesNotContain("at com.medikart");
    }

    // --- 401 and 403 (Spring Security) ------------------------------------------------------

    @Test
    @WithAnonymousUser
    void noTokenIsA401InTheSingleFormat() throws Exception {
        mockMvc.perform(get("/test/errors/business"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("WWW-Authenticate", "Bearer"))
                .andExpect(header().string("Content-Type", "application/json"))
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.details").isEmpty())
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    @WithAnonymousUser
    void anInvalidTokenIsA401InTheSingleFormat() throws Exception {
        mockMvc.perform(get("/test/errors/business").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void aDeniedAccessInsideMvcIsA403InTheSingleFormat() throws Exception {
        mockMvc.perform(get("/test/errors/denied"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message").value("Access denied"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }
}

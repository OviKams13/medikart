package com.medikart.common.system;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.medikart.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;

/**
 * {@code /health} answers 503 {@code DOWN} when one health check fails (e.g. MongoDB unreachable),
 * and does not leak the reason: the details of the failing check stay out of the body.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import({TestcontainersConfiguration.class, HealthDownTests.FailingCheck.class})
class HealthDownTests {

    @TestConfiguration(proxyBeanMethods = false)
    static class FailingCheck {

        @Bean
        HealthIndicator failing() {
            return () -> Health.down()
                    .withDetail("secret", "mongodb.internal.host:27017")
                    .build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthIs503WhenACheckFailsAndHidesTheDetails() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().json("{\"status\":\"DOWN\"}", JsonCompareMode.STRICT));
    }
}

package com.medikart.common.system;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.medikart.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;

/**
 * {@code /health} and {@code /app-config} are public (report §10.1 and §10.2); everything else
 * still needs a token. No request below carries an {@code Authorization} header, and the
 * security filters are on.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class PublicEndpointsTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthIsPublicAndOnlyTellsTheStatus() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"status\":\"UP\"}", JsonCompareMode.STRICT));
    }

    @Test
    void appConfigIsPublicWithTheDefaultConfiguration() throws Exception {
        mockMvc.perform(get("/api/v1/app-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minimumVersion").value("0.0.1"))
                // not configured yet: null, not an invented value
                .andExpect(jsonPath("$.legalLinks.privacyPolicyUrl").isEmpty())
                .andExpect(jsonPath("$.legalLinks.termsOfServiceUrl").isEmpty())
                .andExpect(jsonPath("$.support.email").isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/v1/users/me", "/api/v1/doctors", "/actuator/health", "/api/v1/health/details"})
    void everyOtherRouteStillNeedsAToken(String path) throws Exception {
        mockMvc.perform(get(path))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void onlyGetIsPublic() throws Exception {
        mockMvc.perform(post("/api/v1/health")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/app-config")).andExpect(status().isUnauthorized());
    }
}

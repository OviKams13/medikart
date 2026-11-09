package com.medikart.common.system;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.medikart.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;

/** {@code /app-config} returns what the configuration says: nothing is written in the code. */
@SpringBootTest(
        properties = {
            "medikart.app-config.minimum-version=2.5.1",
            "medikart.app-config.privacy-policy-url=https://medikart.example/privacy",
            "medikart.app-config.terms-of-service-url=https://medikart.example/terms",
            "medikart.app-config.support-email=help@medikart.example",
        })
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AppConfigValuesTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsTheConfiguredValues() throws Exception {
        mockMvc.perform(get("/api/v1/app-config"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                        {"minimumVersion":"2.5.1",
                         "legalLinks":{"privacyPolicyUrl":"https://medikart.example/privacy",
                                       "termsOfServiceUrl":"https://medikart.example/terms"},
                         "support":{"email":"help@medikart.example"}}""", JsonCompareMode.STRICT));
    }
}

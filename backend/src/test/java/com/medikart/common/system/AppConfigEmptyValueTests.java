package com.medikart.common.system;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.medikart.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

/** An empty line in backend/.env (e.g. {@code MEDIKART_APPCONFIG_SUPPORTEMAIL=}) means "not set". */
@SpringBootTest(
        properties = {
            "medikart.app-config.privacy-policy-url=",
            "medikart.app-config.terms-of-service-url=",
            "medikart.app-config.support-email=",
        })
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AppConfigEmptyValueTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void anEmptyValueIsReturnedAsNull() throws Exception {
        mockMvc.perform(get("/api/v1/app-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.legalLinks.privacyPolicyUrl").value((Object) null))
                .andExpect(jsonPath("$.legalLinks.termsOfServiceUrl").value((Object) null))
                .andExpect(jsonPath("$.support.email").value((Object) null));
    }
}

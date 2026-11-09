package com.medikart.common.openapi;

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

/** In production both switches are off: the documentation is neither served nor public. */
@SpringBootTest(properties = {"springdoc.api-docs.enabled=false", "springdoc.swagger-ui.enabled=false"})
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class OpenApiDisabledTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void theDocumentationIsNotPublic() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
        mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isUnauthorized());
    }
}

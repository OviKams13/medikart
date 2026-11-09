package com.medikart.common.openapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.startsWith;
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
import org.springframework.test.web.servlet.MvcResult;

/** Automatic API documentation (plan 4.10): the OpenAPI document and Swagger UI, enabled (dev). */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class OpenApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void theOpenApiDocumentIsPublicAndDescribesTheApi() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").value(startsWith("3.")))
                .andExpect(jsonPath("$.info.title").value("Medikart API"))
                // the Maven version, filtered into application.properties at build time
                .andExpect(jsonPath("$.info.version").value(matchesPattern("\\d+\\.\\d+\\.\\d+.*")))
                .andExpect(jsonPath("$.paths['/api/v1/health'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/app-config'].get").exists());
    }

    @Test
    void everyRouteNeedsTheBearerTokenExceptThePublicOnes() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(
                        jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme")
                        .value("bearer"))
                .andExpect(jsonPath("$.security[0].bearerAuth").exists())
                // public routes override the global requirement with an empty one
                .andExpect(jsonPath("$.paths['/api/v1/health'].get.security").isEmpty())
                .andExpect(
                        jsonPath("$.paths['/api/v1/app-config'].get.security").isEmpty());
    }

    @Test
    void theErrorBodyAndTheCatalogOfCodesAreInTheDocument() throws Exception {
        MvcResult result = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(jsonPath("$.components.schemas.ApiError.properties.code")
                        .exists())
                .andExpect(jsonPath("$.components.schemas.ApiError.properties.message")
                        .exists())
                .andExpect(jsonPath("$.components.schemas.ApiError.properties.details")
                        .exists())
                .andExpect(jsonPath("$.components.schemas.ApiError.properties.traceId")
                        .exists())
                .andReturn();

        // the codes are an enum, so the generated client types (plan 4.15) are a union of codes
        assertThat(result.getResponse().getContentAsString())
                .contains("SLOT_TAKEN", "UNAUTHENTICATED", "MALFORMED_REQUEST", "INTERNAL_ERROR");
    }

    @Test
    void swaggerUiIsServed() throws Exception {
        mockMvc.perform(get("/swagger-ui.html")).andExpect(status().is3xxRedirection());
        mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
    }
}

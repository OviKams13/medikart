package com.medikart.common.openapi;

import com.medikart.common.error.ApiError;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Automatic API documentation (plan 4.10, report §10.1: "Generated OpenAPI; client types generated
 * from it"). springdoc reads the controllers and serves the OpenAPI 3 document at
 * {@code /v3/api-docs} and Swagger UI at {@code /swagger-ui.html}. The shared package generates
 * the client types from this document (plan 4.15).
 *
 * <p>Here: the title and version, the bearer token that every route needs except the public ones
 * (those use {@code @SecurityRequirements}), and the {@link ApiError} body, which no controller
 * returns directly but every route can answer.
 */
@Configuration(proxyBeanMethods = false)
class OpenApiConfig {

    static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    OpenAPI medikartOpenApi(@Value("${medikart.api.version:unknown}") String version) {
        return new OpenAPI()
                .info(new Info()
                        .title("Medikart API")
                        .version(version)
                        .description("REST API of Medikart. Errors use the single format"
                                + " { code, message, details, traceId } (schema ApiError)."))
                .components(new Components()
                        .addSecuritySchemes(
                                BEARER_SCHEME,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("Firebase ID token")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME));
    }

    /** Adds {@code ApiError} (and its {@code ErrorCode} enum) to the schemas of the document. */
    @Bean
    OpenApiCustomizer errorSchemas() {
        return openApi -> ModelConverters.getInstance()
                .readAll(ApiError.class)
                .forEach((name, schema) -> openApi.getComponents().addSchemas(name, schema));
    }
}

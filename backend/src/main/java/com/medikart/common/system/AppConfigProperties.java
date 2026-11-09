package com.medikart.common.system;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Values returned by {@code GET /api/v1/app-config} (report §10.2), read from the configuration
 * ({@code medikart.app-config.*}): {@code application.properties}, {@code backend/.env} or
 * environment variables. Nothing is written in the code, so each environment (dev, staging, prod)
 * has its own values. A wrong value stops the startup.
 *
 * @param minimumVersion oldest mobile app version still accepted, {@code MAJOR.MINOR.PATCH}
 * @param privacyPolicyUrl link to the privacy policy ({@code https}), empty until it exists
 * @param termsOfServiceUrl link to the terms of service ({@code https}), empty until it exists
 * @param supportEmail contact address shown in the app, empty until it exists
 */
@Validated
@ConfigurationProperties("medikart.app-config")
record AppConfigProperties(
        @NotBlank @Pattern(regexp = "\\d+\\.\\d+\\.\\d+", message = "must look like 1.2.3")
        String minimumVersion,

        @Pattern(regexp = "(https://\\S+)?", message = "must be an https URL")
        String privacyPolicyUrl,

        @Pattern(regexp = "(https://\\S+)?", message = "must be an https URL")
        String termsOfServiceUrl,

        @Email String supportEmail) {}

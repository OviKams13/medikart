package com.medikart.common.system;

import com.medikart.common.ApiPaths;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code GET /api/v1/app-config} (report §10.2): public, read before the user signs in. Tells the
 * app the minimum version it must run, where the legal pages are and how to reach support.
 * Every value comes from {@link AppConfigProperties}. A value that is not configured is
 * {@code null}.
 */
@RestController
@RequestMapping(ApiPaths.BASE)
class AppConfigController {

    record AppConfigResponse(String minimumVersion, LegalLinks legalLinks, Support support) {

        record LegalLinks(String privacyPolicyUrl, String termsOfServiceUrl) {}

        record Support(String email) {}
    }

    private final AppConfigProperties properties;

    AppConfigController(AppConfigProperties properties) {
        this.properties = properties;
    }

    @GetMapping("/app-config")
    @Operation(
            summary = "Application configuration",
            description =
                    "Public. Minimum app version, legal links and support contact, from the server configuration.")
    @SecurityRequirements // public: no bearer token
    AppConfigResponse appConfig() {
        return new AppConfigResponse(
                properties.minimumVersion(),
                new AppConfigResponse.LegalLinks(
                        blankToNull(properties.privacyPolicyUrl()), blankToNull(properties.termsOfServiceUrl())),
                new AppConfigResponse.Support(blankToNull(properties.supportEmail())));
    }

    private static String blankToNull(String value) {
        return StringUtils.hasText(value) ? value : null;
    }
}

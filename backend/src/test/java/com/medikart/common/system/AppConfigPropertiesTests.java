package com.medikart.common.system;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

/** A wrong {@code medikart.app-config.*} value stops the startup instead of reaching the clients. */
class AppConfigPropertiesTests {

    @EnableConfigurationProperties(AppConfigProperties.class)
    static class PropertiesOnly {}

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(PropertiesOnly.class)
            .withPropertyValues("medikart.app-config.minimum-version=1.0.0");

    @Test
    void aValidConfigurationStarts() {
        runner.withPropertyValues(
                        "medikart.app-config.privacy-policy-url=https://medikart.example/privacy",
                        "medikart.app-config.support-email=help@medikart.example")
                .run(context -> assertThat(context).hasNotFailed());
    }

    @Test
    void theMinimumVersionIsRequired() {
        new ApplicationContextRunner()
                .withUserConfiguration(PropertiesOnly.class)
                .run(context -> assertThat(context).hasFailed());
    }

    @Test
    void aMinimumVersionThatIsNotAVersionStopsTheStartup() {
        runner.withPropertyValues("medikart.app-config.minimum-version=latest")
                .run(context -> assertThat(context).hasFailed());
    }

    @Test
    void aLegalLinkMustBeHttps() {
        runner.withPropertyValues("medikart.app-config.terms-of-service-url=http://medikart.example/terms")
                .run(context -> assertThat(context).hasFailed());
    }

    @Test
    void theSupportEmailMustBeAnEmail() {
        runner.withPropertyValues("medikart.app-config.support-email=not-an-email")
                .run(context -> assertThat(context).hasFailed());
    }
}

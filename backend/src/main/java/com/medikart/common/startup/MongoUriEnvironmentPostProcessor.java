package com.medikart.common.startup;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Profiles;
import org.springframework.util.StringUtils;

/**
 * Stops the startup with a clear message when the {@code atlas} profile has no
 * {@code MONGODB_URI} (plan 4.9). Without this check, the MongoDB driver fails later with
 * "Connection strings must start with either 'mongodb://' or 'mongodb+srv://'", which does not say
 * what to do.
 *
 * <p>It runs after the configuration files (including {@code backend/.env}) are loaded. Only the
 * presence of the variable is checked; its value is never read into a message or a log.
 * Registered in {@code META-INF/spring.factories}.
 */
public class MongoUriEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    static final String ATLAS_PROFILE = "atlas";
    static final String VARIABLE = "MONGODB_URI";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (environment.acceptsProfiles(Profiles.of(ATLAS_PROFILE))
                && !StringUtils.hasText(environment.getProperty(VARIABLE))) {
            throw new MissingMongoUriException();
        }
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE; // after ConfigDataEnvironmentPostProcessor
    }
}

package com.medikart.common.startup;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.diagnostics.FailureAnalysis;
import org.springframework.mock.env.MockEnvironment;

/**
 * Clear startup error when the {@code atlas} profile has no {@code MONGODB_URI} (plan 4.9).
 * Tested on a mock environment: a full startup would read the developer's real {@code .env}.
 */
class MongoUriCheckTests {

    private final MongoUriEnvironmentPostProcessor check = new MongoUriEnvironmentPostProcessor();
    private final SpringApplication application = new SpringApplication();

    @Test
    void atlasWithoutTheVariableStopsTheStartup() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("atlas");

        assertThatThrownBy(() -> check.postProcessEnvironment(environment, application))
                .isInstanceOf(MissingMongoUriException.class);
    }

    @Test
    void atlasWithABlankVariableStopsTheStartup() {
        MockEnvironment environment = new MockEnvironment().withProperty("MONGODB_URI", "   ");
        environment.setActiveProfiles("atlas");

        assertThatThrownBy(() -> check.postProcessEnvironment(environment, application))
                .isInstanceOf(MissingMongoUriException.class);
    }

    @Test
    void atlasWithTheVariableStarts() {
        MockEnvironment environment = new MockEnvironment().withProperty("MONGODB_URI", "mongodb://host/db");
        environment.setActiveProfiles("atlas");

        assertThatCode(() -> check.postProcessEnvironment(environment, application))
                .doesNotThrowAnyException();
    }

    @Test
    void withoutTheAtlasProfileTheVariableIsNotNeeded() {
        MockEnvironment environment = new MockEnvironment();

        assertThatCode(() -> check.postProcessEnvironment(environment, application))
                .doesNotThrowAnyException();
    }

    @Test
    void anotherProfileDoesNotNeedTheVariable() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("staging");

        assertThatCode(() -> check.postProcessEnvironment(environment, application))
                .doesNotThrowAnyException();
    }

    @Test
    void theFailureTellsWhatToDoAndNeverPrintsAValue() {
        FailureAnalysis analysis = new MissingMongoUriFailureAnalyzer()
                .analyze(new IllegalStateException("startup failed", new MissingMongoUriException()));

        assertThat(analysis).isNotNull();
        assertThat(analysis.getDescription()).contains("atlas").contains("MONGODB_URI");
        assertThat(analysis.getAction()).contains("backend/.env").contains("environment variable");
    }

    @Test
    void anotherFailureIsNotAnalyzed() {
        assertThat(new MissingMongoUriFailureAnalyzer().analyze(new IllegalStateException("other")))
                .isNull();
    }
}

package com.medikart.common.startup;

import org.springframework.boot.diagnostics.AbstractFailureAnalyzer;
import org.springframework.boot.diagnostics.FailureAnalysis;

/** Prints the startup failure of {@link MissingMongoUriException} as a short description and action. */
class MissingMongoUriFailureAnalyzer extends AbstractFailureAnalyzer<MissingMongoUriException> {

    @Override
    protected FailureAnalysis analyze(Throwable rootFailure, MissingMongoUriException cause) {
        return new FailureAnalysis(
                "The 'atlas' profile is active, but the MONGODB_URI variable is missing or empty.",
                "Set MONGODB_URI in backend/.env (template: backend/.env.example) or as an environment variable,"
                        + " and start the backend from the backend/ folder."
                        + " Or start without the 'atlas' profile to use the local Docker database.",
                cause);
    }
}

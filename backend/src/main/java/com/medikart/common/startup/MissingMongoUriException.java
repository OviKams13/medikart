package com.medikart.common.startup;

/** The {@code atlas} profile is active but {@code MONGODB_URI} is missing or blank. */
public class MissingMongoUriException extends RuntimeException {

    public MissingMongoUriException() {
        super("The 'atlas' profile is active but MONGODB_URI is not set");
    }
}

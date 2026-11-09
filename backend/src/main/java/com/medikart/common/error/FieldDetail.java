package com.medikart.common.error;

/** One entry of {@code details} for a field or a parameter that was refused. */
public record FieldDetail(String field, String message) {}

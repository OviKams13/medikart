package com.medikart.common.error;

import io.swagger.v3.oas.annotations.media.Schema;

/** One entry of {@code details} for a field or a parameter that was refused. */
public record FieldDetail(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String field,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String message) {}

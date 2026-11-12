package com.medikart.common.error;

import com.medikart.common.trace.TraceIdFilter;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * The single error body of the API (report §10.1): {@code { code, message, details, traceId }}.
 *
 * @param code error code from the catalog, translated by the clients
 * @param message technical message, in English
 * @param details never null, documented as {@link FieldDetail} (the only kind so far): the refused fields (validation) or the affected items (conflicts)
 * @param traceId identifier of the request, also in the {@code X-Trace-Id} header and in the logs
 */
public record ApiError(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ErrorCode code,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String message,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<Object> details,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String traceId) {

    public static ApiError of(ErrorCode code, String message, List<?> details) {
        return new ApiError(code, message, List.copyOf(details), TraceIdFilter.current());
    }
}

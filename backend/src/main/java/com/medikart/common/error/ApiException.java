package com.medikart.common.error;

import java.util.List;

/** A business error, thrown by any layer and turned into the error body by the handler. */
public class ApiException extends RuntimeException {

    private final ErrorCode code;
    private final List<Object> details;

    public ApiException(ErrorCode code, String message) {
        this(code, message, List.of());
    }

    public ApiException(ErrorCode code, String message, List<?> details) {
        super(message);
        this.code = code;
        this.details = List.copyOf(details);
    }

    public ErrorCode code() {
        return code;
    }

    public List<Object> details() {
        return details;
    }
}

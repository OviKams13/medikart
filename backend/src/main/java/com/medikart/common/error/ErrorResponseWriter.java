package com.medikart.common.error;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/** Writes the error body outside Spring MVC (security filters), where the handler is not reached. */
@Component
public class ErrorResponseWriter {

    private final JsonMapper jsonMapper;

    ErrorResponseWriter(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    public void write(HttpServletResponse response, ErrorCode code, String message) throws IOException {
        response.setStatus(code.httpStatus());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // JSON is UTF-8 by definition: write the bytes, as the MVC converter does
        response.getOutputStream().write(jsonMapper.writeValueAsBytes(ApiError.of(code, message, List.of())));
    }
}

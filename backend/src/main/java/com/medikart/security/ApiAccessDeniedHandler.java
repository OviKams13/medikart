package com.medikart.security;

import com.medikart.common.error.ErrorCode;
import com.medikart.common.error.ErrorResponseWriter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

/** 403 {@code FORBIDDEN} in the single error format (report §10.3). */
@Component
class ApiAccessDeniedHandler implements AccessDeniedHandler {

    private final ErrorResponseWriter writer;

    ApiAccessDeniedHandler(ErrorResponseWriter writer) {
        this.writer = writer;
    }

    @Override
    public void handle(
            HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException {
        writer.write(response, ErrorCode.FORBIDDEN, "Access denied");
    }
}

package com.medikart.security;

import com.medikart.common.error.ErrorCode;
import com.medikart.common.error.ErrorResponseWriter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/** 401 {@code UNAUTHENTICATED} in the single error format (report §10.3). */
@Component
class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ErrorResponseWriter writer;

    ApiAuthenticationEntryPoint(ErrorResponseWriter writer) {
        this.writer = writer;
    }

    @Override
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        writer.write(response, ErrorCode.UNAUTHENTICATED, "Missing, expired or invalid token");
    }
}

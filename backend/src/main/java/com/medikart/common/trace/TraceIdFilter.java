package com.medikart.common.trace;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Gives every request a {@code traceId} (report §10.1): put in the logs (MDC), returned in the
 * {@code X-Trace-Id} header and in the body of every error. It runs before Spring Security, so
 * that 401 and 403 answers have one too.
 *
 * <p>An identifier sent by the client is ignored: the server alone chooses it, so a log line can
 * be trusted and a client cannot forge one.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Trace-Id";
    public static final String MDC_KEY = "traceId";

    /** The traceId of the current request; a fresh one outside a request (async code, unit tests). */
    public static String current() {
        String traceId = MDC.get(MDC_KEY);
        return traceId != null ? traceId : newTraceId();
    }

    private static String newTraceId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String traceId = newTraceId();
        MDC.put(MDC_KEY, traceId);
        response.setHeader(HEADER, traceId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}

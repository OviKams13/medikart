package com.medikart.common.error;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.validation.method.ParameterErrors;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.exc.MismatchedInputException;

/**
 * Turns every exception of the MVC layer into the single error body (report §10.1 and §10.3).
 *
 * <p>Rules:
 *
 * <ul>
 *   <li>A business error ({@link ApiException}) keeps its own code and status.
 *   <li>A refused field is 422 {@code VALIDATION_ERROR}, with the fields in {@code details}.
 *   <li>A request that cannot be read (broken JSON, a date or time in the wrong format, a missing
 *       or unreadable parameter) is 400 {@code MALFORMED_REQUEST}. The field is in {@code details}
 *       when it is known.
 *   <li>Anything unexpected is 500 {@code INTERNAL_ERROR} with a fixed message: no exception text,
 *       no stack trace and no class name leave the server. The stack trace goes to the log, with
 *       the {@code traceId}.
 * </ul>
 */
@RestControllerAdvice
class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Object> handleApiException(ApiException ex) {
        return respond(ex.code(), ex.getMessage(), ex.details());
    }

    /** Validation of a service or method argument ({@code @Validated}). */
    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<Object> handleConstraintViolation(ConstraintViolationException ex) {
        List<FieldDetail> details = new ArrayList<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            details.add(new FieldDetail(violation.getPropertyPath().toString(), violation.getMessage()));
        }
        return respond(ErrorCode.VALIDATION_ERROR, "Validation failed", details);
    }

    /**
     * Method security ({@code @PreAuthorize}) throws these inside MVC, where the security filters
     * no longer see them.
     */
    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex) {
        return respond(ErrorCode.FORBIDDEN, "Access denied", List.of());
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<Object> handleAuthentication(AuthenticationException ex) {
        return respond(ErrorCode.UNAUTHENTICATED, "Missing, expired or invalid token", List.of());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return respond(ErrorCode.INTERNAL_ERROR, "Internal server error", List.of());
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<FieldDetail> details = new ArrayList<>();
        for (ObjectError error : ex.getBindingResult().getAllErrors()) {
            String field = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
            details.add(new FieldDetail(field, error.getDefaultMessage()));
        }
        return respond(ErrorCode.VALIDATION_ERROR, "Validation failed", details);
    }

    /** Constraints on controller parameters ({@code @RequestParam @Min ...}, Spring 6.1+). */
    @Override
    protected ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<FieldDetail> details = new ArrayList<>();
        ex.getParameterValidationResults().forEach(result -> {
            String parameter = result.getMethodParameter().getParameterName();
            if (result instanceof ParameterErrors errors) {
                errors.getFieldErrors()
                        .forEach(error -> details.add(new FieldDetail(error.getField(), error.getDefaultMessage())));
            } else {
                result.getResolvableErrors()
                        .forEach(error -> details.add(new FieldDetail(
                                parameter != null ? parameter : "parameter", error.getDefaultMessage())));
            }
        });
        return respond(ErrorCode.VALIDATION_ERROR, "Validation failed", details);
    }

    /** Broken JSON, or a value that does not fit its type (a date or time in the wrong format). */
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<FieldDetail> details = new ArrayList<>();
        if (ex.getCause() instanceof JacksonException jackson
                && !jackson.getPath().isEmpty()) {
            Class<?> target =
                    jackson instanceof MismatchedInputException mismatched ? mismatched.getTargetType() : null;
            details.add(new FieldDetail(fieldPath(jackson), expectation(target)));
        }
        return respond(ErrorCode.MALFORMED_REQUEST, "Malformed request body", details);
    }

    /** A query or path parameter that does not fit its type, e.g. {@code ?date=2026-02-30}. */
    @Override
    protected ResponseEntity<Object> handleTypeMismatch(
            TypeMismatchException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String name =
                ex instanceof MethodArgumentTypeMismatchException mismatch ? mismatch.getName() : ex.getPropertyName();
        FieldDetail detail = new FieldDetail(name, expectation(ex.getRequiredType()));
        return respond(ErrorCode.MALFORMED_REQUEST, "Malformed request parameter", List.of(detail));
    }

    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        FieldDetail detail = new FieldDetail(ex.getParameterName(), "Required parameter is missing");
        return respond(ErrorCode.MALFORMED_REQUEST, "Missing request parameter", List.of(detail));
    }

    /**
     * Every other exception Spring MVC knows (404, 405, 406, 413, 415 ...): the status chosen by
     * Spring is kept, the body is ours.
     */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        ErrorCode code = codeFor(statusCode.value());
        String message = statusCode.is5xxServerError() ? "Internal server error" : ex.getMessage();
        if (statusCode.is5xxServerError()) {
            log.error("Unhandled MVC exception", ex);
        }
        return ResponseEntity.status(statusCode)
                .headers(headers)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiError.of(code, message != null ? message : "Request failed", List.of()));
    }

    private static ResponseEntity<Object> respond(ErrorCode code, String message, List<?> details) {
        return ResponseEntity.status(code.httpStatus())
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiError.of(code, message, details));
    }

    private static ErrorCode codeFor(int status) {
        return switch (status) {
            case 400 -> ErrorCode.MALFORMED_REQUEST;
            case 401 -> ErrorCode.UNAUTHENTICATED;
            case 403 -> ErrorCode.FORBIDDEN;
            case 404 -> ErrorCode.NOT_FOUND;
            case 405 -> ErrorCode.METHOD_NOT_ALLOWED;
            case 413 -> ErrorCode.FILE_TOO_LARGE;
            case 415 -> ErrorCode.UNSUPPORTED_FORMAT;
            case 422 -> ErrorCode.VALIDATION_ERROR;
            case 429 -> ErrorCode.RATE_LIMITED;
            default -> status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.MALFORMED_REQUEST;
        };
    }

    /** {@code items[2].startAt}: the path of the refused value in the JSON body. */
    private static String fieldPath(JacksonException exception) {
        StringBuilder path = new StringBuilder();
        for (JacksonException.Reference reference : exception.getPath()) {
            if (reference.getPropertyName() != null) {
                if (!path.isEmpty()) {
                    path.append('.');
                }
                path.append(reference.getPropertyName());
            } else {
                path.append('[').append(reference.getIndex()).append(']');
            }
        }
        return path.toString();
    }

    /** What the API expects, for the types of ERD §1. Never echoes the value that was sent. */
    private static String expectation(Class<?> type) {
        if (type == null) {
            return "Invalid value";
        }
        if (LocalDate.class.equals(type)) {
            return "Expected a date formatted YYYY-MM-DD";
        }
        if (LocalTime.class.equals(type)) {
            return "Expected a time formatted HH:mm";
        }
        if (Instant.class.equals(type)) {
            return "Expected an ISO-8601 instant, e.g. 2026-10-02T12:30:00Z";
        }
        return "Expected a value of type " + type.getSimpleName();
    }
}

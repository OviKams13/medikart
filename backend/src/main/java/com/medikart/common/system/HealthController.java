package com.medikart.common.system;

import com.medikart.common.ApiPaths;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.health.contributor.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code GET /api/v1/health} (report §10.2): public, no authentication. For load balancers,
 * uptime checks and the clients' "is the server reachable" test.
 *
 * <p>The status comes from Spring Boot's health checks, MongoDB included: 200 {@code UP} when
 * everything works, 503 {@code DOWN} otherwise. Only the status is returned, never the details
 * (hosts, versions), because anyone can call this route.
 */
@RestController
@RequestMapping(ApiPaths.BASE)
class HealthController {

    /** Response body of {@code /health}. */
    record HealthResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String status) {}

    private final HealthEndpoint healthEndpoint;

    HealthController(HealthEndpoint healthEndpoint) {
        this.healthEndpoint = healthEndpoint;
    }

    @GetMapping("/health")
    @Operation(
            summary = "Server health",
            description = "Public. 200 UP when the server and MongoDB work, 503 DOWN otherwise.")
    @SecurityRequirements // public: no bearer token
    ResponseEntity<HealthResponse> health() {
        Status status = healthEndpoint.health().getStatus();
        boolean up = Status.UP.equals(status);
        return ResponseEntity.status(up ? 200 : 503).body(new HealthResponse(status.getCode()));
    }
}

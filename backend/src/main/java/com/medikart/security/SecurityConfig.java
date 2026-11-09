package com.medikart.security;

import com.medikart.common.ApiPaths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * HTTP security of the API (report §10.1): stateless, every route needs authentication except
 * {@code /health} and {@code /app-config} (plan 4.11) and the API documentation while it is
 * enabled (plan 4.10), and a 401 or 403 uses the single error format (plan 4.9).
 *
 * <p>The Firebase token filter comes with the login (point 5); until then nothing can
 * authenticate, so every route that is not public answers 401.
 */
@Configuration(proxyBeanMethods = false)
class SecurityConfig {

    @Bean
    SecurityFilterChain apiSecurityFilterChain(
            HttpSecurity http,
            ApiAuthenticationEntryPoint entryPoint,
            ApiAccessDeniedHandler accessDeniedHandler,
            @Value("${springdoc.api-docs.enabled:true}") boolean apiDocsEnabled,
            @Value("${springdoc.swagger-ui.enabled:true}") boolean swaggerUiEnabled)
            throws Exception {
        return http.csrf(AbstractHttpConfigurer::disable) // no cookie, no session: nothing to forge
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .exceptionHandling(handling ->
                        handling.authenticationEntryPoint(entryPoint).accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(requests -> {
                    // The only public routes of the API (report §10.1)
                    requests.requestMatchers(HttpMethod.GET, ApiPaths.BASE + "/health", ApiPaths.BASE + "/app-config")
                            .permitAll();
                    // API documentation: public only while enabled (dev). Switch both off in production.
                    if (apiDocsEnabled) {
                        requests.requestMatchers(HttpMethod.GET, "/v3/api-docs", "/v3/api-docs/**")
                                .permitAll();
                    }
                    if (swaggerUiEnabled) {
                        requests.requestMatchers(HttpMethod.GET, "/swagger-ui.html", "/swagger-ui/**")
                                .permitAll();
                    }
                    requests.anyRequest().authenticated();
                })
                .build();
    }

    /**
     * Users come from Firebase tokens, never from a local list. An empty manager keeps Spring Boot
     * from creating its default user and logging a generated password.
     */
    @Bean
    UserDetailsService noLocalUsers() {
        return new InMemoryUserDetailsManager();
    }
}

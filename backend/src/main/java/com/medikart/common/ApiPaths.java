package com.medikart.common;

/** Paths shared by the controllers and the security rules (report §10.1). */
public final class ApiPaths {

    /** Base path of the whole API. Controllers declare it in their {@code @RequestMapping}. */
    public static final String BASE = "/api/v1";

    private ApiPaths() {}
}

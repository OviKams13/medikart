package com.medikart.common.migration.changes;

import io.flamingock.api.annotations.Apply;
import io.flamingock.api.annotations.Change;
import io.flamingock.api.annotations.Rollback;
import io.flamingock.api.annotations.TargetSystem;

/**
 * Baseline migration (ERD §10, batch 0): changes nothing, proves the migration chain runs and is
 * audited. Business indexes come with each feature, as the next numbered migrations.
 *
 * <p>Flamingock reads the execution order from the class name ({@code _0001__}), hence the
 * unusual naming. A migration already applied is never modified: fix it with a new one.
 */
@TargetSystem(id = "medikart-mongodb")
@Change(id = "baseline", author = "medikart")
public class _0001__Baseline {

    @Apply
    public void apply() {
        // Intentionally empty
    }

    @Rollback
    public void rollback() {
        // Nothing to undo
    }
}

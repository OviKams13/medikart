package com.medikart.common.migration;

import com.mongodb.client.MongoClient;
import io.flamingock.api.annotations.EnableFlamingock;
import io.flamingock.api.annotations.Stage;
import io.flamingock.store.mongodb.sync.MongoDBSyncAuditStore;
import io.flamingock.targetsystem.mongodb.sync.MongoDBSyncTargetSystem;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;

/**
 * Database migrations (plan 4.7), run by Flamingock at startup, before the app reports itself
 * ready. A failed migration stops the startup.
 *
 * <p>Migrations use the same MongoDB connection as the rest of the backend: local Docker by
 * default, Atlas with the {@code atlas} profile. Each applied migration is recorded in the
 * {@code flamingockAuditLog} collection and never runs twice.
 */
@Configuration(proxyBeanMethods = false)
@EnableFlamingock(stages = @Stage(name = "medikart", location = "com.medikart.common.migration.changes"))
class MigrationConfig {

    /** Target system id referenced by every migration through {@code @TargetSystem}. */
    static final String MONGODB_TARGET_SYSTEM = "medikart-mongodb";

    @Bean
    MongoDBSyncTargetSystem mongoTargetSystem(MongoClient mongoClient, MongoDatabaseFactory databaseFactory) {
        String databaseName = databaseFactory.getMongoDatabase().getName();
        return new MongoDBSyncTargetSystem(MONGODB_TARGET_SYSTEM, mongoClient, databaseName);
    }

    @Bean
    MongoDBSyncAuditStore auditStore(MongoDBSyncTargetSystem mongoTargetSystem) {
        return MongoDBSyncAuditStore.from(mongoTargetSystem);
    }
}

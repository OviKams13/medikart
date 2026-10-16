package com.medikart;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class MigrationTests {

    private static final String AUDIT_COLLECTION = "flamingockAuditLog";

    @Autowired
    private MongoTemplate mongoTemplate;

    @Test
    void baselineMigrationIsAppliedAndAudited() {
        List<Document> entries = mongoTemplate.find(
                Query.query(Criteria.where("changeId").is("baseline")), Document.class, AUDIT_COLLECTION);

        assertThat(entries).isNotEmpty();
        assertThat(entries).extracting(entry -> entry.getString("state")).contains("APPLIED");
    }
}

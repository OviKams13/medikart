package com.medikart;

import static org.assertj.core.api.Assertions.assertThat;

import org.bson.Document;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class MongoConnectionTests {

    private static final String COLLECTION = "connection_check";

    @Autowired
    private MongoTemplate mongoTemplate;

    @AfterEach
    void dropCollection() {
        mongoTemplate.dropCollection(COLLECTION);
    }

    @Test
    void usesTheMedikartDatabase() {
        assertThat(mongoTemplate.getDb().getName()).isEqualTo("medikart");
    }

    @Test
    void answersPing() {
        Document result = mongoTemplate.executeCommand(new Document("ping", 1));

        assertThat(result.get("ok", Number.class).intValue()).isEqualTo(1);
    }

    @Test
    void writesAndReadsADocument() {
        mongoTemplate.insert(new Document("check", "ok"), COLLECTION);

        Document found = mongoTemplate.findOne(new Query(), Document.class, COLLECTION);

        assertThat(found).isNotNull();
        assertThat(found.getString("check")).isEqualTo("ok");
    }

    @Test
    void runsOnAReplicaSet() {
        Document hello = mongoTemplate.executeCommand(new Document("hello", 1));

        assertThat(hello.getString("setName")).isNotBlank();
    }
}

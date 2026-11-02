package com.medikart;

import java.time.ZoneOffset;
import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MedikartApplication {

    public static void main(String[] args) {
        // The backend never depends on the machine's timezone (report §8.7, plan 4.8)
        TimeZone.setDefault(TimeZone.getTimeZone(ZoneOffset.UTC));
        SpringApplication.run(MedikartApplication.class, args);
    }
}

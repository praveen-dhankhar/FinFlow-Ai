package com.financeapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuration class to enable JPA auditing for @CreatedDate and @LastModifiedDate
 * Only enabled for non-test profiles to avoid date conversion issues in tests
 */
@Configuration
@EnableJpaAuditing
@Profile("!test")
public class AuditConfig {
    // JPA auditing is enabled via @EnableJpaAuditing annotation
    // This allows @CreatedDate and @LastModifiedDate to work automatically
    // Disabled for test profile to avoid LocalDateTime to OffsetDateTime conversion issues
}

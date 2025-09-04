package com.financeapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuration class to enable JPA auditing for @CreatedDate and @LastModifiedDate
 */
@Configuration
@EnableJpaAuditing
public class AuditConfig {
    // JPA auditing is enabled via @EnableJpaAuditing annotation
    // This allows @CreatedDate and @LastModifiedDate to work automatically
}

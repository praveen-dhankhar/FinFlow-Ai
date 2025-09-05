# PostgreSQL Optimization Guide for Finance Forecast App

## Database Indexing Strategies

### Authentication Tables
```sql
-- Users table indexes for authentication performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY idx_users_updated_at ON users(updated_at);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_email_username ON users(email, username);
CREATE INDEX CONCURRENTLY idx_users_active_created ON users(is_active, created_at) WHERE is_active = true;
```

### Financial Data Tables
```sql
-- Financial data indexes for reporting performance
CREATE INDEX CONCURRENTLY idx_financial_data_user_id ON financial_data(user_id);
CREATE INDEX CONCURRENTLY idx_financial_data_type ON financial_data(type);
CREATE INDEX CONCURRENTLY idx_financial_data_category ON financial_data(category);
CREATE INDEX CONCURRENTLY idx_financial_data_date ON financial_data(date);
CREATE INDEX CONCURRENTLY idx_financial_data_amount ON financial_data(amount);

-- Composite indexes for common reporting queries
CREATE INDEX CONCURRENTLY idx_financial_data_user_type_date ON financial_data(user_id, type, date);
CREATE INDEX CONCURRENTLY idx_financial_data_user_category_date ON financial_data(user_id, category, date);
CREATE INDEX CONCURRENTLY idx_financial_data_date_range ON financial_data(date) WHERE date >= CURRENT_DATE - INTERVAL '1 year';
```

### Forecast Tables
```sql
-- Forecast indexes for prediction performance
CREATE INDEX CONCURRENTLY idx_forecasts_user_id ON forecasts(user_id);
CREATE INDEX CONCURRENTLY idx_forecasts_forecast_date ON forecasts(forecast_date);
CREATE INDEX CONCURRENTLY idx_forecasts_confidence_score ON forecasts(confidence_score);
CREATE INDEX CONCURRENTLY idx_forecasts_created_at ON forecasts(created_at);

-- Composite indexes for forecast queries
CREATE INDEX CONCURRENTLY idx_forecasts_user_date ON forecasts(user_id, forecast_date);
CREATE INDEX CONCURRENTLY idx_forecasts_future_dates ON forecasts(forecast_date) WHERE forecast_date >= CURRENT_DATE;
CREATE INDEX CONCURRENTLY idx_forecasts_confidence_desc ON forecasts(confidence_score DESC, created_at DESC);
```

## Connection Pool Configuration

### HikariCP Settings for PostgreSQL
```properties
# PostgreSQL connection pool optimization
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.leak-detection-threshold=60000

# PostgreSQL-specific optimizations
spring.datasource.hikari.data-source-properties.cachePrepStmts=true
spring.datasource.hikari.data-source-properties.prepStmtCacheSize=250
spring.datasource.hikari.data-source-properties.prepStmtCacheSqlLimit=2048
spring.datasource.hikari.data-source-properties.useServerPrepStmts=true
spring.datasource.hikari.data-source-properties.rewriteBatchedStatements=true
spring.datasource.hikari.data-source-properties.cacheResultSetMetadata=true
spring.datasource.hikari.data-source-properties.cacheServerConfiguration=true
spring.datasource.hikari.data-source-properties.elideSetAutoCommits=true
spring.datasource.hikari.data-source-properties.maintainTimeStats=false
```

## Query Optimization

### Authentication Queries
```sql
-- Optimized user lookup by email (most common auth query)
-- Uses idx_users_email index
SELECT id, username, email, password_hash, created_at, updated_at 
FROM users 
WHERE email = ? AND is_active = true;

-- Optimized user lookup by username
-- Uses idx_users_username index
SELECT id, username, email, password_hash, created_at, updated_at 
FROM users 
WHERE username = ? AND is_active = true;
```

### Financial Data Aggregation Queries
```sql
-- Optimized monthly expense summary
-- Uses idx_financial_data_user_type_date index
SELECT 
    DATE_TRUNC('month', date) as month,
    category,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM financial_data 
WHERE user_id = ? 
    AND type = 'EXPENSE' 
    AND date >= ? 
    AND date <= ?
GROUP BY DATE_TRUNC('month', date), category
ORDER BY month DESC, total_amount DESC;

-- Optimized forecast confidence analysis
-- Uses idx_forecasts_confidence_desc index
SELECT 
    user_id,
    AVG(confidence_score) as avg_confidence,
    MIN(confidence_score) as min_confidence,
    MAX(confidence_score) as max_confidence,
    COUNT(*) as forecast_count
FROM forecasts 
WHERE forecast_date >= CURRENT_DATE
GROUP BY user_id
HAVING COUNT(*) >= 5
ORDER BY avg_confidence DESC;
```

## Performance Monitoring

### PostgreSQL Configuration for Production
```sql
-- Enable query performance monitoring
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Memory and connection settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET max_connections = 100;

-- Checkpoint and WAL settings
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

### Application-Level Monitoring
```java
// Add to application.properties for PostgreSQL monitoring
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always
management.metrics.export.prometheus.enabled=true

# Database connection monitoring
spring.datasource.hikari.register-mbeans=true
management.endpoint.hikaricp.enabled=true
```

## Migration Strategy

### From H2 to PostgreSQL
1. **Data Export**: Use H2's CSV export functionality
2. **Schema Migration**: Flyway migrations handle this automatically
3. **Index Creation**: Run the indexing scripts above
4. **Connection Pool Tuning**: Adjust based on load testing
5. **Performance Monitoring**: Set up monitoring before going live

### Rollback Plan
1. **Database Backup**: Full PostgreSQL backup before migration
2. **H2 Fallback**: Keep H2 configuration available
3. **Feature Flags**: Disable PostgreSQL-specific features if needed
4. **Monitoring**: Watch for performance degradation

## Security Considerations

### PostgreSQL Security Hardening
```sql
-- Create application-specific user with limited privileges
CREATE USER finance_app_user WITH PASSWORD 'secure_password_here';
GRANT CONNECT ON DATABASE finance_forecast TO finance_app_user;
GRANT USAGE ON SCHEMA public TO finance_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO finance_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO finance_app_user;

-- Revoke unnecessary privileges
REVOKE CREATE ON SCHEMA public FROM finance_app_user;
REVOKE USAGE ON SCHEMA information_schema FROM finance_app_user;
```

### SSL/TLS Configuration
```properties
# PostgreSQL SSL configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/finance_forecast?ssl=true&sslmode=require
spring.datasource.hikari.data-source-properties.ssl=true
spring.datasource.hikari.data-source-properties.sslmode=require
```

## Load Testing Recommendations

### Authentication Load Testing
- **Concurrent Users**: Test with 100+ concurrent authentication requests
- **Token Refresh**: Test refresh token rotation under load
- **Rate Limiting**: Verify rate limiting works under high load
- **Database Connections**: Monitor connection pool usage

### Financial Data Load Testing
- **Bulk Insert**: Test inserting 10,000+ financial records
- **Aggregation Queries**: Test monthly/yearly reporting under load
- **Forecast Generation**: Test concurrent forecast calculations
- **Search Performance**: Test user search with large datasets

This optimization guide ensures the application performs well on PostgreSQL while maintaining compatibility with H2 for development and testing.

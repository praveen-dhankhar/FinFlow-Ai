# Security Configuration

This document describes the security configuration for the Finance Forecast App, which is designed to work with both H2 (development/test) and PostgreSQL (production) databases.

## Overview

The application implements JWT-based authentication with the following security features:

- **JWT Token Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing with strength 12
- **CORS Configuration**: Cross-origin resource sharing setup
- **Method-Level Security**: `@PreAuthorize`, `@PostAuthorize`, `@Secured` annotations
- **Database-Agnostic Security**: Works with both H2 and PostgreSQL
- **Security Headers**: Protection against common web vulnerabilities

## Security Components

### 1. JWT Token Provider (`JwtTokenProvider`)

Handles JWT token generation, validation, and refresh:

- **Access Tokens**: 24-hour expiration (configurable)
- **Refresh Tokens**: 7-day expiration (configurable)
- **HMAC-SHA512**: Token signing algorithm
- **Database-Independent**: No database queries for token validation

### 2. Authentication Filter (`JwtAuthenticationFilter`)

Processes JWT tokens from HTTP requests:

- **Bearer Token Extraction**: From `Authorization` header
- **Token Validation**: Using `JwtTokenProvider`
- **User Context**: Sets Spring Security context

### 3. Security Configuration (`SecurityConfig`)

Main security configuration:

- **Public Endpoints**: `/api/auth/**`, `/api/health`, `/actuator/health`
- **Protected Endpoints**: All other `/api/**` endpoints
- **H2 Console**: Accessible only in development with `DEVELOPER` role
- **CORS**: Configurable for different environments

### 4. User Details Service (`CustomUserDetailsService`)

Integrates with existing `UserService`:

- **Username Lookup**: Uses `UserService.getUserByUsername()`
- **Role Management**: Currently assigns `ROLE_USER` to all users
- **Database Integration**: Works with both H2 and PostgreSQL

## Database Compatibility

### H2 Database (Development/Test)

- **In-Memory**: Fast startup and testing
- **Console Access**: Available at `/h2-console` in development
- **No SSL**: Not required for local development
- **Simple Configuration**: Minimal setup required

### PostgreSQL (Production)

- **Connection Pooling**: HikariCP with security settings
- **SSL/TLS**: Required for production connections
- **Audit Logging**: Enhanced security monitoring
- **Performance Optimization**: Tuned for production workloads

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Database Configuration (PostgreSQL)
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
```

### Application Properties

```yaml
# JWT Configuration
app:
  jwt:
    secret: ${JWT_SECRET:default-secret}
    expiration: ${JWT_EXPIRATION:86400000}
    refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}

# Security Configuration
security:
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}
    allowed-methods: GET,POST,PUT,DELETE,OPTIONS,PATCH
    allowed-headers: "*"
    allow-credentials: true
    max-age: 3600
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Protected Endpoints

All other API endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Security Headers

The application sets the following security headers:

- **Content-Type-Options**: `nosniff`
- **Frame-Options**: `DENY` (except H2 console in development)
- **XSS-Protection**: `1; mode=block`
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains` (PostgreSQL only)

## Method-Level Security

Use the following annotations for method-level security:

```java
@PreAuthorize("hasRole('USER')")
@PostAuthorize("returnObject.username == authentication.name")
@Secured("ROLE_USER")
@RolesAllowed("USER")
```

## Testing

### Security Test Suite

The application includes comprehensive security tests:

- **JWT Token Tests**: Token generation, validation, expiration
- **Password Security Tests**: Hashing, authentication, complexity validation
- **User Registration Tests**: Duplicate prevention, validation
- **Database Agnostic Tests**: Works with both H2 and PostgreSQL
- **Integration Tests**: End-to-end security testing

### Running Security Tests

```bash
# Run all security tests
mvn test -Dtest="*Security*"

# Run specific security test
mvn test -Dtest="SecurityIntegrationTest"

# Run PostgreSQL security tests (requires TestContainers)
mvn test -Dtest="PostgreSQLSecurityTest" -Dspring.profiles.active=test-postgres
```

## Production Deployment

### PostgreSQL Setup

1. **Database Creation**:
   ```sql
   CREATE DATABASE financeapp;
   CREATE USER financeapp_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE financeapp TO financeapp_user;
   ```

2. **SSL Certificate**:
   - Place PostgreSQL CA certificate in `src/main/resources/ssl/postgresql-ca.pem`
   - Configure SSL mode in `postgresql-security.properties`

3. **Environment Variables**:
   ```bash
   export JWT_SECRET="your-production-jwt-secret"
   export DB_USERNAME="financeapp_user"
   export DB_PASSWORD="secure_password"
   export CORS_ALLOWED_ORIGINS="https://yourdomain.com"
   ```

### Security Checklist

- [ ] JWT secret is properly configured
- [ ] Database credentials are secure
- [ ] CORS origins are restricted to production domains
- [ ] SSL/TLS is enabled for PostgreSQL
- [ ] Security headers are configured
- [ ] Logging is configured for security monitoring
- [ ] H2 console is disabled in production

## Troubleshooting

### Common Issues

1. **JWT Token Invalid**: Check token expiration and secret configuration
2. **CORS Errors**: Verify allowed origins configuration
3. **Database Connection**: Check credentials and SSL configuration
4. **H2 Console Access**: Ensure proper role assignment in development

### Logging

Enable debug logging for security troubleshooting:

```yaml
logging:
  level:
    com.financeapp.security: DEBUG
    org.springframework.security: DEBUG
```

## Security Best Practices

1. **Token Management**: Use short-lived access tokens with refresh tokens
2. **Password Security**: Enforce strong password policies
3. **HTTPS Only**: Use HTTPS in production
4. **Regular Updates**: Keep dependencies updated
5. **Monitoring**: Monitor security logs and metrics
6. **Least Privilege**: Grant minimum required permissions
7. **Input Validation**: Validate all user inputs
8. **Error Handling**: Don't expose sensitive information in errors

# Deployment Guide

This guide covers deploying the Finance Forecast App to various environments and platforms.

## Table of Contents

- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

The Finance Forecast App is designed for deployment across multiple environments:

- **Development**: Local development with hot reloading
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Spring Boot) │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Load Balancer  │
                    │   (Nginx)        │
                    │   Port: 80/443   │
                    └─────────────────┘
```

## Environment Setup

### Prerequisites

- **Node.js** 18.17.0 or higher
- **Docker** 20.10.0 or higher
- **Docker Compose** 2.0.0 or higher
- **PostgreSQL** 14.0 or higher (for local development)

### Environment Variables

#### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.finance-forecast.app
NEXT_PUBLIC_WS_URL=wss://api.finance-forecast.app/ws

# Authentication
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://finance-forecast.app

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE=true
NEXT_PUBLIC_ENABLE_FORECASTING=true

# External Services
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

#### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finance_forecast
DATABASE_POOL_SIZE=20
DATABASE_POOL_TIMEOUT=30000

# JWT Configuration
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@finance-forecast.app
SMTP_PASS=your-app-password

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=finance-forecast-storage
AWS_REGION=us-east-1

# External APIs
OPENAI_API_KEY=your-openai-api-key
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENVIRONMENT=sandbox

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO
```

## Docker Deployment

### Docker Compose

Create a `docker-compose.prod.yml` file:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: finance_forecast
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/finance_forecast
      JWT_SECRET: ${JWT_SECRET}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Dockerfile (Backend)

```dockerfile
# Dockerfile.backend
FROM openjdk:17-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw dependency:go-offline -B

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/target ./target
RUN ./mvnw clean package -DskipTests

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system spring
RUN adduser --system spring --ingroup spring

# Copy the jar file
COPY --from=builder /app/target/*.jar app.jar

# Change ownership
RUN chown spring:spring app.jar
USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Deployment Commands

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Cloud Deployment

### AWS Deployment

#### Using AWS App Runner

1. **Create App Runner Service**

```yaml
# apprunner.yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - echo "Building the application"
      - cd frontend
      - npm ci
      - npm run build
run:
  runtime-version: 18
  command: npm start
  network:
    port: 3000
    env: PORT
  env:
    - name: NODE_ENV
      value: production
    - name: NEXT_PUBLIC_API_URL
      value: https://api.finance-forecast.app
```

2. **Deploy to App Runner**

```bash
# Create App Runner service
aws apprunner create-service \
  --service-name finance-forecast-frontend \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "your-account.dkr.ecr.region.amazonaws.com/finance-forecast:latest",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production"
        }
      },
      "ImageRepositoryType": "ECR"
    }
  }'
```

#### Using AWS ECS with Fargate

```yaml
# ecs-task-definition.json
{
  "family": "finance-forecast",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/finance-forecast:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/finance-forecast",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Vercel Deployment

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

2. **Configure Vercel**

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.finance-forecast.app"
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

3. **Deploy to Vercel**

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
```

### Netlify Deployment

1. **Configure Netlify**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "frontend/.next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy to Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=frontend/.next
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
      - run: npm run lighthouse:ci

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: frontend/.next

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: build-files
          path: frontend/.next
      - name: Deploy to AWS
        run: |
          # Deploy to AWS S3/CloudFront
          aws s3 sync frontend/.next s3://your-bucket --delete
          aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:18-alpine
  script:
    - npm ci
    - npm run test:ci
    - npm run test:e2e
    - npm run lighthouse:ci

build:
  stage: build
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - frontend/.next
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache aws-cli
    - aws s3 sync frontend/.next s3://your-bucket --delete
    - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
  only:
    - main
```

## Monitoring

### Application Monitoring

#### Sentry Integration

```typescript
// frontend/src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
})
```

#### Health Checks

```typescript
// frontend/src/app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await checkDatabaseConnection()
    
    // Check external services
    await checkExternalServices()
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        api: 'up',
        external: 'up'
      }
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
}
```

### Performance Monitoring

#### Lighthouse CI

```yaml
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://finance-forecast.app'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

#### Web Vitals Monitoring

```typescript
// frontend/src/lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics service
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_label: metric.id,
    non_interaction: true,
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
```

#### Database Connection Issues

```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Test connection
psql -h localhost -U user -d finance_forecast
```

#### Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Check memory usage
docker stats
```

### Performance Issues

#### Bundle Size Optimization

```bash
# Analyze bundle size
npm run analyze

# Check for duplicate dependencies
npm ls --depth=0
```

#### Database Performance

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Security Issues

#### SSL Certificate Issues

```bash
# Check SSL certificate
openssl s_client -connect finance-forecast.app:443 -servername finance-forecast.app

# Renew Let's Encrypt certificate
certbot renew --dry-run
```

#### Environment Variable Security

```bash
# Check for exposed secrets
grep -r "password\|secret\|key" . --exclude-dir=node_modules

# Use environment variable validation
npm install joi
```

## Support

For deployment-related issues:

- **Documentation**: This guide and inline comments
- **GitHub Issues**: Deployment-specific issues
- **Discord**: #deployment channel
- **Email**: deployment@finance-forecast.app

## Best Practices

### Security

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS Only**: Always use HTTPS in production
3. **Security Headers**: Implement proper security headers
4. **Regular Updates**: Keep dependencies updated
5. **Access Control**: Implement proper access controls

### Performance

1. **CDN**: Use CDN for static assets
2. **Caching**: Implement proper caching strategies
3. **Compression**: Enable gzip/brotli compression
4. **Database**: Optimize database queries
5. **Monitoring**: Monitor performance metrics

### Reliability

1. **Health Checks**: Implement comprehensive health checks
2. **Error Handling**: Proper error handling and logging
3. **Backups**: Regular database backups
4. **Rollback**: Quick rollback procedures
5. **Monitoring**: 24/7 monitoring and alerting

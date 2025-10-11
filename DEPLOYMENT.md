# Deployment Guide

This guide covers deploying the Finance Forecast App to various environments and platforms.

## Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- Docker and Docker Compose
- Vercel CLI (`npm i -g vercel`)
- Git

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp env.production.template .env.production
   ```

2. **Update environment variables:**
   Edit `.env.production` with your production values.

3. **Install dependencies:**
   ```bash
   cd frontend
   npm ci
   ```

## Deployment Options

### 1. Vercel Deployment (Recommended)

#### Automatic Deployment via GitHub

1. **Connect GitHub repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework: Next.js
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `.next`

2. **Set environment variables in Vercel:**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXT_PUBLIC_SENTRY_DSN production
   # ... add all required environment variables
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

### 2. Docker Deployment

#### Using Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

#### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml finance-forecast

# View services
docker service ls

# Scale services
docker service scale finance-forecast_frontend=3
```

### 3. Kubernetes Deployment

#### Create Kubernetes manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: finance-forecast

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: finance-forecast-config
  namespace: finance-forecast
data:
  NODE_ENV: "production"
  NEXT_PUBLIC_API_URL: "https://api.finance-forecast.app"

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: finance-forecast-frontend
  namespace: finance-forecast
spec:
  replicas: 3
  selector:
    matchLabels:
      app: finance-forecast-frontend
  template:
    metadata:
      labels:
        app: finance-forecast-frontend
    spec:
      containers:
      - name: frontend
        image: finance-forecast:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: finance-forecast-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

#### Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n finance-forecast

# View logs
kubectl logs -f deployment/finance-forecast-frontend -n finance-forecast
```

## CI/CD Pipeline

### GitHub Actions

The project includes comprehensive GitHub Actions workflows:

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Linting and type checking
  - Unit tests
  - E2E tests
  - Performance tests
  - Security scanning
  - Docker build
  - Automatic deployment

- **Preview Deployments** (`.github/workflows/preview.yml`):
  - Automatic preview deployments for PRs
  - Lighthouse audits
  - Accessibility testing
  - Visual regression testing

### Required Secrets

Add these secrets to your GitHub repository:

```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Monitoring
LHCI_GITHUB_APP_TOKEN=your-lighthouse-ci-token
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Notifications
SLACK_WEBHOOK=your-slack-webhook-url
```

## Environment Configuration

### Production Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.finance-forecast.app
NEXT_PUBLIC_WS_URL=wss://api.finance-forecast.app/ws

# Authentication
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://finance-forecast.app

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=finance-forecast-frontend
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token

# External Services
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
NEXT_PUBLIC_PLAID_CLIENT_ID=your-plaid-client-id
```

### Staging Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://staging-api.finance-forecast.app
NEXT_PUBLIC_WS_URL=wss://staging-api.finance-forecast.app/ws

# Authentication
NEXTAUTH_SECRET=your-staging-secret-key
NEXTAUTH_URL=https://staging.finance-forecast.app

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-staging-sentry-dsn@sentry.io/project-id

# Analytics (use test IDs)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Monitoring and Observability

### Sentry Integration

1. **Create Sentry project:**
   - Go to [Sentry.io](https://sentry.io)
   - Create a new project for Next.js
   - Get your DSN

2. **Configure Sentry:**
   ```bash
   # Install Sentry CLI
   npm i -g @sentry/cli

   # Login to Sentry
   sentry-cli login

   # Create release
   sentry-cli releases new $VERSION
   sentry-cli releases set-commits $VERSION --auto
   ```

### Performance Monitoring

#### Lighthouse CI

```bash
# Install Lighthouse CI
npm i -g @lhci/cli

# Run Lighthouse CI
lhci autorun --upload.target=temporary-public-storage
```

#### Web Vitals

The application automatically tracks Core Web Vitals:

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

### Health Checks

The application includes health check endpoints:

- **Frontend Health:** `GET /api/health`
- **Backend Health:** `GET /api/health`
- **Database Health:** `GET /api/health/database`

## Security

### SSL/TLS Configuration

#### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d finance-forecast.app

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Custom SSL Certificate

```bash
# Copy certificates to nginx
sudo cp cert.pem /etc/nginx/ssl/
sudo cp key.pem /etc/nginx/ssl/

# Update nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

### Security Headers

The application includes comprehensive security headers:

- **Strict-Transport-Security:** Enforces HTTPS
- **X-Frame-Options:** Prevents clickjacking
- **X-Content-Type-Options:** Prevents MIME sniffing
- **Content-Security-Policy:** Prevents XSS attacks
- **Referrer-Policy:** Controls referrer information

### Rate Limiting

Nginx configuration includes rate limiting:

```nginx
# API rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Login rate limiting
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
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

#### Docker Issues

```bash
# Check Docker status
docker ps

# View container logs
docker logs finance-forecast-frontend

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### Vercel Issues

```bash
# Check Vercel status
vercel ls

# View deployment logs
vercel logs

# Redeploy
vercel --prod --force
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

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Docker Rollback

```bash
# List images
docker images

# Rollback to previous image
docker-compose -f docker-compose.prod.yml up -d --scale frontend=0
docker-compose -f docker-compose.prod.yml up -d --scale frontend=3
```

### Database Rollback

```bash
# Restore from backup
pg_restore -h localhost -U postgres -d finance_forecast backup.sql

# Run specific migration
npm run migrate:rollback
```

## Best Practices

### Security

1. **Environment Variables:** Never commit secrets to version control
2. **HTTPS Only:** Always use HTTPS in production
3. **Security Headers:** Implement proper security headers
4. **Regular Updates:** Keep dependencies updated
5. **Access Control:** Implement proper access controls

### Performance

1. **CDN:** Use CDN for static assets
2. **Caching:** Implement proper caching strategies
3. **Compression:** Enable gzip/brotli compression
4. **Database:** Optimize database queries
5. **Monitoring:** Monitor performance metrics

### Reliability

1. **Health Checks:** Implement comprehensive health checks
2. **Error Handling:** Proper error handling and logging
3. **Backups:** Regular database backups
4. **Rollback:** Quick rollback procedures
5. **Monitoring:** 24/7 monitoring and alerting

## Support

For deployment-related issues:

- **Documentation:** This guide and inline comments
- **GitHub Issues:** Deployment-specific issues
- **Discord:** #deployment channel
- **Email:** deployment@finance-forecast.app

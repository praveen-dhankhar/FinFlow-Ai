# Render Manual Deployment Guide

If the automatic `render.yaml` deployment isn't working, follow these manual steps:

## Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → New + → PostgreSQL
2. Configure:
   - **Name**: `financeapp-db`
   - **Database**: `financeapp`
   - **User**: `financeapp`
   - **Region**: Choose closest to you
   - **Plan**: Free
3. Click "Create Database"
4. **IMPORTANT**: Copy these values from the database page:
   - Internal Database URL
   - Hostname
   - Port
   - Database
   - Username
   - Password

## Step 2: Create Web Service

1. Go to Render Dashboard → New + → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finflow-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: Docker (or leave as detected)
   - **Build Command**: `mvn clean install -DskipTests`
   - **Start Command**: `java -Dserver.port=$PORT -jar target/finance-forecast-app-0.0.1-SNAPSHOT.jar`

## Step 3: Add Environment Variables

In the web service, go to "Environment" and add these **one by one**:

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# Database (use values from Step 1)
DB_HOST=<your-db-hostname>.render.com
DB_PORT=5432
DB_NAME=financeapp
DB_USERNAME=financeapp
DB_PASSWORD=<your-db-password>
DB_SSLMODE=require

# JWT Secret (generate with: openssl rand -base64 64)
JWT_SECRET=s1lwNaZ71hnMhMQpU5raFY3lMa6UCpbUCklFN4tVt/EeMaGpfVoCbAhOsn5oj28YZX0+Q6q8p1RXn33eHCUXeA==
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# CORS (update after deploying frontend)
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

## Step 4: Deploy

1. Click "Create Web Service"
2. Wait for build (~5-10 minutes)
3. Check logs for "Started FinanceForecastApplication"

## Step 5: Verify

Test the health endpoint:
```
https://your-backend.onrender.com/actuator/health
```

Should return:
```json
{
  "status": "UP"
}
```

## Troubleshooting

### If build fails:
- Check that Java 21 is being used
- Verify Maven can download dependencies
- Check build logs for specific errors

### If app starts but crashes:
- Verify all environment variables are set
- Check database is "Available" status
- Verify database credentials are correct
- Check application logs for connection errors

### Database connection errors:
- Ensure DB_HOST uses internal hostname (ends with .render.com)
- Verify DB_SSLMODE is set to "require"
- Check database is in same region as web service
- Wait a few minutes for database to be fully ready

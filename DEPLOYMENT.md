# Deployment Guide: Vercel + Render

Quick reference guide for deploying FinFlow-AI to production.

## 🚀 Quick Start

### Backend (Render)

1. **Create PostgreSQL Database**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "PostgreSQL"
   - Name: `financeapp-db`
   - Plan: Free (for testing) or Starter ($7/month)
   - Click "Create Database"
   - **Save the connection details!**

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Name**: `finflow-backend`
     - **Environment**: Java
     - **Build Command**: `mvn clean package -DskipTests`
     - **Start Command**: `java -Dserver.port=$PORT -jar target/finance-forecast-app-0.0.1-SNAPSHOT.jar`
     - **Plan**: Free (spins down after inactivity) or Starter ($7/month)

3. **Add Environment Variables**
   
   In Render Dashboard → Your Service → Environment:
   
   ```bash
   # Database (from your PostgreSQL instance)
   DB_HOST=<your-postgres-host>.render.com
   DB_PORT=5432
   DB_NAME=financeapp
   DB_USERNAME=<from-postgres-credentials>
   DB_PASSWORD=<from-postgres-credentials>
   DB_SSLMODE=require
   
   # JWT (CRITICAL: Generate a strong secret!)
   JWT_SECRET=<generate-256-char-random-string>
   JWT_EXPIRATION=86400000
   JWT_REFRESH_EXPIRATION=604800000
   
   # CORS (Update after deploying frontend)
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   
   # Spring Profile
   SPRING_PROFILES_ACTIVE=prod
   ```

4. **Generate JWT Secret**
   ```bash
   # Run this command to generate a secure secret:
   openssl rand -base64 64 | tr -d '\n'
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (~5-10 minutes)
   - Check logs for "Started FinanceForecastApplication"
   - Test: `https://your-backend.onrender.com/actuator/health`

---

### Frontend (Vercel)

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Root Directory**: `frontend`
   - Framework: Next.js (auto-detected)

2. **Configure Environment Variables**
   
   In Vercel → Project Settings → Environment Variables:
   
   ```bash
   # Required
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   
   # Optional
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_WEB_VITALS_REPORTING=true
   NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
   ```

3. **Update vercel.json**
   
   Before deploying, update the API proxy URL in `vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/proxy/(.*)",
         "destination": "https://your-backend.onrender.com/api/$1"
       }
     ]
   }
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build (~2-3 minutes)
   - Visit your deployed URL

5. **Update Backend CORS**
   
   After deployment, update backend environment variable:
   ```bash
   CORS_ALLOWED_ORIGINS=https://your-actual-app.vercel.app
   ```
   
   Then redeploy the backend service.

---

## ✅ Verification Checklist

### Backend
- [ ] Database connection successful
- [ ] Health endpoint returns 200: `/actuator/health`
- [ ] Flyway migrations ran successfully
- [ ] Logs show no errors
- [ ] SSL enabled for database

### Frontend
- [ ] Application loads without errors
- [ ] Can access landing page
- [ ] API calls work (check Network tab)
- [ ] No CORS errors in console
- [ ] Login/signup functionality works

---

## 🔒 Security Checklist

- [ ] Generated strong JWT_SECRET (256+ characters)
- [ ] Updated CORS_ALLOWED_ORIGINS with actual domain
- [ ] Database SSL enabled (DB_SSLMODE=require)
- [ ] All default passwords changed
- [ ] Environment variables set (not hardcoded)
- [ ] HTTPS enabled (automatic on Vercel/Render)

---

## 📊 Monitoring

### Render
- View logs: Dashboard → Your Service → Logs
- Metrics: Dashboard → Your Service → Metrics
- Database: Dashboard → PostgreSQL → Metrics

### Vercel
- Analytics: Dashboard → Your Project → Analytics
- Logs: Dashboard → Your Project → Deployments → View Logs
- Performance: Built-in Web Vitals tracking

---

## 🐛 Troubleshooting

### Backend won't start
1. Check Render logs for errors
2. Verify all environment variables are set
3. Ensure database is running
4. Check build command completed successfully

### Frontend can't connect to backend
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend CORS settings
3. Inspect browser Network tab for errors
4. Ensure backend is running (not spun down)

### Database connection errors
1. Verify database credentials
2. Check SSL mode setting
3. Ensure database is accessible
4. Review connection pool settings

### CORS errors
1. Update `CORS_ALLOWED_ORIGINS` on backend
2. Include both www and non-www domains
3. Redeploy backend after changes
4. Clear browser cache

---

## 💰 Cost Estimate

### Free Tier (Testing)
- **Render**: Free web service + Free PostgreSQL (90 days)
- **Vercel**: Free Hobby plan
- **Total**: $0/month (limited)

### Production (Starter)
- **Render**: $7/month (web service) + $7/month (PostgreSQL)
- **Vercel**: $20/month (Pro plan)
- **Total**: $34/month

---

## 📝 Next Steps

1. Set up custom domain
2. Configure automated backups
3. Set up monitoring alerts
4. Implement CI/CD pipeline
5. Add staging environment
6. Configure error tracking (Sentry)
7. Set up analytics
8. Enable rate limiting

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Spring Boot on Render](https://render.com/docs/deploy-spring-boot)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

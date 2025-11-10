# 🚀 SpiegelMatch Deployment Guide

Complete guide for deploying SpiegelMatch to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup (Supabase)](#database-setup-supabase)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Platforms](#cloud-platforms)
6. [Frontend Deployment](#frontend-deployment)
7. [Production Checklist](#production-checklist)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- Docker (for containerized deployment)
- Supabase account
- Cloud platform account (Railway, Render, or similar)
- Domain name (optional but recommended)

---

## Environment Variables

### Required Variables

Create a `.env` file with the following:

```bash
# Application
NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Security
JWT_SECRET=your-random-secret-key-here
API_KEY=your-api-key-here

# Optional: Logging
LOG_LEVEL=info
```

### Generating Secrets

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Run Migration

1. Navigate to SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/migrations/20251109_initial_schema.sql`
3. Run the SQL script

This creates:
- `characters` table
- `matches` table
- RLS policies
- Indexes for performance

### 3. Enable Row Level Security

RLS is automatically enabled by the migration. Verify in:
- Supabase Dashboard → Authentication → Policies

### 4. Set Up Storage (Optional)

For profile images:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- RLS policy for avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t spiegelmatch:latest .
```

### 2. Run Container

```bash
docker run -d \
  --name spiegelmatch \
  -p 3001:3001 \
  --env-file .env \
  spiegelmatch:latest
```

### 3. Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

---

## Cloud Platforms

### Railway

**Best for:** Full-stack deployment with automatic SSL

1. **Connect Repository:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize
   railway init
   ```

2. **Add Environment Variables:**
   - Go to Railway Dashboard
   - Select your project
   - Add all variables from `.env`

3. **Deploy:**
   ```bash
   railway up
   ```

4. **Custom Domain:**
   - Settings → Domains → Add Custom Domain
   - Configure DNS records

**Estimated Cost:** $5-20/month

---

### Render

**Best for:** Simple deployment with free tier

1. **Create Web Service:**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repository

2. **Configure:**
   ```yaml
   # Build Command
   npm install && npm run build
   
   # Start Command
   npm start
   
   # Environment
   Node
   ```

3. **Add Environment Variables:**
   - Environment tab → Add variables

4. **Deploy:**
   - Automatic on git push

**Free Tier Available** (spins down after inactivity)

---

### Fly.io

**Best for:** Global edge deployment

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login & Launch:**
   ```bash
   fly auth login
   fly launch
   ```

3. **Set Secrets:**
   ```bash
   fly secrets set SUPABASE_URL=xxx
   fly secrets set SUPABASE_ANON_KEY=xxx
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

**Estimated Cost:** $5-15/month

---

### AWS (Advanced)

**Best for:** Enterprise-grade deployment

1. **Services Needed:**
   - ECS (Container Service)
   - RDS (PostgreSQL alternative)
   - S3 (Static assets)
   - CloudFront (CDN)
   - Route 53 (DNS)

2. **Use Terraform:**
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform plan
   terraform apply
   ```

**Estimated Cost:** $50-200/month

---

## Frontend Deployment

### Vercel (Recommended)

**Best for:** React/Vite projects

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Environment Variables:**
   - Add in Vercel Dashboard:
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Custom Domain:**
   - Settings → Domains → Add

**Free Tier Available**

---

### Netlify

1. **Build Settings:**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build:frontend"
     publish = "frontend/dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy:**
   ```bash
   npm install netlify-cli -g
   netlify deploy --prod
   ```

---

### Cloudflare Pages

1. **Connect Repository:**
   - Go to Cloudflare Pages
   - Connect GitHub

2. **Build Settings:**
   ```
   Framework: Vite
   Build command: npm run build:frontend
   Output directory: frontend/dist
   ```

3. **Environment Variables:**
   - Add via Pages dashboard

---

## Production Checklist

### Security

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured (not in code)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Helmet.js security headers enabled
- [ ] Database RLS policies active
- [ ] API authentication required
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] XSS protection

### Performance

- [ ] Database indexes created
- [ ] Static assets cached
- [ ] Gzip compression enabled
- [ ] CDN configured for frontend
- [ ] Image optimization
- [ ] Lazy loading implemented
- [ ] API response caching

### Monitoring

- [ ] Health check endpoint working
- [ ] Error logging configured
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Database backups automated
- [ ] Log aggregation (Papertrail, Loggly)

### Documentation

- [ ] API documentation updated
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented

---

## Monitoring & Logging

### Winston Logger (Built-in)

```typescript
import logger from './src/config/logger';

logger.info('Application started');
logger.error('Error occurred', { error });
logger.warn('Warning message');
```

### External Services

**Sentry (Error Tracking):**

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

**New Relic (Performance):**

```bash
npm install newrelic
```

```typescript
require('newrelic');
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Fails

**Error:** `Could not connect to Supabase`

**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check network connectivity
- Ensure Supabase project is active

```bash
# Test connection
curl https://your-project.supabase.co/rest/v1/
```

---

#### 2. CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solution:**
- Add frontend URL to `FRONTEND_URL` env variable
- Update CORS configuration in `src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.com'
  ],
  credentials: true
}));
```

---

#### 3. Build Failures

**Error:** `TypeScript compilation failed`

**Solution:**
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

---

#### 4. High Memory Usage

**Solution:**
- Increase Docker memory limit:
  ```yaml
  deploy:
    resources:
      limits:
        memory: 512M
  ```
- Optimize database queries
- Implement caching

---

#### 5. Slow API Responses

**Solution:**
- Add database indexes:
  ```sql
  CREATE INDEX idx_characters_user_id ON characters(user_id);
  ```
- Enable response compression
- Use CDN for static assets

---

## Backup & Recovery

### Database Backups

Supabase provides automatic backups (Pro plan).

**Manual Backup:**

```bash
# Export database
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  > backup.sql

# Restore
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  < backup.sql
```

### File Backups

```bash
# Backup taxonomy
cp taxonomy-complete.json backups/taxonomy-$(date +%Y%m%d).json
```

---

## Scaling Strategies

### Horizontal Scaling

1. **Load Balancer:**
   - Use Nginx or cloud provider load balancer
   - Distribute traffic across multiple instances

2. **Database Read Replicas:**
   - Supabase Pro plan includes read replicas
   - Route read queries to replicas

### Vertical Scaling

- Increase server resources (RAM, CPU)
- Upgrade Supabase plan for more connections

### Caching

```typescript
import Redis from 'redis';

const redis = Redis.createClient({
  url: process.env.REDIS_URL
});

// Cache taxonomy
await redis.set('taxonomy', JSON.stringify(taxonomy), {
  EX: 3600 // 1 hour
});
```

---

## Cost Optimization

### Free Tier Usage

- **Supabase:** 500MB database, 1GB file storage
- **Vercel:** Unlimited bandwidth, 100GB bandwidth
- **Render:** 750 hours/month free

### Estimated Monthly Costs

| Component | Service | Cost |
|-----------|---------|------|
| Backend | Railway | $5-10 |
| Frontend | Vercel (Free) | $0 |
| Database | Supabase (Free) | $0 |
| **Total** | | **$5-10/month** |

---

## Support

For deployment issues:
- [GitHub Issues](https://github.com/yourusername/spiegelmatch/issues)
- [Discord Community](https://discord.gg/spiegelmatch)
- Email: support@spiegelmatch.com

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)

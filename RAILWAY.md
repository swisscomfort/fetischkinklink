# Railway Deployment Configuration

This project is configured for deployment on [Railway](https://railway.app).

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/spiegelmatch)

## Manual Deployment

### Backend Deployment

1. **Create New Project**
   ```bash
   railway login
   railway init
   ```

2. **Add Environment Variables**
   ```bash
   railway variables set SUPABASE_URL=your-url
   railway variables set SUPABASE_ANON_KEY=your-key
   railway variables set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Environment Variables Required

```bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
FRONTEND_URL=https://your-frontend.vercel.app
```

## Railway Configuration

Railway automatically detects the build configuration from `package.json`:

- **Build Command**: `npm run build:backend`
- **Start Command**: `npm start`
- **Port**: `3001`

## Custom railway.json

If you need custom configuration, create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build:backend"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Health Checks

Railway will use the `/api/health` endpoint for health checks.

## Logs

View logs:
```bash
railway logs
```

## Estimated Cost

- Starter Plan: $5/month
- Developer Plan: $10/month
- Team Plan: $20/month

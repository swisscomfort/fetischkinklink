# 🎭 SpiegelMatch API - Production-Ready Express.js

Professional, enterprise-grade REST API für Kink-Dating mit 8D Character Generation und 5D Matching Engine.

## ✨ Production Features

### 🔒 Security
- ✅ **Helmet** - Security Headers (CSP, HSTS, X-Frame-Options)
- ✅ **Rate Limiting** - DDoS Protection (100 req/15min global)
- ✅ **CORS** - Cross-Origin Resource Sharing mit Whitelist
- ✅ **Input Sanitization** - XSS Protection
- ✅ **Request IDs** - Distributed Tracing

### 📊 Monitoring & Logging
- ✅ **Winston** - Structured Logging (JSON Format)
- ✅ **Morgan** - HTTP Request Logging
- ✅ **Health Checks** - `/health`, `/health/ready`, `/health/live`
- ✅ **Prometheus Metrics** - `/metrics` Endpoint
- ✅ **Error Tracking** - Centralized Error Handling

### ✅ Validation & Documentation
- ✅ **Zod** - Type-Safe Request Validation
- ✅ **Swagger/OpenAPI** - Auto-Generated API Docs at `/api-docs`
- ✅ **TypeScript** - Full Type Safety
- ✅ **Custom Error Classes** - Structured Error Responses

### ⚡ Performance
- ✅ **Gzip Compression** - Response Compression
- ✅ **Graceful Shutdown** - SIGTERM/SIGINT Handling
- ✅ **Response Timing** - X-Response-Time Header
- ✅ **Connection Pooling** - Supabase Client Optimization

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required variables:**
```bash
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3001`

### 4. View API Documentation

Open browser: `http://localhost:3001/api-docs`

## 📁 Project Structure

```
src/
├── server-production.ts          # Main production server
├── config/
│   ├── logger.ts                 # Winston logger configuration
│   └── swagger.ts                # OpenAPI documentation
├── middleware/
│   ├── security.ts               # Helmet, rate limiting, CORS
│   └── errorHandler.ts           # Error handling & custom errors
├── routes/
│   ├── character.routes.ts       # Character generation endpoints
│   ├── matching.routes.ts        # Matching algorithm endpoints
│   └── taxonomy.routes.ts        # Taxonomy (5,247 tags)
├── validation/
│   └── schemas.ts                # Zod validation schemas
├── health/
│   └── checks.ts                 # Health & monitoring endpoints
└── services/
    ├── characterGenerator8D.ts   # 8D character generation
    ├── matchingEngine.ts         # 5D matching algorithm
    └── supabase.ts               # Database operations
```

## 🔌 API Endpoints

### Character Generation

**POST** `/api/character/generate`
```bash
curl -X POST http://localhost:3001/api/character/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "KinkExplorer",
    "tags": [
      {
        "tagId": "bdsm.bondage.shibari",
        "tagType": "must",
        "intensity": 5,
        "category": "bdsm"
      }
    ],
    "lifestyle": {
      "career": "creative",
      "dailyRhythm": "night owl",
      "relationshipStructure": "polyamorous"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "character": {
    "id": "char_1699564800000_550e8400",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "KinkExplorer",
    "archetype": {
      "name": "🔥 Der wilde Explorer",
      "description": "...",
      "keywords": ["Experimental", "Exhibitionism", "Party"]
    },
    "big5": {
      "extraversion": 75,
      "openness": 85,
      "conscientiousness": 60,
      "agreeableness": 70,
      "neuroticism": 45
    },
    "adjustments": {
      "dominanceLevel": 65,
      "intensityLevel": 80,
      "emotionalDepth": 70,
      "experience": 60,
      "publicness": 75
    }
  },
  "processingTime": 127
}
```

### Matching

**POST** `/api/matching/calculate`
```bash
curl -X POST http://localhost:3001/api/matching/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "userId1": "550e8400-e29b-41d4-a716-446655440000",
    "userId2": "660e8400-e29b-41d4-a716-446655440001"
  }'
```

**Response:**
```json
{
  "success": true,
  "match": {
    "matchId": "match_1699564800000_550e_660e",
    "scores": {
      "overall": 87.5,
      "fetishOverlap": 92,
      "personalityCompat": 78,
      "lifestyleAlignment": 85,
      "valuesAlignment": 90,
      "aestheticHarmony": 82
    },
    "compatibilityLevel": "Excellent",
    "recommendation": "⭐ Hervorragende Übereinstimmung!"
  },
  "processingTime": 45
}
```

### Taxonomy

**GET** `/api/taxonomy`
```bash
curl http://localhost:3001/api/taxonomy
```

**GET** `/api/taxonomy/search?q=bondage&limit=10`
```bash
curl "http://localhost:3001/api/taxonomy/search?q=bondage&limit=10"
```

### Health & Monitoring

**GET** `/health` - Comprehensive health check
**GET** `/health/ready` - Kubernetes readiness probe
**GET** `/health/live` - Kubernetes liveness probe
**GET** `/metrics` - Prometheus metrics

## 🔐 Security Features

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| Character Generation | 10 requests | 1 hour |
| Matching | 50 requests | 1 hour |
| Taxonomy Search | 50 requests | 15 minutes |

### CORS Configuration

Allowed origins:
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (Next.js dev)
- `https://spiegelmatch.com`
- `https://app.spiegelmatch.com`

### Security Headers (Helmet)

- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## 📝 Logging

### Log Levels

- `error` - Kritische Fehler
- `warn` - Warnungen
- `info` - Wichtige Events
- `http` - HTTP Requests
- `debug` - Debug Info

### Log Locations

- **Console**: Alle Logs (colored in dev)
- **logs/error.log**: Nur Errors
- **logs/all.log**: Alle Logs

### Log Format (Production)

```json
{
  "timestamp": "2025-11-10 14:23:45:123",
  "level": "info",
  "message": "Character generated successfully",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "characterId": "char_1699564800000_550e8400",
  "archetype": "🔥 Der wilde Explorer",
  "processingTime": 127
}
```

## 🧪 Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test character generation
npm run test:character

# Test matching
npm run test:matching
```

### Integration Tests (Coming Soon)

```bash
npm test
```

## 🚢 Production Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server-production.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    env_file:
      - .env.production
    restart: unless-stopped
```

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://prod.supabase.co
SUPABASE_ANON_KEY=prod_key
FRONTEND_URL=https://app.spiegelmatch.com
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Monitoring

### Prometheus Setup

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'spiegelmatch-api'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Grafana Dashboard

Import dashboard from: `/grafana/dashboard.json`

Includes:
- Request rate
- Response time (P50, P95, P99)
- Error rate
- Memory usage
- Database connection health

## 🛠️ Development

### Hot Reload

```bash
npm run dev
```

Uses `tsx watch` for instant TypeScript compilation.

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## 📚 API Documentation

Full interactive documentation available at:

**Development:** http://localhost:3001/api-docs  
**Production:** https://api.spiegelmatch.com/api-docs

Includes:
- Request/response schemas
- Authentication requirements
- Example requests
- Try-it-out functionality

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
npm install
```

### Database connection fails

Check `.env` Supabase credentials:
```bash
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

### Rate limit errors in development

Restart server to reset rate limits, or increase limits in `.env`:
```bash
RATE_LIMIT_MAX_REQUESTS=1000
```

### Logs not appearing

Check log level in `.env`:
```bash
LOG_LEVEL=debug
```

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Zod Validation](https://zod.dev/)
- [Swagger/OpenAPI](https://swagger.io/docs/)
- [Helmet Security](https://helmetjs.github.io/)

## 🤝 Contributing

See `CONTRIBUTING.md` for guidelines.

## 📄 License

MIT License - See `LICENSE` file

---

**Built with ❤️ for the kink community**

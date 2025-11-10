# 🎭 SpiegelMatch - Production Ready Setup Guide

## 🚀 Quick Start (5 Minuten)

### 1. **Environment Setup**

Erstelle `.env` Datei im Root:

```bash
# Backend
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=$(openssl rand -hex 32)
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=info
```

### 2. **Datenbank Migrationen**

Die SQL-Migrationen sind in `supabase/migrations/` verfügbar.

**Option A: Supabase CLI**
```bash
npx supabase migration up
```

**Option B: Supabase Dashboard**
1. Öffne dein Supabase Projekt → SQL Editor
2. Kopiere Inhalt von `supabase/migrations/20251109_initial_schema.sql`
3. Führe aus

**Was wird erstellt:**
- ✅ `characters` Tabelle (8D Character Profiles)
- ✅ `matches` Tabelle (Match Results)
- ✅ RLS Policies (Row Level Security)
- ✅ Indexes für Performance
- ✅ Triggers für `updated_at`

### 3. **Installation & Start**

```bash
# Dependencies installieren
npm install

# Backend + Frontend starten
npm run dev:all

# Oder einzeln:
npm run dev          # Backend only (Port 3001)
npm run dev:frontend # Frontend only (Port 5173)
```

### 4. **Integration testen**

```bash
# Test-Script ausführen (Backend muss laufen)
tsx scripts/test-integration.ts
```

Expected Output:
```
✅ Environment Check
✅ Character Generation
✅ Database Connection
✅ Taxonomy API
✅ Health Endpoint
```

---

## 📁 Projekt-Struktur

```
fetischkinklink-main/
├── src/
│   ├── server.ts                      # Express Backend
│   ├── services/
│   │   ├── characterGenerator8D.ts    # 8D Character Engine
│   │   ├── matchingEngine.ts          # 5D Matching Algorithm
│   │   └── supabase.ts                # Database Service
│   ├── routes/                        # API Routes
│   └── middleware/                    # Security & Validation
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── CharacterCreator.tsx   # Character Builder UI
│       │   ├── MatchCard.tsx          # Match Display
│       │   └── Dashboard.tsx          # User Dashboard
│       └── api/
│           └── client.ts              # Backend API Client
│
├── supabase/
│   └── migrations/
│       └── 20251109_initial_schema.sql # DB Schema
│
├── taxonomy-complete.json             # 5.247 Fetisch Tags
└── .env                              # Environment Variables
```

---

## 🔌 API Endpoints

### Character Management

**POST** `/api/character/generate`
```json
{
  "userId": "uuid",
  "username": "string",
  "tags": [
    { "tagId": "T001", "tagName": "Bondage", "tagType": "must" }
  ],
  "lifestyle": {
    "relationshipStyle": "monogamous",
    "experienceLevel": "experienced"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "TestUser",
    "archetype": {
      "name": "🎭 Der Diplomat",
      "icon": "🎭"
    },
    "big5": {
      "openness": 75,
      "conscientiousness": 60,
      "extraversion": 45,
      "agreeableness": 80,
      "neuroticism": 35
    },
    "tags": [...],
    "lifestyle": {...}
  }
}
```

### Matching

**POST** `/api/match/calculate`
```json
{
  "character1": { /* Character8D */ },
  "character2": { /* Character8D */ }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": 82,
    "breakdown": [
      { "dimension": "Fetisch Overlap", "score": 85 },
      { "dimension": "Personality Match", "score": 78 },
      { "dimension": "Lifestyle Fit", "score": 80 },
      { "dimension": "Communication Style", "score": 84 },
      { "dimension": "Experience Balance", "score": 81 }
    ],
    "compatibilityLevel": "Excellent",
    "recommendation": "Sehr hohe Kompatibilität..."
  }
}
```

### Data

**GET** `/api/taxonomy` - Komplette Fetisch-Taxonomie (5.247 Tags)  
**GET** `/api/archetypes` - Character Archetypes  
**GET** `/api/health` - System Health Check

---

## 🗄️ Datenbank Schema

### `characters` Tabelle

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | uuid | Primary Key |
| `user_id` | uuid | FK zu `auth.users` |
| `username` | text | Character Name |
| `big5` | jsonb | Big5 Scores (O,C,E,A,N) |
| `tags` | jsonb | Array von TagSelections |
| `lifestyle` | jsonb | Lifestyle Data |
| `archetype` | text | Character Archetype |
| `adjustments` | jsonb | Manual Adjustments |
| `created_at` | timestamptz | Timestamp |
| `updated_at` | timestamptz | Auto-Update |

### `matches` Tabelle

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | uuid | Primary Key |
| `user1_id` | uuid | FK zu `auth.users` |
| `user2_id` | uuid | FK zu `auth.users` |
| `score` | jsonb | MatchScore Object |
| `compatibility_level` | text | Poor/Okay/Good/Excellent/Perfect |
| `created_at` | timestamptz | Timestamp |

**RLS Policies:**
- Characters: Nur eigener User hat Zugriff
- Matches: Beide Partner können lesen

---

## 🚢 Deployment

### Vercel (Frontend + Backend)

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel

# Production
vercel --prod
```

**vercel.json** ist bereits konfiguriert:
- Backend unter `/api/*`
- Frontend als statische Site
- Environment Variables in Vercel Dashboard setzen

### Railway (Backend)

```bash
# Railway CLI installieren
npm i -g @railway/cli

# Login & Init
railway login
railway init

# Deploy
railway up
```

### Docker

```bash
# Build
docker build -t spiegelmatch .

# Run
docker run -p 3001:3001 --env-file .env spiegelmatch

# Docker Compose
docker-compose up -d
```

---

## 🔐 Security Features

✅ **Row Level Security (RLS)** - Supabase Policies aktiv  
✅ **CORS** - Nur whitelisted Origins  
✅ **Helmet** - Security Headers  
✅ **Rate Limiting** - DoS Prevention  
✅ **Input Validation** - Zod Schemas  
✅ **Error Handling** - Keine Stack Traces in Production  

---

## 📊 Monitoring & Logs

### Supabase Dashboard
- Database Queries
- API Usage
- Performance Metrics

### Backend Logs
```bash
# Development
npm run dev  # Console Logs

# Production
LOG_LEVEL=info npm start
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T...",
  "version": "1.0.0",
  "database": {
    "connected": true,
    "tables": ["characters", "matches"]
  }
}
```

---

## 🧪 Testing

### Integration Tests
```bash
tsx scripts/test-integration.ts
```

### Unit Tests
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Demo Script
```bash
npm run demo  # Generiert 2 Characters + Match
```

---

## 🛠️ Development Tools

### Type Safety
```bash
npm run type-check  # TypeScript Compiler Check
```

### Linting
```bash
npm run lint        # ESLint Check
npm run lint:fix    # Auto-Fix
```

### Formatting
```bash
npm run format      # Prettier Format
```

---

## 📚 Next Steps

1. **Authentication**: Supabase Auth Integration
2. **File Upload**: Avatar Bilder (S3/R2)
3. **Real-time**: Supabase Realtime für Chat
4. **ML Features**: Foto-zu-Fetisch Recognition
5. **Analytics**: User Behavior Tracking

---

## 🐛 Troubleshooting

### Backend startet nicht
```bash
# Check Ports
lsof -i :3001

# Kill existing processes
pkill -f "tsx watch"

# Restart
npm run dev
```

### Frontend lädt nicht
```bash
# Check Vite Port
lsof -i :5173

# Clear cache
rm -rf frontend/dist node_modules/.vite

# Reinstall
npm install
```

### Supabase Connection Error
1. Check `.env` Datei exists
2. Verify `SUPABASE_URL` und `SUPABASE_ANON_KEY`
3. Test connection: `tsx scripts/test-integration.ts`
4. Check Supabase Dashboard → Settings → API

### Migration Fehler
```sql
-- Alle Tabellen droppen (DEV ONLY!)
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.characters CASCADE;

-- Dann Migration erneut ausführen
```

---

## 📞 Support

- **GitHub Issues**: [swisscomfort/fetischkinklink](https://github.com/swisscomfort/fetischkinklink)
- **Dokumentation**: `docs/` Ordner
- **API Docs**: Swagger unter `/api/docs` (planned)

---

## ✨ Features

- ✅ 8D Character Generation (Big5 + Lifestyle)
- ✅ 5D Matching Algorithm (5 Dimensions)
- ✅ 5.247 Fetisch Tags (Taxonomie)
- ✅ Supabase PostgreSQL Database
- ✅ Row Level Security (RLS)
- ✅ TypeScript Full-Stack
- ✅ React + Tailwind Frontend
- ✅ Express Backend
- ✅ Production-Ready Deployment
- ✅ Health Monitoring
- ✅ Integration Tests

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-10  
**License:** MIT

# ⚡ Quick Installation Guide

## 30-Second Setup

```bash
# 1. Unzip
unzip spiegelmatch-complete.zip
cd spiegelmatch

# 2. Install
npm install

# 3. Run Demo
npm run dev scripts/demo.ts
```

Done! 🎉

---

## Full Setup (Production)

### Step 1: Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Backend API (Express)
```bash
npm run dev:api
# Server running on http://localhost:3001
```

### Step 4: Frontend (React - in separate project)
```bash
npm run dev
# UI running on http://localhost:5173
```

### Step 5: Database (Supabase)
- Create Supabase project
- Add connection strings to .env
- Run migrations

---

## Files Overview

```
✅ characterGenerator8D.ts  → Core engine
✅ matchingEngine.ts         → Matching algorithm
✅ demo.ts                   → Working example
✅ taxonomy-complete.json    → All 5,247 tags
✅ README.md                 → Full documentation
✅ IMPLEMENTATION_GUIDE.md   → Setup guide
```

---

## Verify Installation

```bash
# Check Node version (need 18+)
node --version

# Check npm
npm --version

# Install should show:
# added XXX packages
```

---

## Next Steps

1. **Understand**: Read `START_HERE.md`
2. **Explore**: Read `README.md`
3. **Build**: Follow `IMPLEMENTATION_GUIDE.md`

---

## Troubleshooting

**Problem**: `npm command not found`
**Solution**: Install Node.js from nodejs.org

**Problem**: `Module not found`
**Solution**: Run `npm install` again

**Problem**: Port 3001 already in use
**Solution**: Change PORT in `.env`

---

**Version**: 1.0.0  
**Status**: ✅ Ready to Use

Questions? See README.md or IMPLEMENTATION_GUIDE.md

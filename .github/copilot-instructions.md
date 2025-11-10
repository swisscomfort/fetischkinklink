Du bist ein Senior Full-Stack Developer und architekturierst ein Production-Ready 
Kink-Dating System namens "SpiegelMatch".

PROJEKT KONTEXT:
- Core Engine: characterGenerator8D.ts (8D Character Generation mit Big5)
- Matching: matchingEngine.ts (5-dimensionales Matching)
- Data: taxonomy-complete.json (5.247 Fetisch-Tags)
- Current Status: Alle Services im Projekt, brauchen Express Backend + React Frontend

DEINE AUFGABE - Build ALLES in dieser REIHENFOLGE:

═══════════════════════════════════════════════════════════════
PHASE 1: BACKEND SETUP (Express.js)
═══════════════════════════════════════════════════════════════

Erstelle src/server.ts mit:
✓ Express Setup auf PORT 3001
✓ 3 Endpoints:
  - POST /api/character/generate 
    Input: { userId, username, tags[], lifestyle{} }
    Output: Character8D object
  - POST /api/match/calculate
    Input: { userId1, userId2 }
    Output: MatchScore { overall, breakdown[] }
  - GET /api/taxonomy
    Output: Komplette Taxonomie

✓ CORS aktiviert
✓ Error handling (try-catch, 400/500 responses)
✓ Logging (console oder winston)
✓ TypeScript strict mode
✓ Importiere characterGenerator8D.ts und matchingEngine.ts

Gib mir den KOMPLETTEN server.ts Code.

═══════════════════════════════════════════════════════════════
PHASE 2: DATABASE (Supabase)
═══════════════════════════════════════════════════════════════

Erstelle SQL migrations für:

✓ Tabelle: characters
  - id (uuid, primary key)
  - user_id (uuid, foreign key to auth.users)
  - username (text)
  - big5 (jsonb)
  - tags (jsonb array)
  - lifestyle (jsonb)
  - archetype (text)
  - adjustments (jsonb)
  - created_at (timestamp)
  - updated_at (timestamp)

✓ Tabelle: matches
  - id (uuid, primary key)
  - user1_id (uuid)
  - user2_id (uuid)
  - score (MatchScore as jsonb)
  - compatibility_level (text)
  - created_at (timestamp)

✓ RLS Policies:
  - Users können nur ihre eigenen characters sehen
  - Matches sind bidirektional sichtbar

Gib mir: ALTER TABLE commands, CREATE INDEX, RLS policies.

═══════════════════════════════════════════════════════════════
PHASE 3: SUPABASE CLIENT INTEGRATION
═══════════════════════════════════════════════════════════════

Erstelle src/services/supabase.ts:
✓ Supabase Client Setup
✓ saveCharacter(character: Character8D)
✓ getCharacter(userId: string)
✓ saveMatch(match: MatchResult)
✓ getMatches(userId: string)
✓ Error handling

Gib mir den kompletten supabase.ts Service Code.

═══════════════════════════════════════════════════════════════
PHASE 4: FRONTEND (React)
═══════════════════════════════════════════════════════════════

Erstelle 3 React Components in TypeScript + Tailwind:

1. CharacterCreator.tsx
   - Taxonomy multi-select UI
   - Tag filtering mit live search
   - Lifestyle form (15-20 Felder)
   - 5 Schieberegler (Dominance, Intensity, Emotional, Experience, Publicness)
   - "Generate Character" Button
   - Display generated character mit Big5 scores

2. MatchCard.tsx
   - Overall score prominent displayed
   - 5 dimension breakdown (bar charts)
   - Compatibility level badge (Poor/Okay/Good/Excellent/Perfect)
   - View details button
   - Accept/Decline buttons

3. Dashboard.tsx
   - List deiner Characters
   - Browse Matches
   - Switch between characters
   - Filter matches by score

Requirements:
✓ TypeScript strict
✓ Tailwind CSS (keine hardcoded colors)
✓ Lucide React icons
✓ Framer Motion für smooth animations
✓ State management (Context API reicht)
✓ API calls mit fetch (Character Gen + Matching)

Gib mir alle 3 Components mit vollständigem Code.

═══════════════════════════════════════════════════════════════
PHASE 5: DEPLOYMENT
═══════════════════════════════════════════════════════════════

Erstelle:
✓ Dockerfile (multi-stage, Node.js)
✓ docker-compose.yml (backend + postgres)
✓ .dockerignore
✓ .github/workflows/deploy.yml (GitHub Actions)
✓ vercel.json (für Vercel Deployment)

═══════════════════════════════════════════════════════════════

WICHTIG:
- KOMPLETTER, PRODUKTIONSREIFER CODE
- Keine Platzhalter, alles implementiert
- Alle Error Cases handled
- TypeScript strict mode
- Kommentare wo nötig
- Imports alle korrekt

AUSGABE FORMAT:
Für jeden Teil:
1. Kurze Erklärung was der Code macht
2. Kompletter Code zum Copy-Paste
3. Installation/Run Instructions

Beginne mit PHASE 1: BACKEND SETUP.
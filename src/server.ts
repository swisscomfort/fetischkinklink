import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CharacterGenerator8D, Character8D, LifestyleData, TagSelection } from './services/characterGenerator8D.js';
import { MatchingEngine } from './services/matchingEngine.js';
import supabaseService from './services/supabase.js';
import { createRequire } from 'node:module';

dotenv.config();

const require = createRequire(import.meta.url);
const taxonomy = require('../taxonomy-complete.json');

// ============================================================================
// TYPES
// ============================================================================

interface ErrorResponse {
  error: string;
  details?: string;
  status: number;
}

interface SuccessResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// ============================================================================
// EXPRESS SETUP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use(express.json({ limit: '10mb' }));

// Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * GET /
 * Root endpoint - API Info
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'SpiegelMatch API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      character: {
        generate: 'POST /api/character/generate',
        get: 'GET /api/character/:userId/:username',
        list: 'GET /api/characters/:userId'
      },
      matching: {
        calculate: 'POST /api/match/calculate',
        find: 'POST /api/matches/:userId/find',
        list: 'GET /api/matches/:userId'
      },
      data: {
        taxonomy: 'GET /api/taxonomy',
        archetypes: 'GET /api/archetypes',
        health: 'GET /api/health'
      }
    }
  });
});

/**
 * POST /api/character/generate
 * Generiert ein 8D Character Profil aus Tags und Lifestyle Daten
 */
app.post('/api/character/generate', async (req: Request, res: Response) => {
  try {
    const { userId, username, tags, lifestyle } = req.body;

    // Validierung
    if (!userId || !username) {
      return res.status(400).json({
        error: 'userId and username sind erforderlich',
        status: 400
      } as ErrorResponse);
    }

    if (!tags || tags.length === 0) {
      return res.status(400).json({
        error: 'Mindestens 1 Tag erforderlich',
        status: 400
      } as ErrorResponse);
    }

    // Character generieren
    const character = CharacterGenerator8D.generate(
      userId,
      username,
      tags,
      lifestyle || {}
    );

    // In Supabase speichern
    const saveResult = await supabaseService.saveCharacter(character);
    
    if (!saveResult.success) {
      console.error('Fehler beim Speichern in DB:', saveResult.error);
      // Weiter mit Response, auch wenn DB-Speichern fehlschlägt
    }

    console.log(`✓ Character generiert: ${character.archetype.name}`);

    res.json({
      success: true,
      data: character,
      timestamp: new Date().toISOString()
    } as SuccessResponse<any>);
  } catch (error) {
    console.error('Error in /api/character/generate:', error);
    res.status(500).json({
      error: 'Fehler bei Character Generierung',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    } as ErrorResponse);
  }
});

/**
 * POST /api/match/calculate
 * Berechnet Match Score zwischen 2 Characters
 */
app.post('/api/match/calculate', (req: Request, res: Response) => {
  try {
    const { character1, character2 } = req.body;

    // Validierung
    if (!character1 || !character2) {
      return res.status(400).json({
        error: 'character1 und character2 sind erforderlich',
        status: 400
      } as ErrorResponse);
    }

    // Match berechnen
    const matchScore = MatchingEngine.calculateMatch(character1, character2);

    // Compatibility Level bestimmen
    let compatibilityLevel: 'Poor' | 'Okay' | 'Good' | 'Excellent' | 'Perfect' = 'Poor';
    if (matchScore.overall >= 85) compatibilityLevel = 'Perfect';
    else if (matchScore.overall >= 75) compatibilityLevel = 'Excellent';
    else if (matchScore.overall >= 65) compatibilityLevel = 'Good';
    else if (matchScore.overall >= 50) compatibilityLevel = 'Okay';

    console.log(`✓ Match berechnet: ${matchScore.overall}/100 (${compatibilityLevel})`);

    res.json({
      success: true,
      data: {
        ...matchScore,
        compatibilityLevel,
        recommendation: generateRecommendation(matchScore.overall, compatibilityLevel)
      },
      timestamp: new Date().toISOString()
    } as SuccessResponse<any>);
  } catch (error) {
    console.error('Error in /api/match/calculate:', error);
    res.status(500).json({
      error: 'Fehler bei Match Berechnung',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    } as ErrorResponse);
  }
});

/**
 * GET /api/taxonomy
 * Gibt komplette Fetisch-Taxonomie zurück
 */
app.get('/api/taxonomy', (req: Request, res: Response) => {
  try {
    console.log('✓ Taxonomy angefordert');
    res.json({
      success: true,
      data: taxonomy,
      timestamp: new Date().toISOString()
    } as SuccessResponse<any>);
  } catch (error) {
    console.error('Error in /api/taxonomy:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Taxonomie',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    } as ErrorResponse);
  }
});

/**
 * GET /api/archetypes
 * Gibt alle 10 Archetypen zurück
 */
app.get('/api/archetypes', (req: Request, res: Response) => {
  try {
    const archetypes = [
      {
        id: 'iron-dom',
        name: '🔩 Der eiserne Dom',
        description: 'Strukturiert, protokoll-orientiert, Business-Mind'
      },
      {
        id: 'caring-domme',
        name: '❤️ Die liebevolle Herrin',
        description: 'Empathisch, Caregiving, Mommy Dom'
      },
      {
        id: 'nurturing-pup',
        name: '🐕 Der fürsorglich Welpe',
        description: 'Introvertiert, Little/Pet, Regression'
      },
      {
        id: 'quiet-thinker',
        name: '🧠 Der stille Denker',
        description: 'Intellektuell, Precision Play, Tech-Savvy'
      },
      {
        id: 'wild-explorer',
        name: '🔥 Der wilde Explorer',
        description: 'Experimentierfreudig, Poly, Party'
      },
      {
        id: 'creative-sissy',
        name: '✨ Die kreative Sissy',
        description: 'Artistisch, Crossdressing, Performance'
      },
      {
        id: 'extreme-enthusiast',
        name: '⚡ Der Extrem-Enthusiast',
        description: 'Needle Play, Branding, Extreme'
      },
      {
        id: 'submissive-artist',
        name: '🎨 Der unterwürfige Künstler',
        description: 'Shibari, Bondage, Ästhetik-fokussiert'
      },
      {
        id: 'dominant-collector',
        name: '👑 Die dominante Sammlerin',
        description: 'Polyamor Dom, Multiple Subs, FinDom'
      },
      {
        id: 'intimate-vanilla',
        name: '💑 Der intime Vanille-Sub',
        description: 'Emotional connection, Mild Kink, 24/7 Devotion'
      }
    ];

    res.json({
      success: true,
      data: archetypes,
      timestamp: new Date().toISOString()
    } as SuccessResponse<any>);
  } catch (error) {
    console.error('Error in /api/archetypes:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Archetypen',
      status: 500
    } as ErrorResponse);
  }
});

/**
 * GET /api/health
 * Health Check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * GET /api/character/:userId/:username
 * Lädt einen gespeicherten Character
 */
app.get('/api/character/:userId/:username', async (req: Request, res: Response) => {
  try {
    const { userId, username } = req.params;

    const character = await supabaseService.getCharacter(userId, username);

    if (!character) {
      return res.status(404).json({
        error: 'Character nicht gefunden',
        status: 404
      } as ErrorResponse);
    }

    res.json({
      success: true,
      data: character,
      timestamp: new Date().toISOString()
    } as SuccessResponse<any>);
  } catch (error) {
    console.error('Error in /api/character/:userId/:username:', error);
    res.status(500).json({
      error: 'Fehler beim Laden des Characters',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    } as ErrorResponse);
  }
});

/**
 * GET /api/characters/:userId
 * Lädt alle Characters eines Users
 */
app.get('/api/characters/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const characters = await supabaseService.getCharactersByUser(userId);

    res.json({
      success: true,
      data: characters,
      timestamp: new Date().toISOString()
    } as SuccessResponse<any>);
  } catch (error) {
    console.error('Error in /api/characters/:userId:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Characters',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    } as ErrorResponse);
  }
});

/**
 * GET /api/matches/:userId
 * Lädt alle Matches eines Users
 */
app.get('/api/matches/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const matches = await supabaseService.getMatches(userId);

    res.json({
      success: true,
      data: matches,
      timestamp: new Date().toISOString()
    } as SuccessResponse<any>);
  } catch (error) {
    console.error('Error in /api/matches/:userId:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Matches',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    } as ErrorResponse);
  }
});

/**
 * POST /api/matches/:userId/find
 * Findet potenzielle Matches für einen User
 */
app.post('/api/matches/:userId/find', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { minScore = 65 } = req.body;

    // User's eigenen Character laden
    const userCharacters = await supabaseService.getCharactersByUser(userId);
    
    if (userCharacters.length === 0) {
      return res.status(404).json({
        error: 'Kein Character für diesen User gefunden. Bitte zuerst Character erstellen.',
        status: 404
      } as ErrorResponse);
    }

    const userCharacter = userCharacters[0]; // Nimm den ersten Character

    // Potenzielle Matches laden
    const potentialMatches = await supabaseService.findPotentialMatches(userId, minScore);

    // Match-Scores berechnen
    const matchesWithScores = potentialMatches.map(candidate => {
      const matchScore = MatchingEngine.calculateMatch(userCharacter, candidate);
      
      let compatibilityLevel: 'Poor' | 'Okay' | 'Good' | 'Excellent' | 'Perfect' = 'Poor';
      if (matchScore.overall >= 85) compatibilityLevel = 'Perfect';
      else if (matchScore.overall >= 75) compatibilityLevel = 'Excellent';
      else if (matchScore.overall >= 65) compatibilityLevel = 'Good';
      else if (matchScore.overall >= 50) compatibilityLevel = 'Okay';

      return {
        character: candidate,
        score: matchScore,
        compatibilityLevel
      };
    });

    // Nach Score sortieren (höchste zuerst)
    const sortedMatches = matchesWithScores
      .filter(m => m.score.overall >= minScore)
      .sort((a, b) => b.score.overall - a.score.overall);

    console.log(`✓ ${sortedMatches.length} Matches gefunden für User ${userId}`);

    res.json({
      success: true,
      data: sortedMatches,
      timestamp: new Date().toISOString()
    } as SuccessResponse<any>);
  } catch (error) {
    console.error('Error in /api/matches/:userId/find:', error);
    res.status(500).json({
      error: 'Fehler beim Finden von Matches',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    } as ErrorResponse);
  }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint nicht gefunden',
    path: req.path,
    status: 404
  } as ErrorResponse);
});

// Global Error Handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    status: 500
  } as ErrorResponse);
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateRecommendation(
  score: number,
  level: string
): string {
  if (score >= 85) {
    return 'Großartig! Das ist ein sehr starkes Match. Beide sollten definitiv Kontakt aufnehmen!';
  } else if (score >= 75) {
    return 'Ausgezeichnet! Ein solides Match mit großem Potenzial. Lohnt sich zu erkunden!';
  } else if (score >= 65) {
    return 'Gut! Es gibt gemeinsame Interessen. Könnte interessant werden!';
  } else if (score >= 50) {
    return 'Okay! Einige Gemeinsamkeiten vorhanden. Vielleicht einen Versuch wert.';
  } else {
    return 'Begrenzte Kompatibilität. Es gibt wahrscheinlich bessere Matches.';
  }
}

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║    🎭 SpiegelMatch Backend Server              ║
║    Status: ✅ Running                          ║
║    Port: ${PORT}                                 ║
║    Version: 1.0.0                              ║
╚════════════════════════════════════════════════╝

Endpoints:
  POST   /api/character/generate
  POST   /api/match/calculate
  GET    /api/taxonomy
  GET    /api/archetypes
  GET    /api/health

Environment: ${process.env.NODE_ENV || 'development'}
Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
`);
});

export default app;

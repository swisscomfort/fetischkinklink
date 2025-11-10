// Character Generation Service - Encore.ts Migration
// Handles 8D character generation with Big5 personality model

import { api } from "encore.dev/api";
import { Big5Calculator, ArchetypeGenerator } from "./generator";
import type { 
  TagSelection, 
  LifestyleData, 
  Character8D, 
  Big5Scores 
} from "./types";

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface GenerateCharacterRequest {
  userId: string;
  username: string;
  tags: TagSelection[];
  lifestyle: LifestyleData;
  adjustments?: {
    dominanceLevel?: number;
    intensityLevel?: number;
    emotionalDepth?: number;
    experience?: number;
    publicness?: number;
  };
}

interface GenerateCharacterResponse {
  character: Character8D;
  processingTime: number;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Generate a new 8D character profile from user inputs
 * 
 * This endpoint:
 * 1. Calculates Big5 personality from fetish tags
 * 2. Determines archetype from Big5 + lifestyle
 * 3. Applies user adjustments (sliders)
 * 4. Returns complete Character8D object
 */
export const generate = api(
  { expose: true, method: "POST", path: "/character/generate" },
  async (req: GenerateCharacterRequest): Promise<GenerateCharacterResponse> => {
    const startTime = Date.now();

    // Validate input
    if (!req.userId || !req.username || !req.tags || req.tags.length === 0) {
      throw new Error("Missing required fields: userId, username, or tags");
    }

    // Step 1: Calculate Big5 from tags
    const big5: Big5Scores = Big5Calculator.calculateFromTags(req.tags);

    // Step 2: Determine archetype
    const archetype = ArchetypeGenerator.determineArchetype(big5, req.lifestyle);

    // Step 3: Calculate base adjustments from lifestyle + Big5
    const baseAdjustments = Big5Calculator.lifestyleToAdjustments(
      big5,
      req.lifestyle
    );

    // Step 4: Merge with user overrides
    const finalAdjustments = {
      dominanceLevel: req.adjustments?.dominanceLevel ?? baseAdjustments.dominanceLevel ?? 50,
      intensityLevel: req.adjustments?.intensityLevel ?? baseAdjustments.intensityLevel ?? 50,
      emotionalDepth: req.adjustments?.emotionalDepth ?? baseAdjustments.emotionalDepth ?? 50,
      experience: req.adjustments?.experience ?? baseAdjustments.experience ?? 50,
      publicness: req.adjustments?.publicness ?? baseAdjustments.publicness ?? 50,
    };

    // Step 5: Build tag summary
    const tagsSummary = {
      mustHaves: req.tags.filter(t => t.tagType === 'must').map(t => t.tagId),
      niceToHaves: req.tags.filter(t => t.tagType === 'nice').map(t => t.tagId),
      totalTags: req.tags.length,
    };

    // Step 6: Generate personality labels
    const personality = {
      extraversion: big5.extraversion > 70 ? 'Extrovert' : big5.extraversion < 30 ? 'Introvert' : 'Ambivert',
      openness: big5.openness > 70 ? 'Very Open' : big5.openness < 30 ? 'Traditional' : 'Balanced',
      conscientiousness: big5.conscientiousness > 70 ? 'Organized' : big5.conscientiousness < 30 ? 'Spontaneous' : 'Flexible',
      agreeableness: big5.agreeableness > 70 ? 'Compassionate' : big5.agreeableness < 30 ? 'Assertive' : 'Balanced',
      neuroticism: big5.neuroticism > 70 ? 'Sensitive' : big5.neuroticism < 30 ? 'Resilient' : 'Stable',
    };

    // Step 7: Generate profile description
    const generatedProfile = {
      shortBio: `${req.username} - ${archetype.name}`,
      longDescription: archetype.description,
      keywords: archetype.keywords,
    };

    // Step 8: Construct final character
    const character: Character8D = {
      id: `char_${Date.now()}_${req.userId.slice(0, 8)}`,
      userId: req.userId,
      username: req.username,
      tags: req.tags,
      tagsSummary,
      big5,
      personality,
      lifestyle: req.lifestyle,
      archetype: {
        name: archetype.name,
        description: archetype.description,
        keywords: archetype.keywords,
        compatibility: 85, // Default, will be calculated in matching
      },
      generatedProfile,
      adjustments: finalAdjustments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const processingTime = Date.now() - startTime;

    return {
      character,
      processingTime,
    };
  }
);

/**
 * Get character by ID
 */
export const get = api(
  { expose: true, method: "GET", path: "/character/:id" },
  async ({ id }: { id: string }): Promise<{ character: Character8D | null }> => {
    // TODO: Implement database lookup via Supabase
    // For now, return null - will be implemented in database migration phase
    return { character: null };
  }
);

/**
 * Update character adjustments (sliders)
 */
export const updateAdjustments = api(
  { expose: true, method: "PATCH", path: "/character/:id/adjustments" },
  async (req: { 
    id: string; 
    adjustments: Character8D['adjustments'] 
  }): Promise<{ success: boolean }> => {
    // TODO: Implement database update via Supabase
    return { success: true };
  }
);

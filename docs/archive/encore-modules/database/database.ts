// Database Service - Encore.ts Migration with Supabase
// Handles all database operations for characters and matches

import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Character8D } from "../character/types";
import type { MatchResult } from "../matching/matching";

// ============================================================================
// SECRETS CONFIGURATION
// ============================================================================

const supabaseUrl = secret("SupabaseURL");
const supabaseKey = secret("SupabaseAnonKey");

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(supabaseUrl(), supabaseKey());
  }
  return supabase;
}

// ============================================================================
// CHARACTER OPERATIONS
// ============================================================================

interface SaveCharacterRequest {
  character: Character8D;
}

interface SaveCharacterResponse {
  success: boolean;
  characterId: string;
}

/**
 * Save a character to the database
 */
export const saveCharacter = api(
  { expose: true, method: "POST", path: "/database/character" },
  async (req: SaveCharacterRequest): Promise<SaveCharacterResponse> => {
    const client = getSupabaseClient();
    const { character } = req;

    const { data, error } = await client
      .from('characters')
      .upsert({
        id: character.id,
        user_id: character.userId,
        username: character.username,
        big5: character.big5,
        tags: character.tags,
        lifestyle: character.lifestyle,
        archetype: character.archetype.name,
        adjustments: character.adjustments,
        created_at: character.createdAt,
        updated_at: character.updatedAt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save character: ${error.message}`);
    }

    return {
      success: true,
      characterId: data.id,
    };
  }
);

/**
 * Get a character by ID
 */
export const getCharacter = api(
  { expose: true, method: "GET", path: "/database/character/:id" },
  async ({ id }: { id: string }): Promise<{ character: Character8D | null }> => {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return { character: null };
    }

    // Transform database row to Character8D
    const character: Character8D = {
      id: data.id,
      userId: data.user_id,
      username: data.username,
      tags: data.tags,
      tagsSummary: {
        mustHaves: data.tags.filter((t: any) => t.tagType === 'must').map((t: any) => t.tagId),
        niceToHaves: data.tags.filter((t: any) => t.tagType === 'nice').map((t: any) => t.tagId),
        totalTags: data.tags.length,
      },
      big5: data.big5,
      personality: {
        extraversion: data.big5.extraversion > 70 ? 'Extrovert' : data.big5.extraversion < 30 ? 'Introvert' : 'Ambivert',
        openness: data.big5.openness > 70 ? 'Very Open' : data.big5.openness < 30 ? 'Traditional' : 'Balanced',
        conscientiousness: data.big5.conscientiousness > 70 ? 'Organized' : 'Flexible',
        agreeableness: data.big5.agreeableness > 70 ? 'Compassionate' : 'Assertive',
        neuroticism: data.big5.neuroticism > 70 ? 'Sensitive' : 'Resilient',
      },
      lifestyle: data.lifestyle,
      archetype: {
        name: data.archetype,
        description: '',
        keywords: [],
        compatibility: 85,
      },
      generatedProfile: {
        shortBio: `${data.username} - ${data.archetype}`,
        longDescription: '',
        keywords: [],
      },
      adjustments: data.adjustments,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { character };
  }
);

/**
 * Get all characters for a user
 */
export const getUserCharacters = api(
  { expose: true, method: "GET", path: "/database/user/:userId/characters" },
  async ({ userId }: { userId: string }): Promise<{ characters: Character8D[] }> => {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { characters: [] };
    }

    // Transform rows to Character8D
    const characters = data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      tags: row.tags,
      tagsSummary: {
        mustHaves: row.tags.filter((t: any) => t.tagType === 'must').map((t: any) => t.tagId),
        niceToHaves: row.tags.filter((t: any) => t.tagType === 'nice').map((t: any) => t.tagId),
        totalTags: row.tags.length,
      },
      big5: row.big5,
      personality: {
        extraversion: row.big5.extraversion > 70 ? 'Extrovert' : 'Ambivert',
        openness: row.big5.openness > 70 ? 'Very Open' : 'Balanced',
        conscientiousness: row.big5.conscientiousness > 70 ? 'Organized' : 'Flexible',
        agreeableness: row.big5.agreeableness > 70 ? 'Compassionate' : 'Assertive',
        neuroticism: row.big5.neuroticism > 70 ? 'Sensitive' : 'Resilient',
      },
      lifestyle: row.lifestyle,
      archetype: {
        name: row.archetype,
        description: '',
        keywords: [],
        compatibility: 85,
      },
      generatedProfile: {
        shortBio: `${row.username} - ${row.archetype}`,
        longDescription: '',
        keywords: [],
      },
      adjustments: row.adjustments,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { characters };
  }
);

// ============================================================================
// MATCH OPERATIONS
// ============================================================================

interface SaveMatchRequest {
  match: MatchResult;
}

interface SaveMatchResponse {
  success: boolean;
  matchId: string;
}

/**
 * Save a match result to the database
 */
export const saveMatch = api(
  { expose: true, method: "POST", path: "/database/match" },
  async (req: SaveMatchRequest): Promise<SaveMatchResponse> => {
    const client = getSupabaseClient();
    const { match } = req;

    const { data, error } = await client
      .from('matches')
      .insert({
        id: match.matchId,
        user1_id: match.user1Id,
        user2_id: match.user2Id,
        score: match.scores,
        compatibility_level: match.compatibilityLevel,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save match: ${error.message}`);
    }

    return {
      success: true,
      matchId: data.id,
    };
  }
);

/**
 * Get matches for a user
 */
export const getUserMatches = api(
  { expose: true, method: "GET", path: "/database/user/:userId/matches" },
  async ({ userId }: { userId: string }): Promise<{ matches: MatchResult[] }> => {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { matches: [] };
    }

    const matches: MatchResult[] = data.map((row: any) => ({
      matchId: row.id,
      user1Id: row.user1_id,
      user2Id: row.user2_id,
      scores: row.score,
      compatibilityLevel: row.compatibility_level,
      recommendation: '', // Not stored in DB
    }));

    return { matches };
  }
);

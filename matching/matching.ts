// Matching Engine Service - Encore.ts Migration
// Calculates 5-dimensional compatibility scores between characters

import { api } from "encore.dev/api";
import type { Character8D } from "../character/types";

// ============================================================================
// TYPES
// ============================================================================

export interface MatchScore {
  overall: number; // 0-100
  fetishOverlap: number; // 40% weight
  personalityCompat: number; // 15% weight
  lifestyleAlignment: number; // 20% weight
  valuesAlignment: number; // 15% weight
  aestheticHarmony: number; // 10% weight
  breakdown: {
    label: string;
    score: number;
    weight: number;
  }[];
}

export interface MatchResult {
  matchId: string;
  user1Id: string;
  user2Id: string;
  scores: MatchScore;
  compatibilityLevel: 'Poor' | 'Okay' | 'Good' | 'Excellent' | 'Perfect';
  recommendation: string;
}

interface CalculateMatchRequest {
  character1: Character8D;
  character2: Character8D;
}

interface CalculateMatchResponse {
  match: MatchResult;
  processingTime: number;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Calculate compatibility score between two characters
 * 
 * Uses 5-dimensional matching algorithm:
 * - Fetish Overlap (40%)
 * - Personality Compatibility (15%)
 * - Lifestyle Alignment (20%)
 * - Values Alignment (15%)
 * - Aesthetic Harmony (10%)
 */
export const calculate = api(
  { expose: true, method: "POST", path: "/matching/calculate" },
  async (req: CalculateMatchRequest): Promise<CalculateMatchResponse> => {
    const startTime = Date.now();

    const { character1, character2 } = req;

    // Calculate each dimension
    const fetishOverlap = calculateFetishOverlap(
      character1.tags,
      character2.tags
    );

    const personalityCompat = calculatePersonalityCompatibility(
      character1.big5,
      character2.big5
    );

    const lifestyleAlignment = calculateLifestyleAlignment(
      character1.lifestyle,
      character2.lifestyle
    );

    const valuesAlignment = calculateValuesAlignment(
      character1.lifestyle,
      character2.lifestyle
    );

    const aestheticHarmony = calculateAestheticHarmony(
      character1.lifestyle,
      character2.lifestyle
    );

    // Weighted overall score
    const weights = {
      fetishOverlap: 0.40,
      personalityCompat: 0.15,
      lifestyleAlignment: 0.20,
      valuesAlignment: 0.15,
      aestheticHarmony: 0.10,
    };

    const overall =
      fetishOverlap * weights.fetishOverlap +
      personalityCompat * weights.personalityCompat +
      lifestyleAlignment * weights.lifestyleAlignment +
      valuesAlignment * weights.valuesAlignment +
      aestheticHarmony * weights.aestheticHarmony;

    const scores: MatchScore = {
      overall: Math.round(overall * 100) / 100,
      fetishOverlap,
      personalityCompat,
      lifestyleAlignment,
      valuesAlignment,
      aestheticHarmony,
      breakdown: [
        { label: 'Fetish Overlap', score: fetishOverlap, weight: 40 },
        { label: 'Personality', score: personalityCompat, weight: 15 },
        { label: 'Lifestyle', score: lifestyleAlignment, weight: 20 },
        { label: 'Values', score: valuesAlignment, weight: 15 },
        { label: 'Aesthetic', score: aestheticHarmony, weight: 10 },
      ],
    };

    // Determine compatibility level
    let compatibilityLevel: MatchResult['compatibilityLevel'];
    let recommendation: string;

    if (overall >= 85) {
      compatibilityLevel = 'Perfect';
      recommendation = '💯 Soulmate-Level! Ihr beide solltet sofort matchen!';
    } else if (overall >= 70) {
      compatibilityLevel = 'Excellent';
      recommendation = '⭐ Hervorragende Übereinstimmung! Das könnte richtig gut werden.';
    } else if (overall >= 55) {
      compatibilityLevel = 'Good';
      recommendation = '👍 Gute Basis! Mit offener Kommunikation klappt das.';
    } else if (overall >= 40) {
      compatibilityLevel = 'Okay';
      recommendation = '🤔 Okay-ish. Einige Überschneidungen, aber auch Unterschiede.';
    } else {
      compatibilityLevel = 'Poor';
      recommendation = '❌ Wenig Übereinstimmung. Besser andere Profile suchen.';
    }

    const match: MatchResult = {
      matchId: `match_${Date.now()}_${character1.userId.slice(0, 4)}_${character2.userId.slice(0, 4)}`,
      user1Id: character1.userId,
      user2Id: character2.userId,
      scores,
      compatibilityLevel,
      recommendation,
    };

    const processingTime = Date.now() - startTime;

    return {
      match,
      processingTime,
    };
  }
);

// ============================================================================
// MATCHING ALGORITHMS
// ============================================================================

/**
 * Calculate fetish tag overlap (40% weight)
 */
function calculateFetishOverlap(
  tags1: Character8D['tags'],
  tags2: Character8D['tags']
): number {
  if (tags1.length === 0 || tags2.length === 0) return 0;

  const user1TagIds = new Set(tags1.map(t => t.tagId));
  const user2TagIds = new Set(tags2.map(t => t.tagId));

  // Exact matches
  const exactMatches = [...user1TagIds].filter(id => user2TagIds.has(id)).length;

  // Must-have compatibility
  const user1Musts = tags1.filter(t => t.tagType === 'must').map(t => t.tagId);
  const user2Musts = tags2.filter(t => t.tagType === 'must').map(t => t.tagId);
  
  const mustMatchCount = user1Musts.filter(id => user2TagIds.has(id)).length;
  const mustRequiredCount = Math.max(user1Musts.length, user2Musts.length);

  // Scoring
  const exactScore = (exactMatches / Math.max(user1TagIds.size, user2TagIds.size)) * 60;
  const mustScore = mustRequiredCount > 0 ? (mustMatchCount / mustRequiredCount) * 40 : 20;

  return Math.min(100, exactScore + mustScore);
}

/**
 * Calculate Big5 personality compatibility (15% weight)
 */
function calculatePersonalityCompatibility(
  big51: Character8D['big5'],
  big52: Character8D['big5']
): number {
  const dimensions = ['extraversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'] as const;
  
  let totalDiff = 0;
  for (const dim of dimensions) {
    const diff = Math.abs(big51[dim] - big52[dim]);
    totalDiff += diff;
  }

  const avgDiff = totalDiff / dimensions.length;
  const score = Math.max(0, 100 - avgDiff);
  
  return score;
}

/**
 * Calculate lifestyle alignment (20% weight)
 */
function calculateLifestyleAlignment(
  lifestyle1: Character8D['lifestyle'],
  lifestyle2: Character8D['lifestyle']
): number {
  let matches = 0;
  let total = 0;

  const fields = [
    'housing',
    'dailyRhythm',
    'energyLevel',
    'diet',
    'fitness',
    'smoking',
    'alcohol',
  ] as const;

  for (const field of fields) {
    if (lifestyle1[field] && lifestyle2[field]) {
      total++;
      if (lifestyle1[field] === lifestyle2[field]) {
        matches++;
      }
    }
  }

  return total > 0 ? (matches / total) * 100 : 50;
}

/**
 * Calculate values alignment (15% weight)
 */
function calculateValuesAlignment(
  lifestyle1: Character8D['lifestyle'],
  lifestyle2: Character8D['lifestyle']
): number {
  let matches = 0;
  let total = 0;

  const fields = ['politics', 'spirituality', 'environment', 'wantChildren'] as const;

  for (const field of fields) {
    if (lifestyle1[field] && lifestyle2[field]) {
      total++;
      if (lifestyle1[field] === lifestyle2[field]) {
        matches++;
      }
    }
  }

  return total > 0 ? (matches / total) * 100 : 50;
}

/**
 * Calculate aesthetic harmony (10% weight)
 */
function calculateAestheticHarmony(
  lifestyle1: Character8D['lifestyle'],
  lifestyle2: Character8D['lifestyle']
): number {
  let matches = 0;
  let total = 0;

  const fields = ['fashionStyle', 'hairStyle', 'beard'] as const;

  for (const field of fields) {
    if (lifestyle1[field] && lifestyle2[field]) {
      total++;
      if (lifestyle1[field] === lifestyle2[field]) {
        matches++;
      }
    }
  }

  // Body modifications overlap
  if (lifestyle1.bodyModifications && lifestyle2.bodyModifications) {
    const mods1 = new Set(lifestyle1.bodyModifications);
    const mods2 = new Set(lifestyle2.bodyModifications);
    const overlap = [...mods1].filter(m => mods2.has(m)).length;
    const totalMods = Math.max(mods1.size, mods2.size);
    
    if (totalMods > 0) {
      total++;
      matches += overlap / totalMods;
    }
  }

  return total > 0 ? (matches / total) * 100 : 50;
}

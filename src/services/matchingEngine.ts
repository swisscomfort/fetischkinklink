// src/services/matchingEngine.ts

import { Character8D, Big5Scores } from './characterGenerator8D.js';

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

// ============================================================================
// MATCHING ENGINE
// ============================================================================

export class MatchingEngine {
  /**
   * 1. FETISCH-OVERLAP (40% Gewicht)
   * Berechnet Matching zwischen Fetisch-Tags
   */
  static calculateFetishOverlap(
    user1Tags: Character8D['tags'],
    user2Tags: Character8D['tags']
  ): number {
    if (user1Tags.length === 0 || user2Tags.length === 0) return 0;

    const user1TagIds = new Set(user1Tags.map(t => t.tagId));
    const user2TagIds = new Set(user2Tags.map(t => t.tagId));

    // Exact Matches
    let exactMatches = 0;
    for (const tag of user1TagIds) {
      if (user2TagIds.has(tag)) {
        exactMatches++;
      }
    }

    // Category-Level Matches (z.B. "bdsm.bondage.X" matched mit "bdsm.bondage.Y")
    let categoryMatches = 0;
    for (const tag1 of user1TagIds) {
      const parts1 = tag1.split('.').slice(0, 2).join('.');
      for (const tag2 of user2TagIds) {
        const parts2 = tag2.split('.').slice(0, 2).join('.');
        if (parts1 === parts2 && tag1 !== tag2) {
          categoryMatches++;
        }
      }
    }

    // Must-Have Intersection (wichtig!)
    const user1MustHaves = user1Tags.filter(t => t.tagType === 'must');
    const user2MustHaves = user2Tags.filter(t => t.tagType === 'must');
    let mustHaveMatches = 0;

    for (const tag1 of user1MustHaves) {
      for (const tag2 of user2MustHaves) {
        if (tag1.tagId === tag2.tagId) {
          mustHaveMatches++;
        }
      }
    }

    // Score berechnen
    const exactScore = (exactMatches / Math.max(user1TagIds.size, user2TagIds.size)) * 60;
    const categoryScore = (categoryMatches / Math.max(user1TagIds.size, user2TagIds.size)) * 25;
    const mustHaveScore =
      user1MustHaves.length > 0 && user2MustHaves.length > 0
        ? (mustHaveMatches / Math.min(user1MustHaves.length, user2MustHaves.length)) * 15
        : 0;

    return Math.min(100, exactScore + categoryScore + mustHaveScore);
  }

  /**
   * 2. BIG5 KOMPATIBILITÄT (15% Gewicht)
   * Vergleicht Persönlichkeitsprofile
   */
  static calculatePersonalityCompat(
    user1Big5: Big5Scores,
    user2Big5: Big5Scores
  ): number {
    const dimensions: (keyof Big5Scores)[] = [
      'extraversion',
      'openness',
      'conscientiousness',
      'agreeableness',
      'neuroticism',
    ];

    let totalDiff = 0;

    for (const dim of dimensions) {
      const diff = Math.abs(user1Big5[dim] - user2Big5[dim]);
      
      // Manche Dimensionen sollten ähnlich sein (z.B. conscientiousness)
      // Andere sollten sich komplementieren (z.B. extraversion: intro + extro ist gut)
      const weightedDiff =
        dim === 'conscientiousness' || dim === 'openness'
          ? diff * 1.2 // Similarity valued
          : diff * 0.8; // Complementarity valued

      totalDiff += weightedDiff;
    }

    const avgDiff = totalDiff / dimensions.length;
    const compatibility = Math.max(0, 100 - avgDiff * 1.5);

    return compatibility;
  }

  /**
   * 3. LIFESTYLE ALIGNMENT (20% Gewicht)
   */
  static calculateLifestyleAlignment(
    user1: Character8D,
    user2: Character8D
  ): number {
    let alignmentScore = 0;
    let factors = 0;

    const lifestyle1 = user1.lifestyle;
    const lifestyle2 = user2.lifestyle;

    // Wohnsituation (wichtig für Diskretion)
    if (
      lifestyle1.housing === lifestyle2.housing ||
      (lifestyle1.housing === 'alone' && lifestyle2.housing === 'alone')
    ) {
      alignmentScore += 15;
    } else if (
      (lifestyle1.housing === 'alone' && lifestyle2.housing === 'partner') ||
      (lifestyle1.housing === 'partner' && lifestyle2.housing === 'alone')
    ) {
      alignmentScore += 8;
    }
    factors += 15;

    // Karriere-Stabilität
    if (lifestyle1.career && lifestyle2.career) {
      const careersMatch =
        (lifestyle1.career === lifestyle2.career ? 10 : 3) +
        (lifestyle1.career === 'student' || lifestyle2.career === 'student'
          ? 0
          : 5);
      alignmentScore += careersMatch;
    }
    factors += 10;

    // Tagesrhythmus (wichtig für gemeinsame Sessions)
    if (lifestyle1.dailyRhythm === lifestyle2.dailyRhythm) {
      alignmentScore += 12;
    } else if (
      (lifestyle1.dailyRhythm === 'morning' && lifestyle2.dailyRhythm === 'evening') ||
      (lifestyle1.dailyRhythm === 'evening' && lifestyle2.dailyRhythm === 'morning')
    ) {
      alignmentScore += 0; // Conflict
    } else {
      alignmentScore += 6; // Neutral
    }
    factors += 12;

    // Verfügbarkeit (kontextuell)
    if (lifestyle1.availability === lifestyle2.availability && lifestyle1.availability) {
      alignmentScore += 8;
    }
    factors += 8;

    // Ernährung & Lebensstil
    if (lifestyle1.diet === lifestyle2.diet && lifestyle1.diet) {
      alignmentScore += 5;
    }
    factors += 5;

    // Fitness-Level
    if (lifestyle1.fitness === lifestyle2.fitness && lifestyle1.fitness) {
      alignmentScore += 5;
    }
    factors += 5;

    return (alignmentScore / factors) * 100;
  }

  /**
   * 4. WERTE-ALIGNMENT (15% Gewicht)
   */
  static calculateValuesAlignment(user1: Character8D, user2: Character8D): number {
    let alignmentScore = 0;
    let factors = 0;

    const l1 = user1.lifestyle;
    const l2 = user2.lifestyle;

    // Politische Orientierung
    if (l1.politics && l2.politics) {
      const politicalGap = this.semanticDistance(l1.politics, l2.politics);
      alignmentScore += (1 - politicalGap) * 20;
    }
    factors += 20;

    // Spiritualität
    if (l1.spirituality && l2.spirituality) {
      const spiritualGap = this.semanticDistance(l1.spirituality, l2.spirituality);
      alignmentScore += (1 - spiritualGap) * 15;
    }
    factors += 15;

    // Kinder-Wunsch (dealbreaker!)
    if (l1.wantChildren !== undefined && l2.wantChildren !== undefined) {
      const childrenMatch =
        (l1.wantChildren === l2.wantChildren ? 30 : -40) + 20; // -40 ist dealbreaker, aber +20 baseline
      alignmentScore += Math.max(0, childrenMatch);
    }
    factors += 30;

    // Umweltbewusstsein
    if (l1.environment && l2.environment) {
      const envGap = this.semanticDistance(l1.environment, l2.environment);
      alignmentScore += (1 - envGap) * 10;
    }
    factors += 10;

    // Beziehungsstruktur (mono vs poly)
    if (
      l1.relationshipStructure &&
      l2.relationshipStructure
    ) {
      const structMatch =
        (l1.relationshipStructure === l2.relationshipStructure ? 1 : 0.3) * 25;
      alignmentScore += structMatch;
    }
    factors += 25;

    return (alignmentScore / factors) * 100;
  }

  /**
   * 5. ÄSTHETIK-HARMONIE (10% Gewicht)
   */
  static calculateAestheticHarmony(
    user1: Character8D,
    user2: Character8D
  ): number {
    let harmonyScore = 0;
    let factors = 0;

    const l1 = user1.lifestyle;
    const l2 = user2.lifestyle;

    // Fashion Style
    if (l1.fashionStyle && l2.fashionStyle) {
      const styleMatch =
        l1.fashionStyle === l2.fashionStyle
          ? 15
          : this.aestheticCompatibility(l1.fashionStyle, l2.fashionStyle) * 15;
      harmonyScore += styleMatch;
    }
    factors += 15;

    // Body Modifications
    if (
      l1.bodyModifications &&
      l2.bodyModifications &&
      l1.bodyModifications.length > 0 &&
      l2.bodyModifications.length > 0
    ) {
      const modOverlap = l1.bodyModifications.filter(m =>
        l2.bodyModifications?.includes(m)
      ).length;
      harmonyScore +=
        (modOverlap /
          Math.max(
            l1.bodyModifications.length,
            l2.bodyModifications.length
          )) *
        12;
    }
    factors += 12;

    // Haar-Stil (visuell)
    if (l1.hairStyle && l2.hairStyle) {
      const hairMatch =
        l1.hairStyle === l2.hairStyle
          ? 8
          : this.aestheticCompatibility(l1.hairStyle, l2.hairStyle) * 8;
      harmonyScore += hairMatch;
    }
    factors += 8;

    return (harmonyScore / factors) * 100;
  }

  /**
   * MAIN MATCHING FUNCTION
   */
  static calculateMatch(
    user1: Character8D,
    user2: Character8D
  ): MatchScore {
    const scores = {
      fetishOverlap: this.calculateFetishOverlap(user1.tags, user2.tags),
      personalityCompat: this.calculatePersonalityCompat(user1.big5, user2.big5),
      lifestyleAlignment: this.calculateLifestyleAlignment(user1, user2),
      valuesAlignment: this.calculateValuesAlignment(user1, user2),
      aestheticHarmony: this.calculateAestheticHarmony(user1, user2),
    };

    const weights = {
      fetishOverlap: 0.4,
      personalityCompat: 0.15,
      lifestyleAlignment: 0.2,
      valuesAlignment: 0.15,
      aestheticHarmony: 0.1,
    };

    const overall = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + scores[key as keyof typeof scores] * weight;
    }, 0);

    return {
      overall: Math.round(overall),
      fetishOverlap: Math.round(scores.fetishOverlap),
      personalityCompat: Math.round(scores.personalityCompat),
      lifestyleAlignment: Math.round(scores.lifestyleAlignment),
      valuesAlignment: Math.round(scores.valuesAlignment),
      aestheticHarmony: Math.round(scores.aestheticHarmony),
      breakdown: [
        { label: 'Fetisch-Overlap', score: scores.fetishOverlap, weight: weights.fetishOverlap },
        { label: 'Persönlichkeit', score: scores.personalityCompat, weight: weights.personalityCompat },
        { label: 'Lebensstil', score: scores.lifestyleAlignment, weight: weights.lifestyleAlignment },
        { label: 'Werte', score: scores.valuesAlignment, weight: weights.valuesAlignment },
        { label: 'Ästhetik', score: scores.aestheticHarmony, weight: weights.aestheticHarmony },
      ],
    };
  }

  /**
   * HELPER: Semantic Distance (für Worte wie "links" vs "libertär")
   */
  private static semanticDistance(val1: string, val2: string): number {
    if (val1 === val2) return 0;
    if (!val1 || !val2) return 0.5;

    const semanticMap: Record<string, Record<string, number>> = {
      links: { liberal: 0.3, zentrist: 0.6, konservativ: 1.0 },
      liberal: { links: 0.3, zentrist: 0.4, konservativ: 0.9 },
      zentrist: { links: 0.6, liberal: 0.4, konservativ: 0.6 },
      konservativ: { liberal: 0.9, links: 1.0, zentrist: 0.6 },
    };

    return semanticMap[val1]?.[val2] ?? 0.5;
  }

  /**
   * HELPER: Aesthetic Compatibility
   */
  private static aestheticCompatibility(style1: string, style2: string): number {
    const compatMap: Record<string, Record<string, number>> = {
      goth: { goth: 1.0, grunge: 0.8, alternative: 0.7, punk: 0.6 },
      grunge: { goth: 0.8, grunge: 1.0, alternative: 0.9, punk: 0.5 },
      minimal: { minimal: 1.0, preppy: 0.4, casual: 0.6 },
      boho: { boho: 1.0, hippie: 0.9, minimal: 0.3 },
    };

    return compatMap[style1]?.[style2] ?? 0.4;
  }
}

export default MatchingEngine;

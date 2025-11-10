// Big5 Calculator and Archetype Generator for Character Service

import type { 
  TagSelection, 
  LifestyleData, 
  Big5Scores, 
  ArchetypeProfile,
  Character8D 
} from "./types";

// ============================================================================
// BIG 5 CALCULATOR
// ============================================================================

export class Big5Calculator {
  /**
   * Calculate Big5 personality scores from fetish tags
   * Based on psychological correlations between fetishes and personality traits
   */
  static calculateFromTags(tags: TagSelection[]): Big5Scores {
    const scores: Big5Scores = {
      extraversion: 50,
      openness: 50,
      conscientiousness: 50,
      agreeableness: 50,
      neuroticism: 50,
    };

    // Tag-to-Big5 Mappings (psychology-based)
    const big5Mappings = {
      // EXTRAVERSION: Public activities, exhibitionism, social kink
      extraversion: [
        'public.settings.party',
        'public.activities.remoteControl',
        'public.activities.publicNudity',
        'roleplay.petplay',
        'extreme.transformation',
        'psychological.emotions.euphoria',
      ],
      
      // OPENNESS: Diverse fetishes, transformation, fantasy
      openness: [
        'extreme.vore',
        'extreme.inflation',
        'extreme.transformation',
        'roleplay.ageplay',
        'roleplay.petplay.animals',
        'psychological.emotions.euphoria',
        'roleplay.medicalPlay',
      ],

      // CONSCIENTIOUSNESS: Protocol, structure, 24/7, high protocol
      conscientiousness: [
        'bdsm.domSub.powerDyn.tpe24',
        'bdsm.domSub.powerDyn.highProtocol',
        'context.frequency.always',
        'context.duration.permanent',
        'bdsm.domSub.powerDyn.masterSlave',
        'bodily.saliva',
      ],

      // AGREEABLENESS: Service, caregiving, empathy
      agreeableness: [
        'bdsm.domSub.domStyles.caringDomme',
        'objectification.service',
        'psychological.emotions.caregiving',
        'bdsm.domSub.subStyles.serviceSub',
        'bdsm.domSub.domStyles.serviceTop',
      ],

      // NEUROTICISM: Control, anxiety-sub, fear, shame
      neuroticism: [
        'psychological.emotions.fear',
        'psychological.emotions.shame',
        'psychological.emotions.humiliation',
        'extreme.asphyxiation',
        'bdsm.deprivation.sensory.breathing',
      ],
    };

    // Calculate scores based on tag matches
    for (const [dimension, keywords] of Object.entries(big5Mappings)) {
      const matchCount = tags.filter(t => 
        keywords.some(k => t.tagId.includes(k))
      ).length;
      
      const intensityBoost = tags
        .filter(t => keywords.some(k => t.tagId.includes(k)))
        .reduce((sum, t) => sum + (t.intensity - 3) * 2, 0);

      if (matchCount > 0) {
        const boost = (matchCount * 5) + intensityBoost;
        scores[dimension as keyof Big5Scores] += boost;
      }
    }

    // Normalize to 0-100
    Object.keys(scores).forEach(key => {
      scores[key as keyof Big5Scores] = Math.max(
        0,
        Math.min(100, scores[key as keyof Big5Scores])
      );
    });

    return scores;
  }

  /**
   * Calculate adjustment sliders from Big5 + lifestyle
   */
  static lifestyleToAdjustments(
    big5: Big5Scores,
    lifestyle: LifestyleData
  ): Partial<Character8D['adjustments']> {
    const adjustments: any = {};

    // Dominance Level: extraversion + conscientiousness
    adjustments.dominanceLevel =
      (big5.extraversion * 0.4 + big5.conscientiousness * 0.4) * 0.6 +
      (lifestyle.career === 'business' ? 20 : 0) +
      (lifestyle.communicationStyle === 'direct' ? 15 : 0);

    // Intensity: openness + neuroticism
    adjustments.intensityLevel =
      big5.openness * 0.5 + big5.neuroticism * 0.3;

    // Emotional Depth: agreeableness - neuroticism
    adjustments.emotionalDepth =
      big5.agreeableness * 0.8 - big5.neuroticism * 0.3;

    // Experience: conscientiousness + openness
    adjustments.experience =
      big5.conscientiousness * 0.3 + big5.openness * 0.4;

    // Publicness: extraversion + (inverse) neuroticism
    adjustments.publicness =
      big5.extraversion * 0.7 - big5.neuroticism * 0.4;

    // Normalize to 0-100
    Object.keys(adjustments).forEach(key => {
      adjustments[key] = Math.max(0, Math.min(100, adjustments[key]));
    });

    return adjustments;
  }
}

// ============================================================================
// ARCHETYPE GENERATOR
// ============================================================================

export class ArchetypeGenerator {
  static ARCHETYPES: Record<string, ArchetypeProfile> = {
    ironDom: {
      name: '🔩 Der eiserne Dom',
      description: 'Strukturiert, dominierend, plant alles genau. Du kennst deine Grenzen und Anforderungen, und Sub braucht klare Führung.',
      keywords: ['Impact Play', 'Protocol', 'Struktur', 'Commanding', 'Business-Mind'],
      big5Pattern: {
        extraversion: 'high',
        openness: 'low',
        conscientiousness: 'high',
        agreeableness: 'low',
        neuroticism: 'low',
      },
    },
    caringDomme: {
      name: '❤️ Die liebevolle Herrin',
      description: 'Du kennst dein Herz als Domme: Kontrolle mit Empathie. Dein Sub vertraut dir, weil du ihn/sie verstehst und auffängst.',
      keywords: ['Caregiving', 'Fürsorge', 'Vertrauensvolle Kontrolle', 'DD/lg', 'Aftercare'],
      big5Pattern: {
        extraversion: 'medium',
        openness: 'high',
        conscientiousness: 'high',
        agreeableness: 'high',
        neuroticism: 'low',
      },
    },
    nurturingPup: {
      name: '🐕 Der fürsorglich Welpe',
      description: 'Introvertiert, gefühlvoll, suchst Ruhe in Struktur. Als Petplay/ABDL-Sub tauchst du in Little-Headspace ab und brauchst jemanden, der deine Seele nährt.',
      keywords: ['Petplay', 'ABDL', 'Little', 'Regression', 'Sicherheit suchen', 'Latex'],
      big5Pattern: {
        extraversion: 'low',
        openness: 'high',
        conscientiousness: 'medium',
        agreeableness: 'high',
        neuroticism: 'medium',
      },
    },
    quietThinker: {
      name: '🧠 Der stille Denker',
      description: 'Intellektuell, introvertiert, erforscht Kink durch Theorie und Controlled Stimulation. Dein Play ist präzise, nicht chaotisch.',
      keywords: ['Edging', 'Sensory Deprivation', 'Precision', 'ABDL', 'Tech-Savvy'],
      big5Pattern: {
        extraversion: 'low',
        openness: 'medium',
        conscientiousness: 'high',
        agreeableness: 'medium',
        neuroticism: 'high',
      },
    },
    wildExplorer: {
      name: '🔥 Der wilde Explorer',
      description: 'Offen, experimentierfreudig, extrovertiert. Du testest ständig neue Fetische und liebst die Community-Szene. Struktur ist optional.',
      keywords: ['Experimental', 'Exhibitionism', 'Party', 'Polyamor', 'Abenteuer'],
      big5Pattern: {
        extraversion: 'high',
        openness: 'high',
        conscientiousness: 'low',
        agreeableness: 'medium',
        neuroticism: 'low',
      },
    },
    creativeSissy: {
      name: '✨ Die kreative Sissy',
      description: 'Artistisch, selbstexpressiv, liebst Ästhetik. Dein Crossdressing/Sissy-Spiel ist Kunstform, und der Blick anderer triggert dich.',
      keywords: ['Sissification', 'Crossdressing', 'Fashion', 'Exhibitionism', 'Performance'],
      big5Pattern: {
        extraversion: 'high',
        openness: 'high',
        conscientiousness: 'medium',
        agreeableness: 'low',
        neuroticism: 'medium',
      },
    },
    extremeEnthusiast: {
      name: '⚡ Der Extrem-Enthusiast',
      description: 'Deine Grenzen sind nicht Grenzen, sie sind Startpunkte. Blutspiele, Brandings, und Extreme sind deine Arena. Vertrau mir, nichts schockiert dich.',
      keywords: ['Extreme', 'Needle Play', 'Branding', 'Blood Play', 'No Limits'],
      big5Pattern: {
        extraversion: 'low',
        openness: 'high',
        conscientiousness: 'medium',
        agreeableness: 'low',
        neuroticism: 'high',
      },
    },
    submissiveArtist: {
      name: '🎨 Der unterwürfige Künstler',
      description: 'Du findest Freiheit in Hingabe. Dein Dom/Domme ist Künstler, und dein Körper ist die Leinwand. Shibari, Bondage, Ästhetik.',
      keywords: ['Shibari', 'Bondage', 'Rope', 'Artistic', 'Submission Bliss'],
      big5Pattern: {
        extraversion: 'low',
        openness: 'high',
        conscientiousness: 'medium',
        agreeableness: 'high',
        neuroticism: 'medium',
      },
    },
    dominantCollector: {
      name: '👑 Die dominante Sammlerin',
      description: 'Viele Sub-Partner, verschiedene Arten von Kontrolle. Du bist Polyamor-Dom mit einem Arsenal von Techniken für jeden Sub-Typ.',
      keywords: ['Polyamor', 'Multiple Partners', 'Versatile Dominance', 'FinDom', 'Service Tops'],
      big5Pattern: {
        extraversion: 'high',
        openness: 'high',
        conscientiousness: 'high',
        agreeableness: 'low',
        neuroticism: 'low',
      },
    },
    intimateVanilla: {
      name: '💑 Der intime Vanille-Sub',
      description: 'Du brauchst Verbindung, nicht Intensity. Kink ist dein Ausdruck von Vertrauen mit deinem Partner. 24/7 bedeutet emotionale Tiefe.',
      keywords: ['Relationship', 'Emotional Connection', 'Mild Kink', 'Intimacy', '24/7 Devotion'],
      big5Pattern: {
        extraversion: 'medium',
        openness: 'low',
        conscientiousness: 'high',
        agreeableness: 'high',
        neuroticism: 'low',
      },
    },
  };

  /**
   * Determine archetype from Big5 scores and lifestyle
   */
  static determineArchetype(
    big5: Big5Scores,
    lifestyle: LifestyleData
  ): ArchetypeProfile {
    const scores: Record<string, number> = {};

    for (const [key, archetype] of Object.entries(this.ARCHETYPES)) {
      let score = 0;

      // Big5 matching weights
      const big5Weights = {
        low: (val: number) => (val < 40 ? 30 : Math.abs(val - 30) * -1),
        medium: (val: number) => (val >= 40 && val <= 60 ? 30 : Math.abs(val - 50) * -1),
        high: (val: number) => (val > 60 ? 30 : Math.abs(val - 70) * -1),
      };

      const dimensions = [
        'extraversion',
        'openness',
        'conscientiousness',
        'agreeableness',
        'neuroticism',
      ] as const;

      for (const dim of dimensions) {
        const rangeFunc = big5Weights[archetype.big5Pattern[dim]];
        score += rangeFunc(big5[dim]);
      }

      // Lifestyle bonus
      if (lifestyle.relationshipStructure === 'polyamorous' && key === 'dominantCollector') {
        score += 20;
      }
      if (lifestyle.career === 'creative' && key === 'creativeSissy') {
        score += 15;
      }

      scores[key] = score;
    }

    // Return best match
    const bestMatch = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
    return this.ARCHETYPES[bestMatch[0]];
  }
}

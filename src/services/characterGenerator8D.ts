// src/services/characterGenerator8D.ts

// Taxonomy data wird beim Import geladen
import taxonomyDataRaw from '../../taxonomy-complete.json' with { type: 'json' };
const taxonomyData = taxonomyDataRaw as any;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TagSelection {
  tagId: string;
  tagType: 'must' | 'nice';
  intensity: number; // 1-5
  category: string;
}

export interface LifestyleData {
  // Dimension 2: Lifestyle
  housing?: string;
  career?: string;
  workHours?: string;
  dailyRhythm?: string;
  energyLevel?: string;
  diet?: string;
  fitness?: string;
  bodyRelationship?: string;
  smoking?: string;
  alcohol?: string;
  drugs?: string[];

  // Dimension 3: Intellekt
  education?: string;
  intellectualInterests?: string[];
  mediaConsumption?: {
    literature?: string;
    film?: string;
    gaming?: string;
    music?: string;
  };
  creativity?: string[];

  // Dimension 4: Sozialverhalten
  communicationStyle?: string;
  texting?: string;
  conflictBehavior?: string;
  friendCircle?: string;
  familyRelationship?: string;

  // Dimension 5: Werte
  politics?: string;
  spirituality?: string;
  environment?: string;
  wantChildren?: string;

  // Dimension 6: Beziehungsphilosophie
  relationshipStructure?: string;
  commitment?: string;
  romance?: string;
  jealousy?: string;

  // Dimension 7: Ästhetik
  fashionStyle?: string;
  bodyModifications?: string[];
  hairStyle?: string;
  beard?: string;

  // Dimension 8: Praktisch
  outStatus?: string;
  mobility?: string;
  availability?: string;
}

export interface Big5Scores {
  extraversion: number; // 0-100
  openness: number; // 0-100
  conscientiousness: number; // 0-100
  agreeableness: number; // 0-100
  neuroticism: number; // 0-100
}

export interface Character8D {
  // Basic Info
  id: string;
  userId: string;
  username: string;

  // Fetisch-Profil
  tags: TagSelection[];
  tagsSummary: {
    mustHaves: string[];
    niceToHaves: string[];
    totalTags: number;
  };

  // Big 5 Persönlichkeitsmerkmale
  big5: Big5Scores;

  // 8 Dimensionen
  personality: {
    extraversion: string;
    openness: string;
    conscientiousness: string;
    agreeableness: string;
    neuroticism: string;
  };
  lifestyle: LifestyleData;

  // Archetyp
  archetype: {
    name: string;
    description: string;
    keywords: string[];
    compatibility: number; // 0-100
  };

  // Generierte Beschreibung
  generatedProfile: {
    shortBio: string;
    longDescription: string;
    keywords: string[];
  };

  // Schieberegler-Feinjustierungen
  adjustments: {
    dominanceLevel: number; // 0-100 (Sub --> Dom)
    intensityLevel: number; // 0-100 (Soft --> Hardcore)
    emotionalDepth: number; // 0-100 (Casual --> Soul Mates)
    experience: number; // 0-100 (Newbie --> Veteran)
    publicness: number; // 0-100 (Diskret --> Community)
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// BIG 5 CALCULATOR
// ============================================================================

export class Big5Calculator {
  static calculateFromTags(tags: TagSelection[]): Big5Scores {
    const scores = {
      extraversion: 50,
      openness: 50,
      conscientiousness: 50,
      agreeableness: 50,
      neuroticism: 50,
    };

    // Tag-to-Big5 Mappings (basierend auf Psychologie)
    const big5Mappings = {
      // EXTRAVERSION: Party, Exhibitionismus, Ö public
      extraversion: [
        'public.settings.party',
        'public.activities.remoteControl',
        'public.activities.publicNudity',
        'roleplay.petplay',
        'extreme.transformation',
        'psychological.emotions.euphoria',
      ],
      
      // OPENNESS: Viele verschiedene Fetische, Transformation, Fantasy
      openness: [
        'extreme.vore',
        'extreme.inflation',
        'extreme.transformation',
        'roleplay.ageplay',
        'roleplay.petplay.animals',
        'psychological.emotions.euphoria',
        'roleplay.medicalPlay',
      ],

      // CONSCIENTIOUSNESS: Protocol, Struktur, 24/7, High Protocol
      conscientiousness: [
        'bdsm.domSub.powerDyn.tpe24',
        'bdsm.domSub.powerDyn.highProtocol',
        'context.frequency.always',
        'context.duration.permanent',
        'bdsm.domSub.powerDyn.masterSlave',
        'bodily.saliva',
      ],

      // AGREEABLENESS: Service, Caregiving, Empathy
      agreeableness: [
        'bdsm.domSub.domStyles.caringDomme',
        'objectification.service',
        'psychological.emotions.caregiving',
        'bdsm.domSub.subStyles.serviceSub',
        'bdsm.domSub.domStyles.serviceTop',
      ],

      // NEUROTICISM: Control, Anxiety-sub, Fear, Shame
      neuroticism: [
        'psychological.emotions.fear',
        'psychological.emotions.shame',
        'psychological.emotions.humiliation',
        'extreme.asphyxiation',
        'bdsm.deprivation.sensory.breathing',
      ],
    };

    // Gewichte: -10 (dezimiert), +10 (verstärkt)
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

    // Normalisieren auf 0-100
    Object.keys(scores).forEach(key => {
      scores[key as keyof Big5Scores] = Math.max(
        0,
        Math.min(100, scores[key as keyof Big5Scores])
      );
    });

    return scores;
  }

  static lifestyleToAdjustments(
    big5: Big5Scores,
    lifestyle: LifestyleData
  ): Partial<Character8D['adjustments']> {
    const adjustments: any = {};

    // Dominanz-Level: extraversion + conscientiousness
    adjustments.dominanceLevel =
      (big5.extraversion * 0.4 + big5.conscientiousness * 0.4) * 0.6 +
      (lifestyle.career === 'business' ? 20 : 0) +
      (lifestyle.communicationStyle === 'direct' ? 15 : 0);

    // Intensität: openness + neuroticism
    adjustments.intensityLevel =
      big5.openness * 0.5 + big5.neuroticism * 0.3;

    // Emotional Depth: agreeableness - neuroticism
    adjustments.emotionalDepth =
      big5.agreeableness * 0.8 - big5.neuroticism * 0.3;

    // Erfahrung: conscientiousness + openness
    adjustments.experience =
      big5.conscientiousness * 0.3 + big5.openness * 0.4;

    // Publicness: extraversion + (inverse) neuroticism
    adjustments.publicness =
      big5.extraversion * 0.7 - big5.neuroticism * 0.4;

    // Normalisieren
    Object.keys(adjustments).forEach(key => {
      adjustments[key] = Math.max(0, Math.min(100, adjustments[key]));
    });

    return adjustments;
  }
}

// ============================================================================
// ARCHETYP GENERATOR
// ============================================================================

export interface ArchetypeProfile {
  name: string;
  description: string;
  keywords: string[];
  big5Pattern: {
    extraversion: 'low' | 'medium' | 'high';
    openness: 'low' | 'medium' | 'high';
    conscientiousness: 'low' | 'medium' | 'high';
    agreeableness: 'low' | 'medium' | 'high';
    neuroticism: 'low' | 'medium' | 'high';
  };
}

export class ArchetypeGenerator {
  static ARCHETYPES: Record<string, ArchetypeProfile> = {
    ironDom: {
      name: '🔩 Der eiserne Dom',
      description:
        'Strukturiert, dominierend, plant alles genau. Du kennst deine Grenzen und Anforderungen, und Sub braucht klare Führung.',
      keywords: [
        'Impact Play',
        'Protocol',
        'Struktur',
        'Commanding',
        'Business-Mind',
      ],
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
      description:
        'Du kennst dein Herz als Domme: Kontrolle mit Empathie. Dein Sub vertraut dir, weil du ihn/sie verstehst und auffängst.',
      keywords: [
        'Caregiving',
        'Fürsorge',
        'Vertrauensvolle Kontrolle',
        'DD/lg',
        'Aftercare',
      ],
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
      description:
        'Introvertiert, gefühlvoll, suchst Ruhe in Struktur. Als Petplay/ABDL-Sub tauchst du in Little-Headspace ab und brauchst jemanden, der deine Seele nährt.',
      keywords: [
        'Petplay',
        'ABDL',
        'Little',
        'Regression',
        'Sicherheit suchen',
        'Latex',
      ],
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
      description:
        'Intellektuell, introvertiert, erforscht Kink durch Theorie und Controlled Stimulation. Dein Play ist präzise, nicht chaotisch.',
      keywords: [
        'Edging',
        'Sensory Deprivation',
        'Precision',
        'ABDL',
        'Tech-Savvy',
      ],
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
      description:
        'Offen, experimentierfreudig, extrovertiert. Du testest ständig neue Fetische und liebst die Community-Szene. Struktur ist optional.',
      keywords: [
        'Experimental',
        'Exhibitionism',
        'Party',
        'Polyamor',
        'Abenteuer',
      ],
      big5Pattern: {
        extraversion: 'high',
        openness: 'high',
        conscientiousness: 'low',
        agreeableness: 'medium',
        neuroticism: 'low',
      },
    },
    creativesissy: {
      name: '✨ Die kreative Sissy',
      description:
        'Artistisch, selbstexpressiv, liebst Ästhetik. Dein Crossdressing/Sissy-Spiel ist Kunstform, und der Blick anderer triggert dich.',
      keywords: [
        'Sissification',
        'Crossdressing',
        'Fashion',
        'Exhibitionism',
        'Performance',
      ],
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
      description:
        'Deine Grenzen sind nicht Grenzen, sie sind Startpunkte. Blutspiele, Brandings, und Extreme sind deine Arena. Vertrau mir, nichts schockiert dich.',
      keywords: [
        'Extreme',
        'Needle Play',
        'Branding',
        'Blood Play',
        'No Limits',
      ],
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
      description:
        'Du findest Freiheit in Hingabe. Dein Dom/Domme ist Künstler, und dein Körper ist die Leinwand. Shibari, Bondage, Ästhetik.',
      keywords: [
        'Shibari',
        'Bondage',
        'Rope',
        'Artistic',
        'Submission Bliss',
      ],
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
      description:
        'Viele Sub-Partner, verschiedene Arten von Kontrolle. Du bist Polyamor-Dom mit einem Arsenal von Techniken für jeden Sub-Typ.',
      keywords: [
        'Polyamor',
        'Multiple Partners',
        'Versatile Dominance',
        'FinDom',
        'Service Tops',
      ],
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
      description:
        'Du brauchst Verbindung, nicht Intensity. Kink ist dein Ausdruck von Vertrauen mit deinem Partner. 24/7 bedeutet emotionale Tiefe.',
      keywords: [
        'Relationship',
        'Emotional Connection',
        'Mild Kink',
        'Intimacy',
        '24/7 Devotion',
      ],
      big5Pattern: {
        extraversion: 'medium',
        openness: 'low',
        conscientiousness: 'high',
        agreeableness: 'high',
        neuroticism: 'low',
      },
    },
  };

  static detect(big5: Big5Scores, tags: TagSelection[]): ArchetypeProfile {
    // Scorecard für jeden Archetyp
    const scores: Record<string, number> = {};

    for (const [key, archetype] of Object.entries(this.ARCHETYPES)) {
      let score = 0;

      // Big5-Matching
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
        const rangeFunc =
          big5Weights[archetype.big5Pattern[dim]];
        score += rangeFunc(big5[dim]);
      }

      // Tag-Matching
      const matchedTags = tags.filter(t =>
        archetype.keywords.some(kw =>
          t.tagId.toLowerCase().includes(kw.toLowerCase())
        )
      );
      score += matchedTags.length * 10;

      scores[key] = score;
    }

    // Besten Match zurückgeben
    const bestMatch = Object.entries(scores).sort(
      ([, a], [, b]) => b - a
    )[0];
    return this.ARCHETYPES[bestMatch[0]];
  }
}

// ============================================================================
// CHARACTER DESCRIPTION GENERATOR
// ============================================================================

export class DescriptionGenerator {
  static generate(
    character: Character8D,
    archetype: ArchetypeProfile
  ): string {
    const parts = [];

    // Grundpersönlichkeit
    parts.push(`Du bist ${archetype.name}.`);

    // Fetische zusammenfassen
    const mustHaves = character.tagsSummary.mustHaves.slice(0, 3);
    if (mustHaves.length > 0) {
      parts.push(
        `Deine Must-Haves sind: ${mustHaves.join(', ')}.`
      );
    }

    // Big5 in Worte
    const personalityNarrative = this.big5ToNarrative(character.big5);
    parts.push(personalityNarrative);

    // Lifestyle-Einbindung
    if (character.lifestyle.career) {
      parts.push(
        `Beruflich: ${character.lifestyle.career}. Dein Alltag ist ${
          character.lifestyle.dailyRhythm || 'normal'
        }, aber dein Kink ist dein Fluchtpunkt.`
      );
    }

    // Beziehungs-Philosophie
    if (character.lifestyle.relationshipStructure) {
      parts.push(
        `Beziehungsmäßig suchst du ${character.lifestyle.relationshipStructure}.`
      );
    }

    // Finale Statement
    parts.push(archetype.description);

    return parts.join(' ');
  }

  private static big5ToNarrative(big5: Big5Scores): string {
    const traits = [];

    if (big5.extraversion > 65) {
      traits.push('Du bist extrovertiert, energiegeladen');
    } else if (big5.extraversion < 35) {
      traits.push('Du bist introvertiert, brauchst innere Ruhe');
    } else {
      traits.push('Du bist ambivertiert, flexibel in sozialen Situationen');
    }

    if (big5.openness > 65) {
      traits.push('und offen für neue Erfahrungen');
    } else if (big5.openness < 35) {
      traits.push('und bevorzugst bewährte Wege');
    }

    if (big5.conscientiousness > 65) {
      traits.push('. Struktur und Planung sind dein Freund');
    } else if (big5.conscientiousness < 35) {
      traits.push('. Spontaneität und Flexibilität treiben dich');
    }

    if (big5.agreeableness > 65) {
      traits.push(', und Empathie für deinen Partner ist zentral');
    } else if (big5.agreeableness < 35) {
      traits.push(', aber du lässt dich von anderen nicht leicht beeinflussen');
    }

    if (big5.neuroticism > 65) {
      traits.push('. Intensivere Gefühle sind normal für dich');
    } else if (big5.neuroticism < 35) {
      traits.push('. Du bleibst emotional stabil und ausgeglichen');
    }

    return traits.join('') + '.';
  }
}

// ============================================================================
// MAIN CHARACTER GENERATOR
// ============================================================================

export class CharacterGenerator8D {
  static generate(
    userId: string,
    username: string,
    tags: TagSelection[],
    lifestyle: LifestyleData
  ): Character8D {
    // Calculate Big5
    const big5 = Big5Calculator.calculateFromTags(tags);

    // Detect Archetyp
    const archetype = ArchetypeGenerator.detect(big5, tags);

    // Generate Adjustments
    const adjustments = Big5Calculator.lifestyleToAdjustments(
      big5,
      lifestyle
    ) as Character8D['adjustments'];

    // Generate Description
    const character: Character8D = {
      id: `char_${Date.now()}`,
      userId,
      username,
      tags,
      tagsSummary: {
        mustHaves: tags
          .filter(t => t.tagType === 'must')
          .map(t => t.tagId.split('.').pop() || ''),
        niceToHaves: tags
          .filter(t => t.tagType === 'nice')
          .map(t => t.tagId.split('.').pop() || ''),
        totalTags: tags.length,
      },
      big5,
      personality: {
        extraversion:
          big5.extraversion > 65
            ? 'Extrovertiert'
            : big5.extraversion < 35
              ? 'Introvertiert'
              : 'Ambivertiert',
        openness:
          big5.openness > 65
            ? 'Experimentierfreudig'
            : 'Traditionell',
        conscientiousness:
          big5.conscientiousness > 65
            ? 'Gewissenhaft'
            : 'Spontan',
        agreeableness:
          big5.agreeableness > 65
            ? 'Empathisch'
            : 'Direkt',
        neuroticism:
          big5.neuroticism > 65
            ? 'Emotional intensiv'
            : 'Stabil',
      },
      lifestyle,
      archetype: {
        name: archetype.name,
        description: archetype.description,
        keywords: archetype.keywords,
        compatibility: 85 + Math.random() * 15, // 85-100
      },
      generatedProfile: {
        shortBio: `${archetype.name} (${tags.length} Fetische, ${
          big5.extraversion > 50 ? 'extro' : 'intro'
        }vertiert)`,
        longDescription: DescriptionGenerator.generate(
          {} as Character8D,
          archetype
        ),
        keywords: archetype.keywords,
      },
      adjustments: {
        dominanceLevel: adjustments.dominanceLevel || 50,
        intensityLevel: adjustments.intensityLevel || 50,
        emotionalDepth: adjustments.emotionalDepth || 50,
        experience: adjustments.experience || 50,
        publicness: adjustments.publicness || 50,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return character;
  }
}

export default CharacterGenerator8D;

// Type definitions for Character Generation Service

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

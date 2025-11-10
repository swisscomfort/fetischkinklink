export interface Character8D {
  userId: string;
  username: string;
  big5: Big5Profile;
  selectedTags: TagSelection[];
  lifestyle: LifestyleData;
  archetype: Archetype;
  adjustments: DimensionAdjustments;
  generatedAt: string;
}

export interface Big5Profile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface TagSelection {
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  tagId: string;
  tagName: string;
}

export interface LifestyleData {
  age?: number;
  relationship_status?: string;
  experience_level?: string;
  availability?: string;
  location_type?: string;
  budget?: string;
  living_situation?: string;
  work_schedule?: string;
  fitness_level?: string;
  diet?: string;
  smoking?: boolean;
  drinking?: string;
  languages?: string[];
  interests?: string[];
  music?: string[];
  movies?: string[];
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
}

export interface DimensionAdjustments {
  dominance: number;
  intensity: number;
  emotional: number;
  experience: number;
  publicness: number;
}

export interface MatchScore {
  overall: number;
  breakdown: DimensionScore[];
  compatibilityLevel?: 'Poor' | 'Okay' | 'Good' | 'Excellent' | 'Perfect';
  recommendation?: string;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  subcategories?: TaxonomySubcategory[];
  tags?: TaxonomyTag[];
}

export interface TaxonomySubcategory {
  id: string;
  name: string;
  tags: TaxonomyTag[];
}

export interface TaxonomyTag {
  id: string;
  name: string;
  intensity?: number;
  dominance?: number;
}

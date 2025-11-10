// src/services/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Character8D } from './characterGenerator8D.js';
import type { MatchScore } from './matchingEngine.js';

// ============================================================================
// TYPES
// ============================================================================

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          big5: any;
          tags: any;
          lifestyle: any;
          archetype: string;
          adjustments: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['characters']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['characters']['Insert']>;
      };
      matches: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          score: any;
          compatibility_level: 'Poor' | 'Okay' | 'Good' | 'Excellent' | 'Perfect';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
      };
    };
  };
}

export interface MatchResult {
  id: string;
  user1_id: string;
  user2_id: string;
  score: MatchScore;
  compatibility_level: 'Poor' | 'Okay' | 'Good' | 'Excellent' | 'Perfect';
  created_at: string;
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

class SupabaseService {
  private client: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  SUPABASE_URL und SUPABASE_ANON_KEY nicht gesetzt - läuft im DEMO MODUS ohne Datenbank-Persistenz');
      // Demo-Modus: Erstelle einen Dummy-Client
      this.client = null as any;
    } else {
      this.client = createClient<Database>(supabaseUrl, supabaseKey);
    }
  }

  // ============================================================================
  // CHARACTER OPERATIONS
  // ============================================================================

  /**
   * Speichert ein Character8D Profil in der Datenbank
   */
  async saveCharacter(character: Character8D): Promise<{ success: boolean; error?: string }> {
    try {
      // Demo-Modus: Simuliere erfolgreiche Speicherung
      if (!this.client) {
        console.log(`✓ Character [DEMO] gespeichert: ${character.username}`);
        return { success: true };
      }

      const { data, error } = await this.client
        .from('characters')
        .upsert({
          user_id: character.userId,
          username: character.username,
          big5: character.big5,
          tags: character.tags,
          lifestyle: character.lifestyle,
          archetype: character.archetype.name,
          adjustments: character.adjustments
        }, {
          onConflict: 'user_id,username'
        })
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Speichern des Characters:', error);
        return { success: false, error: error.message };
      }

      console.log(`✓ Character gespeichert: ${data.id}`);
      return { success: true };
    } catch (error) {
      console.error('Exception beim Speichern:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Lädt ein Character-Profil für einen User
   */
  async getCharacter(userId: string, username: string): Promise<Character8D | null> {
    try {
      const { data, error } = await this.client
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .eq('username', username)
        .single();

      if (error || !data) {
        console.error('Character nicht gefunden:', error);
        return null;
      }

      // Konvertiere DB-Format zurück zu Character8D
      const character: Character8D = {
        id: data.id,
        userId: data.user_id,
        username: data.username,
        tags: data.tags,
        tagsSummary: {
          mustHaves: data.tags.filter((t: any) => t.tagType === 'must').map((t: any) => t.tagId),
          niceToHaves: data.tags.filter((t: any) => t.tagType === 'nice').map((t: any) => t.tagId),
          totalTags: data.tags.length
        },
        big5: data.big5,
        personality: this.derivePersonality(data.big5),
        lifestyle: data.lifestyle,
        intellect: data.lifestyle,
        social: data.lifestyle,
        values: data.lifestyle,
        relationship: data.lifestyle,
        aesthetic: data.lifestyle,
        practical: data.lifestyle,
        archetype: {
          id: data.archetype.toLowerCase().replace(/\s+/g, '-'),
          name: data.archetype,
          icon: this.extractIcon(data.archetype),
          englishName: ''
        },
        adjustments: data.adjustments,
        generatedProfile: {
          shortBio: `${this.extractIcon(data.archetype)} ${data.archetype}`,
          longDescription: '',
          keywords: []
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return character;
    } catch (error) {
      console.error('Exception beim Laden des Characters:', error);
      return null;
    }
  }

  /**
   * Lädt alle Characters eines Users
   */
  async getCharactersByUser(userId: string): Promise<Character8D[]> {
    try {
      const { data, error } = await this.client
        .from('characters')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) {
        console.error('Characters nicht gefunden:', error);
        return [];
      }

      return data.map(char => this.dbRowToCharacter(char));
    } catch (error) {
      console.error('Exception beim Laden der Characters:', error);
      return [];
    }
  }

  /**
   * Löscht einen Character
   */
  async deleteCharacter(userId: string, username: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.client
        .from('characters')
        .delete()
        .eq('user_id', userId)
        .eq('username', username);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // ============================================================================
  // MATCH OPERATIONS
  // ============================================================================

  /**
   * Speichert ein Match-Ergebnis
   */
  async saveMatch(
    user1Id: string,
    user2Id: string,
    score: MatchScore,
    compatibilityLevel: 'Poor' | 'Okay' | 'Good' | 'Excellent' | 'Perfect'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.client
        .from('matches')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          score,
          compatibility_level: compatibilityLevel
        })
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Speichern des Matches:', error);
        return { success: false, error: error.message };
      }

      console.log(`✓ Match gespeichert: ${data.id}`);
      return { success: true };
    } catch (error) {
      console.error('Exception beim Speichern des Matches:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Lädt alle Matches für einen User
   */
  async getMatches(userId: string): Promise<MatchResult[]> {
    try {
      const { data, error } = await this.client
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Matches nicht gefunden:', error);
        return [];
      }

      return data as MatchResult[];
    } catch (error) {
      console.error('Exception beim Laden der Matches:', error);
      return [];
    }
  }

  /**
   * Findet potenzielle Matches für einen User basierend auf Kompatibilität
   */
  async findPotentialMatches(userId: string, minScore: number = 65): Promise<Character8D[]> {
    try {
      // Alle anderen Characters laden (außer eigene)
      const { data, error } = await this.client
        .from('characters')
        .select('*')
        .neq('user_id', userId)
        .limit(50); // Limit für Performance

      if (error || !data) {
        console.error('Keine potentiellen Matches gefunden:', error);
        return [];
      }

      return data.map(char => this.dbRowToCharacter(char));
    } catch (error) {
      console.error('Exception beim Suchen von Matches:', error);
      return [];
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private dbRowToCharacter(row: any): Character8D {
    return {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      tags: row.tags,
      tagsSummary: {
        mustHaves: row.tags.filter((t: any) => t.tagType === 'must').map((t: any) => t.tagId),
        niceToHaves: row.tags.filter((t: any) => t.tagType === 'nice').map((t: any) => t.tagId),
        totalTags: row.tags.length
      },
      big5: row.big5,
      personality: this.derivePersonality(row.big5),
      lifestyle: row.lifestyle,
      intellect: row.lifestyle,
      social: row.lifestyle,
      values: row.lifestyle,
      relationship: row.lifestyle,
      aesthetic: row.lifestyle,
      practical: row.lifestyle,
      archetype: {
        id: row.archetype.toLowerCase().replace(/\s+/g, '-'),
        name: row.archetype,
        icon: this.extractIcon(row.archetype),
        englishName: ''
      },
      adjustments: row.adjustments,
      generatedProfile: {
        shortBio: `${this.extractIcon(row.archetype)} ${row.archetype}`,
        longDescription: '',
        keywords: []
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private derivePersonality(big5: any) {
    return {
      extraversion: big5.extraversion > 50 ? 'Extrovertiert' : 'Introvertiert',
      openness: big5.openness > 50 ? 'Experimentierfreudig' : 'Konservativ',
      conscientiousness: big5.conscientiousness > 50 ? 'Gewissenhaft' : 'Spontan',
      agreeableness: big5.agreeableness > 50 ? 'Empathisch' : 'Assertiv',
      neuroticism: big5.neuroticism > 50 ? 'Emotional intensiv' : 'Emotional stabil'
    };
  }

  private extractIcon(archetypeName: string): string {
    const match = archetypeName.match(/^(\p{Emoji}+)/u);
    return match ? match[1] : '🎭';
  }

  /**
   * Test-Methode: Prüft Supabase-Verbindung
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('characters')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Supabase Verbindungsfehler:', error);
        return false;
      }

      console.log('✓ Supabase Verbindung erfolgreich');
      return true;
    } catch (error) {
      console.error('Supabase Exception:', error);
      return false;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const supabaseService = new SupabaseService();
export default supabaseService;

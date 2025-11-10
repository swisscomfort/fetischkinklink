import { Character8D, MatchScore, TagSelection, LifestyleData } from '../types';

const API_BASE_URL = '/api';

export const api = {
  // Character endpoints
  generateCharacter: async (
    userId: string,
    username: string,
    tags: TagSelection[],
    lifestyle: LifestyleData
  ): Promise<Character8D> => {
    const response = await fetch(`${API_BASE_URL}/character/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, tags, lifestyle }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate character');
    }

    const result = await response.json();
    return result.data;
  },

  getCharacter: async (userId: string, username: string): Promise<Character8D> => {
    const response = await fetch(`${API_BASE_URL}/character/${userId}/${username}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch character');
    }

    const result = await response.json();
    return result.data;
  },

  getCharactersByUser: async (userId: string): Promise<Character8D[]> => {
    const response = await fetch(`${API_BASE_URL}/characters/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch characters');
    }

    const result = await response.json();
    return result.data;
  },

  // Match endpoints
  calculateMatch: async (
    character1: Character8D,
    character2: Character8D
  ): Promise<MatchScore> => {
    const response = await fetch(`${API_BASE_URL}/match/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character1, character2 }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to calculate match');
    }

    const result = await response.json();
    return result.data;
  },

  findMatches: async (userId: string, minScore: number = 65): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/matches/${userId}/find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minScore }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to find matches');
    }

    const result = await response.json();
    return result.data;
  },

  getMatches: async (userId: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/matches/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch matches');
    }

    const result = await response.json();
    return result.data;
  },

  // Taxonomy endpoints
  getTaxonomy: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/taxonomy`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch taxonomy');
    }

    const result = await response.json();
    return result.data;
  },

  getArchetypes: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/archetypes`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch archetypes');
    }

    const result = await response.json();
    return result.data;
  },
};

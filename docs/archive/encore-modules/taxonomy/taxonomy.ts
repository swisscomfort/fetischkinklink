// Taxonomy Service - Encore.ts Migration
// Provides access to 5,247 fetish tags with caching

import { api } from "encore.dev/api";
import taxonomyData from "../taxonomy-complete.json";

// ============================================================================
// TYPES
// ============================================================================

interface TaxonomyCategory {
  id: string;
  name: string;
  description?: string;
  subcategories?: TaxonomyCategory[];
  tags?: TaxonomyTag[];
}

interface TaxonomyTag {
  id: string;
  name: string;
  category: string;
  description?: string;
  relatedTags?: string[];
}

interface GetTaxonomyResponse {
  categories: TaxonomyCategory[];
  totalTags: number;
  version: string;
}

interface SearchTagsRequest {
  query: string;
  limit?: number;
  category?: string;
}

interface SearchTagsResponse {
  tags: TaxonomyTag[];
  totalFound: number;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Get complete taxonomy structure
 * Returns all 5,247 fetish tags organized by category
 */
export const getTaxonomy = api(
  { expose: true, method: "GET", path: "/taxonomy" },
  async (): Promise<GetTaxonomyResponse> => {
    const categories = taxonomyData.categories || [];
    
    // Count total tags recursively
    const countTags = (cat: any): number => {
      let count = cat.tags?.length || 0;
      if (cat.subcategories) {
        count += cat.subcategories.reduce((sum: number, sub: any) => sum + countTags(sub), 0);
      }
      return count;
    };

    const totalTags = categories.reduce((sum, cat) => sum + countTags(cat), 0);

    return {
      categories,
      totalTags,
      version: '1.0.0',
    };
  }
);

/**
 * Search tags by keyword
 * Supports fuzzy matching and category filtering
 */
export const searchTags = api(
  { expose: true, method: "POST", path: "/taxonomy/search" },
  async (req: SearchTagsRequest): Promise<SearchTagsResponse> => {
    const { query, limit = 50, category } = req;
    
    const allTags: TaxonomyTag[] = [];
    
    // Extract all tags from taxonomy
    const extractTags = (cat: any, categoryPath: string): void => {
      if (cat.tags) {
        cat.tags.forEach((tag: any) => {
          allTags.push({
            id: tag.id,
            name: tag.name,
            category: categoryPath,
            description: tag.description,
            relatedTags: tag.relatedTags,
          });
        });
      }
      
      if (cat.subcategories) {
        cat.subcategories.forEach((sub: any) => {
          extractTags(sub, `${categoryPath}.${sub.id}`);
        });
      }
    };

    const categories = taxonomyData.categories || [];
    categories.forEach(cat => extractTags(cat, cat.id));

    // Filter by query
    const queryLower = query.toLowerCase();
    let results = allTags.filter(tag => 
      tag.name.toLowerCase().includes(queryLower) ||
      tag.id.toLowerCase().includes(queryLower) ||
      tag.description?.toLowerCase().includes(queryLower)
    );

    // Filter by category if specified
    if (category) {
      results = results.filter(tag => tag.category.startsWith(category));
    }

    // Limit results
    const limitedResults = results.slice(0, limit);

    return {
      tags: limitedResults,
      totalFound: results.length,
    };
  }
);

/**
 * Get tag by ID
 */
export const getTag = api(
  { expose: true, method: "GET", path: "/taxonomy/tag/:id" },
  async ({ id }: { id: string }): Promise<{ tag: TaxonomyTag | null }> => {
    const allTags: TaxonomyTag[] = [];
    
    const extractTags = (cat: any, categoryPath: string): void => {
      if (cat.tags) {
        cat.tags.forEach((tag: any) => {
          allTags.push({
            id: tag.id,
            name: tag.name,
            category: categoryPath,
            description: tag.description,
            relatedTags: tag.relatedTags,
          });
        });
      }
      
      if (cat.subcategories) {
        cat.subcategories.forEach((sub: any) => {
          extractTags(sub, `${categoryPath}.${sub.id}`);
        });
      }
    };

    const categories = taxonomyData.categories || [];
    categories.forEach(cat => extractTags(cat, cat.id));

    const tag = allTags.find(t => t.id === id) || null;

    return { tag };
  }
);

/**
 * Get tags by category
 */
export const getCategory = api(
  { expose: true, method: "GET", path: "/taxonomy/category/:categoryId" },
  async ({ categoryId }: { categoryId: string }): Promise<{ 
    category: TaxonomyCategory | null;
    tags: TaxonomyTag[];
  }> => {
    const findCategory = (cats: any[], path: string[]): any => {
      if (path.length === 0) return null;
      
      const [first, ...rest] = path;
      const cat = cats.find(c => c.id === first);
      
      if (!cat) return null;
      if (rest.length === 0) return cat;
      
      return findCategory(cat.subcategories || [], rest);
    };

    const categories = taxonomyData.categories || [];
    const categoryPath = categoryId.split('.');
    const category = findCategory(categories, categoryPath);

    if (!category) {
      return { category: null, tags: [] };
    }

    const tags: TaxonomyTag[] = [];
    const extractTags = (cat: any, categoryPath: string): void => {
      if (cat.tags) {
        cat.tags.forEach((tag: any) => {
          tags.push({
            id: tag.id,
            name: tag.name,
            category: categoryPath,
            description: tag.description,
            relatedTags: tag.relatedTags,
          });
        });
      }
      
      if (cat.subcategories) {
        cat.subcategories.forEach((sub: any) => {
          extractTags(sub, `${categoryPath}.${sub.id}`);
        });
      }
    };

    extractTags(category, categoryId);

    return { category, tags };
  }
);

// Taxonomy Routes - Production Ready
// Provides access to 5,247 fetish tags

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { taxonomyLimiter } from '../middleware/security.js';
import logger from '../config/logger.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const taxonomy = require('../../taxonomy-complete.json');

const router = Router();

// ============================================================================
// GET /api/taxonomy
// ============================================================================

/**
 * @swagger
 * /api/taxonomy:
 *   get:
 *     tags: [Taxonomy]
 *     summary: Get complete fetish taxonomy
 *     description: Returns all 5,247 fetish tags organized hierarchically
 *     responses:
 *       200:
 *         description: Complete taxonomy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: object
 *                 totalTags:
 *                   type: integer
 *                 version:
 *                   type: string
 */
router.get(
  '/',
  taxonomyLimiter,
  asyncHandler(async (req, res) => {
    // Count total tags
    const countTags = (obj: any): number => {
      let count = 0;
      
      if (obj.items && Array.isArray(obj.items)) {
        count += obj.items.length;
      }
      
      if (obj.subcategories) {
        for (const key in obj.subcategories) {
          count += countTags(obj.subcategories[key]);
        }
      }
      
      if (obj.tags) {
        for (const key in obj.tags) {
          count += countTags(obj.tags[key]);
        }
      }
      
      return count;
    };

    const totalTags = countTags(taxonomy);

    logger.debug('Taxonomy requested', { totalTags });

    res.json({
      success: true,
      categories: taxonomy,
      totalTags,
      version: '1.0.0',
    });
  })
);

// ============================================================================
// GET /api/taxonomy/search
// ============================================================================

/**
 * @swagger
 * /api/taxonomy/search:
 *   get:
 *     tags: [Taxonomy]
 *     summary: Search taxonomy tags
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum results
 *     responses:
 *       200:
 *         description: Search results
 */
router.get(
  '/search',
  taxonomyLimiter,
  asyncHandler(async (req, res) => {
    const query = (req.query.q as string || '').toLowerCase();
    const limit = parseInt(req.query.limit as string) || 50;

    if (!query || query.length < 2) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters',
      });
    }

    const results: any[] = [];

    // Recursive search function
    const searchInObject = (obj: any, path: string = '') => {
      if (results.length >= limit) return;

      if (obj.items && Array.isArray(obj.items)) {
        for (const item of obj.items) {
          if (results.length >= limit) break;
          
          const label = (item.label || '').toLowerCase();
          const description = (item.description || '').toLowerCase();
          
          if (label.includes(query) || description.includes(query)) {
            results.push({
              id: item.id,
              label: item.label,
              description: item.description,
              intensity: item.intensity,
              path,
            });
          }
        }
      }

      if (obj.subcategories) {
        for (const key in obj.subcategories) {
          searchInObject(obj.subcategories[key], `${path}/${key}`);
        }
      }

      if (obj.tags) {
        for (const key in obj.tags) {
          searchInObject(obj.tags[key], `${path}/${key}`);
        }
      }
    };

    searchInObject(taxonomy);

    logger.debug('Taxonomy search', { query, resultsCount: results.length });

    res.json({
      success: true,
      query,
      results,
      count: results.length,
      hasMore: results.length === limit,
    });
  })
);

export default router;

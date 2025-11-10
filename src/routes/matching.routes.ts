// Matching Routes - Production Ready
// Handles compatibility calculations between characters

import { Router } from 'express';
import { MatchingEngine } from '../services/matchingEngine.js';
import supabaseService from '../services/supabase.js';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.js';
import { matchingLimiter } from '../middleware/security.js';
import { validateBody, MatchRequestSchema } from '../validation/schemas.js';
import logger from '../config/logger.js';

const router = Router();

// ============================================================================
// POST /api/matching/calculate
// ============================================================================

/**
 * @swagger
 * /api/matching/calculate:
 *   post:
 *     tags: [Matching]
 *     summary: Calculate compatibility between two characters
 *     description: Uses 5D matching algorithm (Fetish, Personality, Lifestyle, Values, Aesthetic)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId1, userId2]
 *             properties:
 *               userId1:
 *                 type: string
 *                 format: uuid
 *               userId2:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Match calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 match:
 *                   type: object
 *                   properties:
 *                     matchId:
 *                       type: string
 *                     scores:
 *                       $ref: '#/components/schemas/MatchScore'
 *                     compatibilityLevel:
 *                       type: string
 *                       enum: [Poor, Okay, Good, Excellent, Perfect]
 *                     recommendation:
 *                       type: string
 *                 processingTime:
 *                   type: number
 *       404:
 *         description: One or both characters not found
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/calculate',
  matchingLimiter,
  validateBody(MatchRequestSchema),
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { userId1, userId2 } = req.body;

    logger.info(`Calculating match between users`, { userId1, userId2 });

    // Fetch both characters
    const [char1Result, char2Result] = await Promise.all([
      supabaseService.getCharacter(userId1, null),
      supabaseService.getCharacter(userId2, null),
    ]);

    if (!char1Result) {
      throw new NotFoundError(`Character for user ${userId1}`);
    }
    if (!char2Result) {
      throw new NotFoundError(`Character for user ${userId2}`);
    }

    // Calculate match
    const matchResult = MatchingEngine.calculateMatch(
      char1Result,
      char2Result
    );

    // Save match to database
    try {
      await supabaseService.saveMatch(matchResult);
    } catch (dbError) {
      logger.warn('Failed to save match to database', {
        userId1,
        userId2,
        error: dbError,
      });
    }

    const processingTime = Date.now() - startTime;

    logger.info(`Match calculated successfully`, {
      userId1,
      userId2,
      overallScore: matchResult.scores.overall,
      compatibilityLevel: matchResult.compatibilityLevel,
      processingTime,
    });

    res.json({
      success: true,
      match: matchResult,
      processingTime,
    });
  })
);

export default router;

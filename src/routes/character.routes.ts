// Character Routes - Production Ready
// Handles character generation, retrieval, and updates

import { Router } from 'express';
import { CharacterGenerator8D } from '../services/characterGenerator8D.js';
import supabaseService from '../services/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  characterGenerationLimiter,
} from '../middleware/security.js';
import {
  validateBody,
  validateParams,
  GenerateCharacterRequestSchema,
  CharacterIdParamSchema,
  UserIdParamSchema,
} from '../validation/schemas.js';
import logger from '../config/logger.js';

const router = Router();

// ============================================================================
// POST /api/character/generate
// ============================================================================

/**
 * @swagger
 * /api/character/generate:
 *   post:
 *     tags: [Character]
 *     summary: Generate 8D character profile
 *     description: Creates a comprehensive character profile using Big5 personality model and lifestyle data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, username, tags, lifestyle]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               username:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TagSelection'
 *               lifestyle:
 *                 $ref: '#/components/schemas/LifestyleData'
 *               adjustments:
 *                 type: object
 *     responses:
 *       200:
 *         description: Character generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 character:
 *                   $ref: '#/components/schemas/Character8D'
 *                 processingTime:
 *                   type: number
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/generate',
  characterGenerationLimiter,
  validateBody(GenerateCharacterRequestSchema),
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { userId, username, tags, lifestyle, adjustments } = req.body;

    logger.info(`Generating character for user ${userId}`, {
      userId,
      username,
      tagCount: tags.length,
    });

    // Generate character
    const character = CharacterGenerator8D.generate(
      userId,
      username,
      tags,
      lifestyle || {}
    );

    // Apply custom adjustments if provided
    if (adjustments) {
      character.adjustments = {
        ...character.adjustments,
        ...adjustments,
      };
    }

    // Save to database
    try {
      const saveResult = await supabaseService.saveCharacter(character);
      
      if (!saveResult.success) {
        logger.warn('Failed to save character to database', {
          userId,
          error: saveResult.error,
        });
      }
    } catch (dbError) {
      logger.error('Database error when saving character', {
        userId,
        error: dbError,
      });
      // Continue - don't fail request if DB save fails
    }

    const processingTime = Date.now() - startTime;

    logger.info(`Character generated successfully`, {
      userId,
      characterId: character.id,
      archetype: character.archetype.name,
      processingTime,
    });

    res.json({
      success: true,
      character,
      processingTime,
    });
  })
);

// ============================================================================
// GET /api/character/:characterId
// ============================================================================

/**
 * @swagger
 * /api/character/{characterId}:
 *   get:
 *     tags: [Character]
 *     summary: Get character by ID
 *     parameters:
 *       - in: path
 *         name: characterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Character found
 *       404:
 *         description: Character not found
 */
router.get(
  '/:characterId',
  validateParams(CharacterIdParamSchema),
  asyncHandler(async (req, res) => {
    const { characterId } = req.params;

    const result = await supabaseService.getCharacter(characterId);

    if (!result.success || !result.character) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Character not found',
      });
    }

    res.json({
      success: true,
      character: result.character,
    });
  })
);

// ============================================================================
// GET /api/character/user/:userId
// ============================================================================

/**
 * @swagger
 * /api/character/user/{userId}:
 *   get:
 *     tags: [Character]
 *     summary: Get all characters for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of characters
 */
router.get(
  '/user/:userId',
  validateParams(UserIdParamSchema),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const result = await supabaseService.getUserCharacters(userId);

    res.json({
      success: true,
      characters: result.characters || [],
      count: result.characters?.length || 0,
    });
  })
);

export default router;

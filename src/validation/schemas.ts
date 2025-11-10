// Zod Validation Schemas for API Requests
// Provides type-safe request validation

import { z } from 'zod';

// ============================================================================
// TAG SELECTION SCHEMA
// ============================================================================

export const TagSelectionSchema = z.object({
  tagId: z.string().min(1, 'Tag ID required'),
  tagType: z.enum(['must', 'nice']),
  intensity: z.number().min(1).max(5),
  category: z.string().min(1),
});

// ============================================================================
// LIFESTYLE DATA SCHEMA
// ============================================================================

export const LifestyleDataSchema = z.object({
  // Dimension 2: Lifestyle
  housing: z.string().optional(),
  career: z.string().optional(),
  workHours: z.string().optional(),
  dailyRhythm: z.string().optional(),
  energyLevel: z.string().optional(),
  diet: z.string().optional(),
  fitness: z.string().optional(),
  bodyRelationship: z.string().optional(),
  smoking: z.string().optional(),
  alcohol: z.string().optional(),
  drugs: z.array(z.string()).optional(),

  // Dimension 3: Intellekt
  education: z.string().optional(),
  intellectualInterests: z.array(z.string()).optional(),
  mediaConsumption: z
    .object({
      literature: z.string().optional(),
      film: z.string().optional(),
      gaming: z.string().optional(),
      music: z.string().optional(),
    })
    .optional(),
  creativity: z.array(z.string()).optional(),

  // Dimension 4: Sozialverhalten
  communicationStyle: z.string().optional(),
  texting: z.string().optional(),
  conflictBehavior: z.string().optional(),
  friendCircle: z.string().optional(),
  familyRelationship: z.string().optional(),

  // Dimension 5: Werte
  politics: z.string().optional(),
  spirituality: z.string().optional(),
  environment: z.string().optional(),
  wantChildren: z.string().optional(),

  // Dimension 6: Beziehungsphilosophie
  relationshipStructure: z.string().optional(),
  commitment: z.string().optional(),
  romance: z.string().optional(),
  jealousy: z.string().optional(),

  // Dimension 7: Ästhetik
  fashionStyle: z.string().optional(),
  bodyModifications: z.array(z.string()).optional(),
  hairStyle: z.string().optional(),
  beard: z.string().optional(),

  // Dimension 8: Praktisch
  outStatus: z.string().optional(),
  mobility: z.string().optional(),
  availability: z.string().optional(),
});

// ============================================================================
// CHARACTER GENERATION REQUEST
// ============================================================================

export const GenerateCharacterRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  tags: z
    .array(TagSelectionSchema)
    .min(1, 'At least one tag required')
    .max(100, 'Maximum 100 tags allowed'),
  lifestyle: LifestyleDataSchema,
  adjustments: z
    .object({
      dominanceLevel: z.number().min(0).max(100).optional(),
      intensityLevel: z.number().min(0).max(100).optional(),
      emotionalDepth: z.number().min(0).max(100).optional(),
      experience: z.number().min(0).max(100).optional(),
      publicness: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

export type GenerateCharacterRequest = z.infer<typeof GenerateCharacterRequestSchema>;

// ============================================================================
// MATCH CALCULATION REQUEST
// ============================================================================

export const MatchRequestSchema = z.object({
  userId1: z.string().uuid('Invalid user ID 1 format'),
  userId2: z.string().uuid('Invalid user ID 2 format'),
});

export type MatchRequest = z.infer<typeof MatchRequestSchema>;

// ============================================================================
// USER ID PARAM SCHEMA
// ============================================================================

export const UserIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export const CharacterIdParamSchema = z.object({
  characterId: z.string().min(1, 'Character ID required'),
});

// ============================================================================
// VALIDATION MIDDLEWARE HELPER
// ============================================================================

import { Request, Response, NextFunction } from 'express';

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid URL Parameters',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid Query Parameters',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

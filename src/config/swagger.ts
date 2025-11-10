// Swagger/OpenAPI Documentation Configuration
// Auto-generates API documentation for all endpoints

import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SpiegelMatch API',
    version: '1.0.0',
    description: `
# SpiegelMatch - 8D Character Generation & Matching Engine

Production-ready REST API for kink dating platform with advanced personality matching.

## Features

- **8D Character Generation**: Big5 personality + 10 archetypes
- **5D Matching Algorithm**: Multi-dimensional compatibility scoring
- **5,247 Fetish Tags**: Complete taxonomy with hierarchical categories
- **Supabase Integration**: PostgreSQL with Row Level Security

## Authentication

Currently uses Supabase Auth. Include \`Authorization: Bearer <token>\` header for protected routes.

## Rate Limiting

- **General**: 100 requests per 15 minutes
- **Character Generation**: 10 requests per hour
- **Matching**: 50 requests per hour

## Error Responses

All errors follow this format:
\`\`\`json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {},
  "timestamp": "2025-11-10T12:00:00.000Z"
}
\`\`\`
    `,
    contact: {
      name: 'SwissComfort',
      url: 'https://github.com/swisscomfort/fetischkinklink',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
    {
      url: 'https://api.spiegelmatch.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Character',
      description: '8D Character generation and management',
    },
    {
      name: 'Matching',
      description: '5D compatibility matching algorithm',
    },
    {
      name: 'Taxonomy',
      description: 'Fetish tag taxonomy (5,247 tags)',
    },
    {
      name: 'Health',
      description: 'Health checks and monitoring',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      TagSelection: {
        type: 'object',
        required: ['tagId', 'tagType', 'intensity', 'category'],
        properties: {
          tagId: {
            type: 'string',
            example: 'bdsm.bondage.shibari',
            description: 'Hierarchical tag identifier',
          },
          tagType: {
            type: 'string',
            enum: ['must', 'nice'],
            description: 'Must-have or nice-to-have',
          },
          intensity: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            example: 4,
            description: 'Intensity level 1-5',
          },
          category: {
            type: 'string',
            example: 'bdsm',
            description: 'Primary category',
          },
        },
      },
      LifestyleData: {
        type: 'object',
        properties: {
          career: { type: 'string', example: 'creative' },
          dailyRhythm: { type: 'string', example: 'night owl' },
          energyLevel: { type: 'string', example: 'high' },
          relationshipStructure: { type: 'string', example: 'polyamorous' },
          communicationStyle: { type: 'string', example: 'direct' },
          politics: { type: 'string', example: 'progressive' },
          fashionStyle: { type: 'string', example: 'alternative' },
        },
      },
      Big5Scores: {
        type: 'object',
        properties: {
          extraversion: { type: 'number', minimum: 0, maximum: 100, example: 75 },
          openness: { type: 'number', minimum: 0, maximum: 100, example: 85 },
          conscientiousness: { type: 'number', minimum: 0, maximum: 100, example: 60 },
          agreeableness: { type: 'number', minimum: 0, maximum: 100, example: 70 },
          neuroticism: { type: 'number', minimum: 0, maximum: 100, example: 45 },
        },
      },
      Character8D: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'char_1699564800000_user123' },
          userId: { type: 'string', format: 'uuid' },
          username: { type: 'string', example: 'KinkExplorer' },
          tags: { type: 'array', items: { $ref: '#/components/schemas/TagSelection' } },
          tagsSummary: {
            type: 'object',
            properties: {
              mustHaves: { type: 'array', items: { type: 'string' } },
              niceToHaves: { type: 'array', items: { type: 'string' } },
              totalTags: { type: 'integer' },
            },
          },
          big5: { $ref: '#/components/schemas/Big5Scores' },
          archetype: {
            type: 'object',
            properties: {
              name: { type: 'string', example: '🔥 Der wilde Explorer' },
              description: { type: 'string' },
              keywords: { type: 'array', items: { type: 'string' } },
              compatibility: { type: 'number' },
            },
          },
          adjustments: {
            type: 'object',
            properties: {
              dominanceLevel: { type: 'number', minimum: 0, maximum: 100 },
              intensityLevel: { type: 'number', minimum: 0, maximum: 100 },
              emotionalDepth: { type: 'number', minimum: 0, maximum: 100 },
              experience: { type: 'number', minimum: 0, maximum: 100 },
              publicness: { type: 'number', minimum: 0, maximum: 100 },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      MatchScore: {
        type: 'object',
        properties: {
          overall: { type: 'number', minimum: 0, maximum: 100, example: 87.5 },
          fetishOverlap: { type: 'number', example: 92 },
          personalityCompat: { type: 'number', example: 78 },
          lifestyleAlignment: { type: 'number', example: 85 },
          valuesAlignment: { type: 'number', example: 90 },
          aestheticHarmony: { type: 'number', example: 82 },
          breakdown: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                score: { type: 'number' },
                weight: { type: 'number' },
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Validation Error' },
          message: { type: 'string' },
          details: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/server.ts', './src/routes/**/*.ts'], // Path to API docs
};

export const swaggerSpec = swaggerJsdoc(options);

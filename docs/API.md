# 📚 SpiegelMatch API Reference

Complete REST API documentation for SpiegelMatch backend.

## Base URL

```
Development: http://localhost:3001
Production: https://your-domain.com
```

## Authentication

All endpoints require authentication via Supabase Auth JWT tokens (except public endpoints).

```http
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Health & Info

#### GET `/`
Get API information and available endpoints.

**Response:**
```json
{
  "name": "SpiegelMatch API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": { ... }
}
```

#### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T08:42:00.000Z"
}
```

---

## Character Endpoints

### POST `/api/character/generate`

Generate an 8D character profile from tags and lifestyle data.

**Request Body:**
```typescript
{
  userId: string;           // UUID of the user
  username: string;         // Character name (unique per user)
  tags: string[];          // Array of fetish tag IDs
  lifestyle?: {            // Optional lifestyle data
    housing?: string;
    work?: string;
    relationship?: string;
    // ... more fields
  };
  adjustments?: {          // Optional slider adjustments (-50 to +50)
    dominance?: number;
    intensity?: number;
    emotional?: number;
    experience?: number;
    publicness?: number;
  };
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string;
    userId: string;
    username: string;
    archetype: string;
    big5: {
      extraversion: number;      // 0-100
      openness: number;
      conscientiousness: number;
      agreeableness: number;
      neuroticism: number;
    };
    personality: {
      extraversion: string;
      openness: string;
      conscientiousness: string;
      agreeableness: string;
      neuroticism: string;
    };
    lifestyle: { ... };
    generatedProfile: {
      shortBio: string;
      longDescription: string;
    };
    adjustments: { ... };
    createdAt: string;
    updatedAt: string;
  },
  timestamp: string;
}
```

**Error Responses:**
- `400` - Missing required fields (userId, username)
- `400` - Invalid tags or lifestyle data
- `500` - Character generation failed

---

### GET `/api/character/:userId/:username`

Get a specific character by userId and username.

**URL Parameters:**
- `userId` (string, UUID) - User ID
- `username` (string) - Character name

**Response:**
```typescript
{
  success: true,
  data: Character8D,  // Same structure as generate endpoint
  timestamp: string;
}
```

**Error Responses:**
- `404` - Character not found
- `403` - Unauthorized access

---

### GET `/api/characters/:userId`

Get all characters for a user.

**URL Parameters:**
- `userId` (string, UUID) - User ID

**Response:**
```typescript
{
  success: true,
  data: Character8D[],
  timestamp: string;
}
```

---

## Matching Endpoints

### POST `/api/match/calculate`

Calculate compatibility between two users.

**Request Body:**
```typescript
{
  userId1: string;  // UUID of first user
  userId2: string;  // UUID of second user
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    overall: number;              // 0-100
    compatibilityLevel: string;   // "Poor" | "Okay" | "Good" | "Excellent" | "Perfect"
    breakdown: [
      {
        factor: string;           // e.g. "Fetish Compatibility"
        score: number;            // 0-100
        weight: number;           // 0-100 (percentage)
        weightedScore: number;    // score * (weight/100)
      },
      // ... 5 factors total
    ];
    details?: {
      fetishOverlap: {
        commonTags: string[];
        uniqueToUser1: number;
        uniqueToUser2: number;
      };
      personalityAlignment: {
        big5Differences: { ... };
      };
      // ... more details
    };
  },
  timestamp: string;
}
```

**Error Responses:**
- `400` - Missing userId1 or userId2
- `404` - One or both users not found
- `500` - Match calculation failed

---

### POST `/api/matches/:userId/find`

Find potential matches for a user based on criteria.

**URL Parameters:**
- `userId` (string, UUID) - User ID to find matches for

**Request Body:**
```typescript
{
  minScore?: number;        // Minimum overall score (default: 60)
  maxResults?: number;      // Max results to return (default: 20)
  filters?: {
    minAge?: number;
    maxAge?: number;
    location?: string;
    tags?: string[];        // Must have these tags
    // ... more filters
  };
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    matches: [
      {
        userId: string;
        username: string;
        score: number;
        compatibilityLevel: string;
        preview: {
          archetype: string;
          commonTags: string[];
          big5Summary: { ... };
        };
      },
      // ... more matches
    ];
    total: number;
  },
  timestamp: string;
}
```

---

### GET `/api/matches/:userId`

Get all saved matches for a user.

**URL Parameters:**
- `userId` (string, UUID) - User ID

**Response:**
```typescript
{
  success: true,
  data: MatchResult[],
  timestamp: string;
}
```

---

## Taxonomy Endpoints

### GET `/api/taxonomy`

Get the complete fetish taxonomy.

**Response:**
```typescript
{
  success: true,
  data: {
    categories: [
      {
        id: string;
        name: string;
        description: string;
        subcategories: [
          {
            id: string;
            name: string;
            tags: [
              {
                id: string;
                label: string;
                intensity: number;    // 1-5
                description: string;
                variants: string[];
              },
              // ... more tags
            ];
          },
          // ... more subcategories
        ];
      },
      // ... 10 main categories
    ];
    totalTags: number;
  },
  timestamp: string;
}
```

---

### GET `/api/taxonomy/:categoryId`

Get a specific category from the taxonomy.

**URL Parameters:**
- `categoryId` (string) - Category ID (e.g., "bdsm")

**Response:**
```typescript
{
  success: true,
  data: Category,  // Same structure as in /api/taxonomy
  timestamp: string;
}
```

**Error Responses:**
- `404` - Category not found

---

### GET `/api/archetypes`

Get all psychological archetypes.

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string;
      name: string;
      emoji: string;
      description: string;
      typicalTags: string[];
      big5Profile: {
        extraversion: string;
        openness: string;
        conscientiousness: string;
        agreeableness: string;
        neuroticism: string;
      };
    },
    // ... 10 archetypes
  ],
  timestamp: string;
}
```

---

## Error Responses

All errors follow this format:

```typescript
{
  error: string;       // Error message
  details?: string;    // Additional details (if available)
  status: number;      // HTTP status code
  timestamp: string;
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid auth token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Character generation**: 10 requests per hour per user
- **Match calculation**: 50 requests per hour per user

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699632000
```

---

## Webhooks

SpiegelMatch can send webhooks for certain events:

### Events

- `character.created` - New character was created
- `character.updated` - Character was updated
- `match.calculated` - New match was calculated
- `match.accepted` - User accepted a match

### Webhook Payload

```typescript
{
  event: string;
  timestamp: string;
  data: { ... };  // Event-specific data
  signature: string;  // HMAC signature for verification
}
```

---

## Client Libraries

### JavaScript/TypeScript

```typescript
import { SpiegelMatchClient } from '@spiegelmatch/client';

const client = new SpiegelMatchClient({
  apiUrl: 'http://localhost:3001',
  token: 'your-jwt-token'
});

// Generate character
const character = await client.characters.generate({
  userId: 'user-id',
  username: 'myCharacter',
  tags: ['shibari', 'submission']
});

// Calculate match
const match = await client.matches.calculate('user1-id', 'user2-id');
```

### Python

```python
from spiegelmatch import SpiegelMatchClient

client = SpiegelMatchClient(
    api_url='http://localhost:3001',
    token='your-jwt-token'
)

# Generate character
character = client.characters.generate(
    user_id='user-id',
    username='myCharacter',
    tags=['shibari', 'submission']
)

# Calculate match
match = client.matches.calculate('user1-id', 'user2-id')
```

---

## Examples

See [scripts/demo.ts](../scripts/demo.ts) for complete working examples.

---

## Support

For API support, please open an issue on [GitHub](https://github.com/yourusername/spiegelmatch/issues).

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release preparation
- Comprehensive documentation
- Docker deployment support

## [1.0.0] - 2025-11-10

### Added
- 8D Character Generation Engine with Big5 personality analysis
- Multi-dimensional matching algorithm (5 factors)
- Comprehensive taxonomy system with 5,247 fetish tags
- Express.js REST API backend
- React frontend with Vite
- Supabase database integration
- Row Level Security (RLS) policies
- Character profile generation from tags
- Personality archetype classification (10 types)
- Natural language profile description generation
- Real-time Big5 visualization
- Match compatibility calculation
- Interactive UI components (CharacterCreator, Dashboard, MatchCard)
- Comprehensive API documentation
- Deployment guides for multiple platforms
- Docker and docker-compose configuration
- TypeScript strict mode throughout
- Winston logging
- Helmet.js security middleware
- CORS configuration
- Rate limiting
- Input validation with Zod
- Error handling middleware
- Health check endpoint
- Swagger/OpenAPI documentation setup

### Security
- Row Level Security (RLS) for database access
- JWT-based authentication via Supabase Auth
- API rate limiting
- Input validation and sanitization
- Security headers with Helmet.js
- CORS protection

### Documentation
- Complete README with features and quick start
- API reference documentation
- Deployment guide for multiple platforms
- Architecture overview
- Implementation guide
- Contributing guidelines
- Code of Conduct
- Security policy
- Code examples and demos

## [0.9.0] - 2025-11-09

### Added
- Core character generation logic
- Matching engine implementation
- Taxonomy data structure
- Basic Express server
- React frontend components
- Supabase database schema

### Changed
- Migrated from Encore.dev to Express.js
- Restructured project for production readiness

## [0.5.0] - 2025-11-08

### Added
- Initial character generator prototype
- Basic matching algorithm
- Preliminary taxonomy (3,000+ tags)

### Changed
- Refined Big5 calculation logic
- Improved archetype classification

## [0.1.0] - 2025-11-01

### Added
- Project inception
- Initial research and planning
- Proof of concept

---

## Release Types

### Major (X.0.0)
- Breaking API changes
- Major feature additions
- Database schema changes requiring migration

### Minor (0.X.0)
- New features (backwards compatible)
- Enhancements to existing features
- Non-breaking API additions

### Patch (0.0.X)
- Bug fixes
- Documentation updates
- Performance improvements
- Security patches

---

## Contribution Guidelines

When adding to this changelog:
1. Add entries under `[Unreleased]`
2. Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. Write user-facing descriptions
4. Link to relevant issues/PRs

Example:
```markdown
### Added
- New matching factor for communication style (#123)

### Fixed
- Character generation timeout for large tag sets (#145)
```

---

[Unreleased]: https://github.com/yourusername/spiegelmatch/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/spiegelmatch/releases/tag/v1.0.0
[0.9.0]: https://github.com/yourusername/spiegelmatch/releases/tag/v0.9.0
[0.5.0]: https://github.com/yourusername/spiegelmatch/releases/tag/v0.5.0
[0.1.0]: https://github.com/yourusername/spiegelmatch/releases/tag/v0.1.0

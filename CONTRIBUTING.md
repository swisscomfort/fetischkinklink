# Contributing to SpiegelMatch

First off, thank you for considering contributing to SpiegelMatch! It's people like you that make SpiegelMatch such a great tool for the kink community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., Ubuntu 22.04]
- Node.js version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 118]

## Additional Context
Screenshots, logs, or any other relevant information.
```

### Suggesting Features

Feature suggestions are welcome! Please provide:

1. **Clear use case** - Why is this feature needed?
2. **Detailed description** - How should it work?
3. **Alternatives considered** - What other solutions did you think about?
4. **Impact assessment** - Who benefits from this feature?

### Improving Documentation

- Fix typos or clarify confusing sections
- Add examples or tutorials
- Translate documentation (especially for non-English speakers)
- Create video tutorials or guides

### Contributing Code

1. **Find an issue** - Look for issues labeled `good first issue` or `help wanted`
2. **Comment your intent** - Let others know you're working on it
3. **Fork & create branch** - Keep your changes focused
4. **Write tests** - Ensure your code is tested
5. **Submit PR** - Follow the pull request template

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for database features)
- Code editor (VS Code recommended)

### Local Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/spiegelmatch.git
cd spiegelmatch

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/spiegelmatch.git

# 4. Install dependencies
npm install

# 5. Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 6. Run development servers
npm run dev:all
# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Project Structure

```
spiegelmatch/
├── src/                    # Backend source code
│   ├── services/          # Core business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Express middleware
│   └── validation/        # Input validation schemas
├── frontend/src/          # Frontend React app
│   ├── components/        # React components
│   ├── api/              # API client
│   └── types/            # TypeScript types
├── supabase/             # Database migrations
├── scripts/              # Utility scripts
├── docs/                 # Documentation
└── tests/                # Test files
```

---

## Pull Request Process

### Before Submitting

1. **Update documentation** - If you changed APIs or added features
2. **Add tests** - Ensure >80% code coverage
3. **Run linter** - `npm run lint` should pass
4. **Build successfully** - `npm run build` should work
5. **Update CHANGELOG.md** - Add your changes under "Unreleased"

### PR Title Format

Use conventional commits format:

```
feat: Add new matching algorithm parameter
fix: Resolve character generation timeout
docs: Update API documentation
refactor: Simplify taxonomy loading logic
test: Add tests for matching engine
chore: Update dependencies
```

### PR Description Template

```markdown
## Description
Brief description of your changes.

## Motivation
Why is this change necessary?

## Related Issue
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** - CI/CD must pass
2. **Code review** - At least one maintainer approval required
3. **Testing** - Reviewers will test your changes
4. **Feedback** - Address any requested changes
5. **Merge** - Maintainer will merge once approved

---

## Coding Standards

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  username: string;
  createdAt: Date;
}

function createUser(data: Partial<User>): User {
  return {
    id: generateId(),
    createdAt: new Date(),
    ...data
  };
}

// ❌ Bad
function createUser(data: any) {
  return {
    id: generateId(),
    createdAt: new Date(),
    ...data
  };
}
```

### Naming Conventions

- **Files**: camelCase for scripts, PascalCase for components
  - `characterGenerator.ts` ✅
  - `CharacterCreator.tsx` ✅
  
- **Variables/Functions**: camelCase
  - `getUserById` ✅
  - `matchScore` ✅

- **Classes/Interfaces**: PascalCase
  - `CharacterGenerator8D` ✅
  - `MatchResult` ✅

- **Constants**: UPPER_SNAKE_CASE
  - `MAX_TAGS_PER_CHARACTER` ✅

### Code Style

- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings
- **Max line length**: 100 characters
- **Comments**: JSDoc for public APIs

```typescript
/**
 * Generates an 8D character profile from fetish tags.
 * 
 * @param tags - Array of fetish tag IDs
 * @param adjustments - Optional slider adjustments
 * @returns Complete character profile with Big5 scores
 * 
 * @example
 * ```ts
 * const character = generator.generateFromTags(
 *   ['shibari', 'submission'],
 *   { dominance: -30 }
 * );
 * ```
 */
export function generateFromTags(
  tags: string[],
  adjustments?: SliderAdjustments
): Character8D {
  // Implementation
}
```

### Error Handling

```typescript
// ✅ Good - Specific error types
try {
  const character = await generateCharacter(data);
  return character;
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn('Validation failed', { error });
    throw new BadRequestError(error.message);
  }
  logger.error('Character generation failed', { error });
  throw new InternalServerError('Failed to generate character');
}

// ❌ Bad - Generic catch-all
try {
  const character = await generateCharacter(data);
  return character;
} catch (error) {
  console.log(error);
  throw error;
}
```

### Testing Standards

```typescript
describe('CharacterGenerator8D', () => {
  describe('generateFromTags', () => {
    it('should generate character with valid tags', () => {
      const generator = new CharacterGenerator8D();
      const character = generator.generateFromTags(['shibari']);
      
      expect(character).toBeDefined();
      expect(character.big5.extraversion).toBeGreaterThanOrEqual(0);
      expect(character.big5.extraversion).toBeLessThanOrEqual(100);
    });

    it('should apply dominance adjustment', () => {
      const generator = new CharacterGenerator8D();
      const character = generator.generateFromTags(
        ['dominance'],
        { dominance: 50 }
      );
      
      expect(character.adjustments.dominance).toBe(50);
    });

    it('should throw error for invalid tags', () => {
      const generator = new CharacterGenerator8D();
      
      expect(() => {
        generator.generateFromTags(['invalid_tag']);
      }).toThrow(ValidationError);
    });
  });
});
```

---

## Git Workflow

### Branch Naming

```bash
feature/add-new-matching-factor
bugfix/fix-character-generation-timeout
docs/update-api-documentation
refactor/simplify-taxonomy-loader
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new personality trait calculator
fix: resolve memory leak in matching engine
docs: update contributing guidelines
style: format code with prettier
refactor: extract taxonomy loading logic
test: add tests for character generator
chore: update dependencies
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream/main into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat (link in README)
- **Email** - For security issues only

### Getting Help

- Check [documentation](docs/)
- Search existing [issues](https://github.com/OWNER/spiegelmatch/issues)
- Ask in [discussions](https://github.com/OWNER/spiegelmatch/discussions)
- Join our [Discord](https://discord.gg/spiegelmatch)

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

---

## Areas Needing Help

We especially need help with:

- 🧪 **Testing** - Writing comprehensive tests
- 📝 **Documentation** - Improving guides and tutorials
- 🌍 **Internationalization** - Translating to other languages
- 🎨 **Design** - UI/UX improvements
- ♿ **Accessibility** - Making the app more accessible
- 🐛 **Bug Fixes** - Addressing known issues

Check issues labeled `help wanted` or `good first issue`.

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

Don't hesitate to ask! We're here to help:
- Open a [discussion](https://github.com/OWNER/spiegelmatch/discussions)
- Comment on an issue
- Reach out on Discord

Thank you for contributing! 🎉

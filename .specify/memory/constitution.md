<!--
Sync Impact Report:
- Version change: [INITIAL_VERSION] → 1.0.0
- New constitution created for NY TwelveLabs Hackathon AI Application
- Added sections:
  * I. Modern Stack Compliance
  * II. Test-First Development
  * III. Type Safety & Modern Patterns
  * IV. Component Architecture
  * V. AI Services Integration
  * Technology Stack Requirements
  * Development Workflow
- Templates requiring updates: ✅ updated (plan-template.md, spec-template.md, tasks-template.md)
- Follow-up TODOs: None
-->

# NY TwelveLabs Hackathon Constitution

## Core Principles

### I. Modern Stack Compliance

**MANDATORY**: All code MUST use modern language features and patterns:

- Frontend: Next.js 15 with App Router, TypeScript 5.0+, server actions over API routes
- Backend: Python 3.12+ with modern type hints (no `typing` imports), use `list[T]`, `dict[K, V]`, `T | None`
- Components: TailwindCSS for styling with modern CSS patterns
- Testing: Vitest/Jest for frontend, pytest for backend
- Code quality: Biome for frontend linting/formatting, Black and isort for Python

**Rationale**: Modern patterns improve developer experience, type safety, and maintainability while reducing boilerplate code.

### II. Test-First Development (NON-NEGOTIABLE)

**MANDATORY TDD Process**:

- Tests written → User approved → Tests fail → Implementation
- Server actions MUST have integration tests
- Backend endpoints MUST have contract and unit tests
- NO UI component tests required (focus on logic/actions)
- Red-Green-Refactor cycle strictly enforced

**Rationale**: TDD ensures requirement clarity, prevents regression, and drives better API design.

### III. Type Safety & Modern Patterns

**MANDATORY Type Requirements**:

- TypeScript strict mode enabled with `noImplicitAny`
- Python type hints on ALL functions (parameters and return values)
- Use `T | None` instead of `Optional[T]`, `list[T]` instead of `List[T]`
- Server actions MUST be typed with proper return types and error handling
- Database schemas MUST match TypeScript interfaces

**Rationale**: Type safety prevents runtime errors and improves IDE support and refactoring confidence.

### IV. Component Architecture

**MANDATORY Component Standards**:

- Use modern React 19 patterns with concurrent features
- Server actions preferred over client-side API calls
- State management via React hooks or Zustand for complex state
- TailwindCSS for all styling with consistent design patterns
- Components MUST be accessible and follow modern React patterns

**Rationale**: Consistent component architecture improves maintainability and ensures accessibility compliance.

### V. AI Services Integration

**MANDATORY AI Standards**:

- TwelveLabs API integration for video understanding capabilities
- Proper error handling for API failures and rate limits
- Type-safe API configuration and response handling
- Separation of AI logic from business logic
- Comprehensive logging for AI service calls

**Rationale**: Structured AI integration ensures reliability, debuggability, and maintainability of AI features.

## Technology Stack Requirements

**Frontend Requirements**:

- Next.js 15 with App Router (no Pages Router)
- React 19 with concurrent features
- TypeScript 5+ with strict configuration
- TailwindCSS 4+ for styling
- Server actions for data mutations
- React Hook Form for form handling
- Biome for linting and formatting

**Backend Requirements**:

- Python 3.12+
- FastAPI for API endpoints
- TwelveLabs SDK for AI video understanding
- Modern type hints (no `typing` module imports)
- Pydantic for data validation
- pytest for testing
- Black and isort for code formatting

**Development Tools**:

- Biome for frontend code quality
- Black and isort for Python
- Pre-commit hooks for code quality
- Docker for containerization
- UV for Python dependency management

## Development Workflow

**Code Quality Gates**:

- All PRs MUST pass type checking (tsc, mypy)
- All PRs MUST have passing tests
- Server actions MUST be tested with integration tests
- AI services MUST have error handling tests
- Component integration MUST follow modern React patterns

**Documentation Requirements**:

- README with setup instructions
- API documentation for FastAPI endpoints
- Environment variable documentation
- AI service configuration guide
- Hackathon project overview and demo instructions

**Review Process**:

- Code review required for all changes
- Type safety verification mandatory
- Test coverage verification for logic components
- Security review for AI service integrations

## Governance

**Constitution Supremacy**: This constitution supersedes all other development practices and guidelines.

**Amendment Process**: Changes require documentation, approval, and migration plan for existing code.

**Compliance Review**: All PRs must verify compliance with constitutional principles.

**Complexity Justification**: Any deviation from principles must be documented with clear rationale.

**Runtime Guidance**: Use `.specify/templates/plan-template.md` for implementation-specific guidance.

**Version**: 1.0.0 | **Ratified**: 2024-10-04 | **Last Amended**: 2024-10-04

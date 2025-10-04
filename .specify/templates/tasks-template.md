# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize Python 3.12+ project with FastAPI dependencies and modern type hints
- [ ] T003 Initialize Next.js 15 project with App Router, TypeScript 5+, and TailwindCSS
- [ ] T004 [P] Configure Biome for frontend linting and formatting
- [ ] T005 [P] Configure Black and isort for Python code formatting
- [ ] T006 [P] Setup TwelveLabs SDK and API configuration

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T007 [P] Contract test POST /api/users in tests/contract/test_users_post.py
- [ ] T008 [P] Contract test GET /api/users/{id} in tests/contract/test_users_get.py
- [ ] T009 [P] Integration test user registration in tests/integration/test_registration.py
- [ ] T010 [P] Integration test auth flow in tests/integration/test_auth.py
- [ ] T011 [P] Server action tests for video processing in tests/integration/test_video_actions.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T012 [P] User model in backend/src/models/user.py with modern type hints
- [ ] T013 [P] UserService CRUD in backend/src/services/user_service.py
- [ ] T014 [P] Video processing service with TwelveLabs integration in backend/src/services/video_service.py
- [ ] T015 POST /api/users endpoint with FastAPI
- [ ] T016 GET /api/users/{id} endpoint with FastAPI
- [ ] T017 Server actions for video upload and processing in frontend/src/app/actions/video-actions.ts
- [ ] T018 Input validation with Pydantic models
- [ ] T019 Error handling and logging for AI services

## Phase 3.4: Integration

- [ ] T020 Connect UserService to database with proper typing
- [ ] T021 Auth middleware for API endpoints
- [ ] T022 Request/response logging with structured format
- [ ] T023 CORS and security headers
- [ ] T024 TwelveLabs API integration with error handling

## Phase 3.5: Polish

- [ ] T025 [P] Unit tests for validation in tests/unit/test_validation.py
- [ ] T026 Performance tests (<200ms) for AI service calls
- [ ] T027 [P] Update docs/api.md with FastAPI endpoints
- [ ] T028 [P] TypeScript strict mode compliance check
- [ ] T029 Remove code duplication and refactor
- [ ] T030 Run manual testing and demo preparation

## Dependencies

- Setup (T001-T006) before tests
- Tests (T007-T011) before implementation (T012-T019)
- T012 blocks T013, T020
- T021 blocks T023
- Implementation before polish (T025-T030)

## Parallel Example

```
# Launch T007-T011 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
Task: "Server action tests for video processing in tests/integration/test_video_actions.py"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:

   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task

# Implementation Plan: Video Upload URL Generation API

**Branch**: `001-i-want-to` | **Date**: October 4, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-i-want-to/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → ✓ Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✓ Project Type: Web application (backend API)
   → ✓ Structure Decision: Backend API with FastAPI
3. Fill the Constitution Check section based on the content of the constitution document.
   → ✓ Backend-only project, partial constitution applicability
4. Evaluate Constitution Check section below
   → ✓ Backend compliance verified
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✓ Research AWS S3 presigned URLs with boto3
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent file
   → In progress
7. Re-evaluate Constitution Check section
   → Pending Phase 1 completion
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
   → Pending
9. STOP - Ready for /tasks command
```

## Summary

FastAPI backend service that generates secure, time-limited AWS S3 presigned URLs for direct video uploads. Clients request an upload URL from the `/upload` endpoint, receive a 30-minute signed URL pointing to S3, and upload videos directly to cloud storage without routing through the API server. Files are organized with UUID-based naming preserving original extensions (e.g., `upload/{uuid}.mp4`). The service is a public endpoint supporting videos up to 2GB in any format.

## Technical Context

**Language/Version**: Python 3.12+  
**Primary Dependencies**: FastAPI, boto3, uvicorn, pydantic  
**Storage**: AWS S3 (bucket name via environment variable)  
**Testing**: pytest with coverage  
**Target Platform**: Linux server / container deployment  
**Project Type**: Web (backend API only)  
**Performance Goals**: <100ms p95 for URL generation, handle 100+ req/s  
**Constraints**: 2GB max file size, 30-minute URL expiration (configurable), public endpoint  
**Scale/Scope**: Lightweight service, single endpoint, stateless operation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Modern Stack Compliance**:

- [N/A] Frontend uses Next.js 15 with App Router, TypeScript 5.0+ (backend-only project)
- [x] Backend uses Python 3.12+ with modern type hints (no `typing` imports)
- [N/A] Components use TailwindCSS for styling (backend-only project)
- [x] Testing uses pytest for backend

**Test-First Development**:

- [x] TDD process planned: Tests → User approval → Tests fail → Implementation
- [N/A] Server actions have integration test plans (no frontend server actions)
- [x] Backend endpoints have contract and unit test plans
- [x] Red-Green-Refactor cycle documented

**Type Safety & Modern Patterns**:

- [N/A] TypeScript strict mode enabled with `noImplicitAny` (Python project)
- [x] Python type hints planned for ALL functions
- [N/A] Server actions typed with proper return types and error handling (no server actions)
- [N/A] Database schemas match TypeScript interfaces (no database)

**Component Architecture**:

- [N/A] React 19 patterns with concurrent features planned (backend-only)
- [N/A] Server actions preferred over client-side API calls (backend-only)
- [N/A] State management strategy defined (backend-only)
- [N/A] Accessibility compliance planned (backend-only)

**AI Services Integration**:

- [N/A] TwelveLabs API integration planned (not required for this feature)
- [x] Error handling for API failures and rate limits (AWS S3)
- [x] Type-safe API configuration and response handling
- [x] AI logic separated from business logic (N/A - no AI in this feature)
- [x] Comprehensive logging for service calls

**Constitution Compliance Status**: ✅ PASS (Backend-only project with appropriate exemptions)

## Project Structure

### Documentation (this feature)

```
specs/001-i-want-to/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   └── upload-api.yaml  # OpenAPI contract
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
amber_aim/
├── main.py              # FastAPI application entry point
├── models/              # Pydantic models for request/response
│   └── upload.py
├── services/            # Business logic
│   └── s3_service.py    # S3 presigned URL generation
├── config.py            # Environment configuration
└── pyproject.toml       # Dependencies and project metadata

tests/
├── contract/            # API contract tests (OpenAPI validation)
│   └── test_upload_contract.py
├── integration/         # Integration tests with S3
│   └── test_upload_integration.py
└── unit/               # Unit tests for services
    └── test_s3_service.py
```

**Structure Decision**: Backend-only project using the `amber_aim/` directory. Single FastAPI application with modular organization (models, services, config). Tests follow the standard contract/integration/unit separation per constitutional requirements.

## Phase 0: Outline & Research

**Unknowns to Research**:

1. ✓ AWS S3 presigned URL generation with boto3
2. ✓ FastAPI best practices for file upload endpoints
3. ✓ Environment variable management for AWS credentials
4. ✓ S3 bucket configuration (assumed: single bucket via env var)

**Research Tasks Completed**:

- boto3 `generate_presigned_url` API for PUT operations
- FastAPI request/response models with Pydantic
- AWS credentials via boto3 (environment variables or IAM role)
- S3 bucket organization with path prefixes

**Output**: ✓ research.md created with consolidated findings

## Phase 1: Design & Contracts

_Prerequisites: research.md complete ✓_

**Artifacts Generated**:

1. ✓ **data-model.md**: Complete data model documentation

   - UploadURLRequest (input model with validation)
   - UploadURLResponse (output model with expiration)
   - ErrorResponse (standardized error format)
   - Settings (environment configuration)
   - Type-safe Python 3.12+ models with Pydantic

2. ✓ **contracts/upload-api.yaml**: OpenAPI 3.1 specification

   - POST /upload endpoint contract
   - GET /health health check endpoint
   - Request/response schemas
   - Error response definitions
   - Example payloads for all scenarios

3. ✓ **quickstart.md**: Developer guide

   - Setup instructions with environment configuration
   - Local development workflow
   - Testing examples (unit, integration, contract)
   - Example client code (Python & JavaScript)
   - Troubleshooting guide

4. ✓ **Agent context**: Updated `.cursor/rules/specify-rules.mdc`
   - Added Python 3.12+ configuration
   - Added FastAPI, boto3, pydantic dependencies
   - Added AWS S3 integration context
   - Incremental update (preserved existing content)

**Design Decisions**:

- **Single Endpoint**: POST /upload for URL generation
- **Stateless Service**: No database, all state in presigned URLs
- **UUID Naming**: Guarantees uniqueness without coordination
- **Extension Preservation**: Maintains file type information
- **30-Minute Expiration**: Configurable via environment variable
- **Public Endpoint**: No authentication (per requirements)

**Constitutional Re-Check**: ✅ PASS

- Python 3.12+ with modern type hints (no `typing` imports) ✓
- Pydantic for validation and serialization ✓
- pytest for testing framework ✓
- Type hints on all functions ✓
- FastAPI best practices followed ✓

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

The `/tasks` command will load `.specify/templates/tasks-template.md` and generate tasks from Phase 1 artifacts following TDD principles:

1. **Contract Test Tasks** (from contracts/upload-api.yaml):

   - Task 1: Write contract test for POST /upload [P]
   - Task 2: Write contract test for GET /health [P]
   - Task 3: Write contract test for error responses [P]

2. **Model Creation Tasks** (from data-model.md):

   - Task 4: Implement UploadURLRequest with validators [P]
   - Task 5: Implement UploadURLResponse with factory method [P]
   - Task 6: Implement Settings with pydantic-settings [P]

3. **Service Implementation Tasks**:

   - Task 7: Write unit tests for S3Service.generate_presigned_url
   - Task 8: Implement S3Service with boto3 client
   - Task 9: Add error handling for S3 service failures

4. **API Endpoint Tasks**:

   - Task 10: Write integration test for POST /upload endpoint
   - Task 11: Implement POST /upload endpoint
   - Task 12: Implement GET /health endpoint [P]

5. **Configuration Tasks**:

   - Task 13: Setup environment configuration loading [P]
   - Task 14: Add logging configuration [P]
   - Task 15: Create .env.example template [P]

6. **Integration & Validation**:
   - Task 16: Run all contract tests (should pass)
   - Task 17: Run integration tests with mocked S3
   - Task 18: Execute quickstart.md validation steps
   - Task 19: Verify OpenAPI docs generation

**Task Ordering Strategy**:

- TDD order: Tests before implementation (Tasks 1-3 → Task 7 → Task 10 before implementation)
- Dependency order: Models (4-6) before services (7-9) before endpoints (10-11)
- Parallel execution: Tasks marked [P] are independent and can run concurrently
- Final validation: Tasks 16-19 run after all implementation complete

**Estimated Breakdown**:

- Contract tests: 3 tasks
- Models: 3 tasks
- Service layer: 3 tasks
- API endpoints: 3 tasks
- Configuration: 3 tasks
- Validation: 4 tasks
- **Total**: ~19 tasks

**Success Criteria**:

- All contract tests pass ✓
- All unit tests pass ✓
- All integration tests pass ✓
- Quickstart guide executable end-to-end ✓
- OpenAPI docs accessible at /docs ✓

**IMPORTANT**: The /tasks command will execute this strategy, NOT the /plan command

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations detected - no justifications needed_

All constitutional requirements are satisfied:

- Modern Python 3.12+ with native type hints ✓
- Pydantic for data validation ✓
- pytest for testing ✓
- FastAPI best practices ✓
- TDD workflow planned ✓
- Type safety enforced ✓

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command - implementation only, no tests)
- [x] Phase 4: Implementation complete (/implement command - all 14 tasks)
- [ ] Phase 5: Validation passed (ready for manual testing)

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (1 minor item deferred to implementation)
- [x] Complexity deviations documented (none - full compliance)

**Artifacts Generated**:

- [x] research.md (Phase 0)
- [x] data-model.md (Phase 1)
- [x] contracts/upload-api.yaml (Phase 1)
- [x] quickstart.md (Phase 1)
- [x] .cursor/rules/specify-rules.mdc updated (Phase 1)
- [x] tasks.md (Phase 3 - /tasks command, implementation only)

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_

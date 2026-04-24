# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub-synced Gherkin feature file manager for product teams. Manages a 4-level hierarchy — **Initiatives → Entities → Features (.feature files) → User Stories (Gherkin Scenarios)** — using a GitHub repository as the single source of truth. No local database. Both services run in a single Docker container with live reloading.

**Tech Stack:**
- Backend: Python 3.12+, FastAPI, PyGithub (GitHub API), gherkin-official (Gherkin parser), Pydantic v2, Poetry
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, TanStack React Query 5
- Storage: GitHub repository (no database)

## Common Commands

All development happens through Docker via the Makefile:

```bash
make build      # Build Docker image
make server     # Start both services (backend :8000, frontend :5173)
make clean      # Stop containers
make restart    # Stop then start
make logs       # Tail container logs
make test       # Run backend pytest suite in container
```

**Health check:** `curl http://localhost:8000/health`

## Domain Model

### 4-Level Hierarchy (Filesystem-Backed)

```
initiatives/
  └── {initiative-slug}/              ← Initiative (folder)
      └── {entity-slug}/             ← Entity (subfolder — domain sub-group)
          └── {feature-slug}.feature ← Feature (Gherkin .feature file)
              └── Scenario           ← User Story (Gherkin Scenario block)
```

- **Initiatives** and **Entities** are named folders — no metadata, just kebab-case slugs
- **Features** are `.feature` files with Gherkin content and metadata via tags
- **User Stories** are `Scenario` blocks within a `.feature` file with metadata via tags

### Gherkin Tag Conventions

Tags placed above `Feature:` or `Scenario:` lines, format `@category-value`:

| Category | Values | Applies To |
|----------|--------|------------|
| Status | `@status-draft`, `@status-active`, `@status-in_progress`, `@status-done`, `@status-completed`, `@status-archived` | Feature, Story |
| Priority | `@priority-low`, `@priority-medium`, `@priority-high`, `@priority-critical` | Feature, Story |
| Points | `@points-1`, `@points-2`, `@points-3`, `@points-5`, `@points-8`, `@points-13` | Story only |

### Naming Conventions

- Folder names: kebab-case (e.g., `improve-onboarding`, `user-profile`)
- File names: kebab-case with `.feature` extension (e.g., `login-flow.feature`)
- Slugs are derived from folder/file names, not from Gherkin `Feature:` titles

## Architecture

### Full-Stack Data Flow

```
Frontend (React) → API Service → React Query → FastAPI Router → Service Layer → GitHub API → .feature files
                                     ↓
                          React Query Cache ← JSON Response ← Pydantic Schema ← Gherkin Parser
```

### Backend (Router → Service → GitHub API)

- **Routers** (`backend/app/api/v1/`): HTTP endpoints, input validation, call services
- **Services** (`backend/app/services/`): Business logic, Gherkin parsing/serialization, GitHub API calls
- **GitHub Client** (`backend/app/core/github_client.py`): Authenticated GitHub API wrapper
- **Gherkin** (`backend/app/gherkin/`): Parser and serializer for `.feature` file content
- **Schemas** (`backend/app/schemas/`): Pydantic models for request/response

**Rules:**
- Never call GitHub API directly in routers (always call services)
- Never return raw GitHub API responses from endpoints (map to Pydantic schemas)
- All route handlers are async
- Use dependency injection via `Annotated[GitHubClient, Depends(get_github_client)]`
- Gherkin files are the source of truth — never store metadata outside of tags

See `backend/CLAUDE.md` for detailed backend conventions.

### Frontend (Sidebar + Detail Panel)

**Page → React Query Hook → API Service → Backend**

- **Pages** (`frontend/src/pages/`): `ManagerPage.tsx` — main layout with sidebar + detail panel
- **Services** (`frontend/src/services/`): `initiativeApi.ts`, `entityApi.ts`, `featureApi.ts`, `storyApi.ts`
- **Types** (`frontend/src/types/`): Initiative, Entity, Feature, Story, GherkinStep, Status, Priority
- **Components**:
  - `ui/` — generic reusable (Button, Modal, TreeView, Badge)
  - `features/sidebar/` — collapsible 4-level tree navigation
  - `features/detail-panel/` — view/edit forms per entity type
  - `features/gherkin/` — ScenarioEditor, StepEditor, TagEditor

**Rules:**
- All HTTP calls go through `services/api.ts` (never use `fetch` directly)
- Server state via React Query (`useQuery`/`useMutation`)
- Path alias `@` maps to `./src`
- Invalidate related queries after mutations (always invalidate `["initiatives", "tree"]`)

See `frontend/CLAUDE.md` for detailed frontend conventions.

## API Endpoint Summary

**Initiatives** (folder CRUD):
```
GET/POST   /api/v1/initiatives/
PUT/DELETE /api/v1/initiatives/{slug}
```

**Entities** (subfolder CRUD, nested under initiative):
```
GET/POST   /api/v1/initiatives/{initiative_slug}/entities/
PUT/DELETE /api/v1/initiatives/{initiative_slug}/entities/{entity_slug}
```

**Features** (.feature file CRUD):
```
GET/POST   /api/v1/initiatives/{initiative_slug}/entities/{entity_slug}/features/
GET/PUT/DELETE /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}
```

**Stories** (Scenario CRUD within a .feature file):
```
GET/POST   /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}/stories
PUT/DELETE /api/v1/stories/{initiative_slug}/{entity_slug}/{feature_slug}/{story_index}
```

**Tree** (full hierarchy for sidebar):
```
GET /api/v1/initiatives/tree
```

## Adding a New Feature (Full-Stack)

Follow this order to maintain type safety from backend to frontend:

### Backend (First)
1. Define Pydantic schemas in `backend/app/schemas/` (Create, Update, Response)
2. Create service in `backend/app/services/` (calls GitHub client, parses Gherkin as needed)
3. Create router in `backend/app/api/v1/`
4. Register router in `backend/main.py` (`app.include_router(...)`)
5. Add tests in `backend/tests/` (mock GitHub API responses)

### Frontend (After Backend Types are Defined)
1. Add TypeScript types in `frontend/src/types/index.ts` (mirror Pydantic schemas)
2. Create API service + React Query hooks in `frontend/src/services/`
3. Create page/components in `frontend/src/pages/` and `frontend/src/components/`
4. Update routing in `frontend/src/App.tsx`

## Environment Variables

Set in `docker/docker-compose.yml` or override locally:

| Variable | Default | Used By | Purpose |
|----------|---------|---------|---------|
| `APP_GITHUB_TOKEN` | (required) | Backend | GitHub personal access token |
| `APP_GITHUB_REPO` | (required) | Backend | Target repository (`owner/repo`) |
| `APP_GITHUB_BRANCH` | `main` | Backend | Branch to read/write files |
| `APP_FEATURES_BASE_PATH` | `initiatives/` | Backend | Root path in repo for initiative folders |
| `VITE_API_URL` | `http://localhost:8000` | Frontend | Backend API base URL |

## Testing

Backend tests use pytest with async support. Tests mock GitHub API responses — no real GitHub calls in tests.

**Run tests:** `make test`
**Test fixtures:** `backend/tests/conftest.py` provides `mock_github_client` and `async_client`
**Fixture data:** `backend/tests/fixtures/` contains sample `.feature` files
**Pattern:** Test files mirror module structure (`test_initiatives_router.py` tests `initiatives.py`)

## Project Structure Note

This is a **monorepo** with separate CLAUDE.md files:
- **`backend/CLAUDE.md`**: Backend-specific architecture rules and conventions
- **`frontend/CLAUDE.md`**: Frontend-specific architecture rules and conventions
- **This file**: Cross-cutting concerns and full-stack workflow
- **`docs/specs.md`**: Authoritative PRD — defines the data model, API endpoints, and UI behavior

When working in backend/ or frontend/ directories, read the respective CLAUDE.md for detailed guidance.

## Best Practices

- **Start with the backend** — define schemas and endpoints before frontend types
- **Keep it simple** — follow existing patterns rather than introducing new abstractions
- **Test as you go** — mock GitHub API and provide sample `.feature` file content
- **Commit incrementally** — small, focused commits are easier to review and revert
- **Gherkin is the contract** — all metadata lives in tags, all content lives in Feature/Scenario blocks
- **Never bypass the service layer** — routers should not call GitHub API or parse Gherkin directly
- **Reference the PRD** — `docs/specs.md` defines the data model, API endpoints, and UI behavior

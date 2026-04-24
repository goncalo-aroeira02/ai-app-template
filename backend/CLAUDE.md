## Tech Stack

- Python 3.12+
- FastAPI
- PyGithub (GitHub API client)
- gherkin-official (Gherkin parser) or custom parser module
- Pydantic v2 for request/response models
- httpx (async HTTP, also used for testing)
- Poetry for dependency management
- No database — GitHub is the storage layer

## Project Structure

```
app/
├── api/
│   └── v1/
│       ├── initiatives.py       # CRUD for initiative folders
│       ├── entities.py          # CRUD for entity folders (nested under initiative)
│       ├── features.py          # CRUD for .feature files
│       └── stories.py           # CRUD for Scenario blocks within .feature files
├── schemas/
│   ├── initiative.py            # InitiativeCreate, InitiativeResponse
│   ├── entity.py                # EntityCreate, EntityResponse
│   ├── feature.py               # FeatureCreate, FeatureUpdate, FeatureResponse
│   └── story.py                 # StoryCreate, StoryUpdate, StoryResponse (with GherkinStep)
├── services/
│   ├── initiative_service.py    # List/create/rename/delete initiative folders via GitHub API
│   ├── entity_service.py        # List/create/rename/delete entity folders via GitHub API
│   ├── feature_service.py       # Read/write .feature files, parse Gherkin
│   └── story_service.py         # Add/update/remove Scenario blocks within a .feature file
├── gherkin/
│   ├── parser.py                # Parse .feature content → domain objects
│   └── serializer.py            # Domain objects → .feature content string
├── core/
│   ├── config.py                # Settings via pydantic-settings (APP_ prefix)
│   └── github_client.py         # Authenticated GitHub client (repo, branch, base path)
└── main.py                      # FastAPI app with CORS + lifespan (GitHub connection check)
tests/
├── conftest.py                  # Mock GitHub client fixture, async_client fixture
├── fixtures/                    # Sample .feature file content for tests
│   └── sample_login.feature
├── test_initiatives_router.py
├── test_entities_router.py
├── test_features_router.py
├── test_stories_router.py
└── test_gherkin_parser.py       # Unit tests for parser/serializer
```

## Architecture Rules

- **One router per domain.** `initiatives.py`, `entities.py`, `features.py`, `stories.py` under `api/v1/`.
- **Router → Service → GitHub API.** Routers validate input and call services. Services contain business logic, parse/serialize Gherkin, and call the GitHub client. Never call GitHub API directly in router functions.
- **All route handlers are `async def`.** Use async GitHub API calls.
- **Dependency injection via `Depends()`.** Use `Annotated[GitHubClient, Depends(get_github_client)]` for the GitHub client. Use `Annotated[Settings, Depends(get_settings)]` for config.
- **Pydantic models are the contract.** API consumers see Pydantic schemas, never raw GitHub API responses or Gherkin AST nodes. Map with appropriate conversion functions.
- **Gherkin files are the source of truth.** All metadata (status, priority, points) is stored as `@tag-value` in the `.feature` file itself. Never store metadata elsewhere.

## Domain Model

### Initiative (folder)
- Just a named folder: `initiatives/{slug}/`
- No metadata — CRUD is create/rename/delete folder

### Entity (subfolder)
- Named folder inside initiative: `initiatives/{initiative-slug}/{entity-slug}/`
- No metadata — CRUD is create/rename/delete folder

### Feature (.feature file)
- Path: `initiatives/{initiative-slug}/{entity-slug}/{feature-slug}.feature`
- Gherkin tags: `@status-*`, `@priority-*` on `Feature:` line
- Content: title, description, Scenario blocks

### User Story (Scenario block)
- Lives inside a `.feature` file, identified by index (0-based position)
- Gherkin tags: `@status-*`, `@priority-*`, `@points-*` on `Scenario:` line
- Content: title, Given/When/Then steps

## Gherkin Conventions

**Tag format:** `@category-value` (e.g., `@status-active`, `@priority-high`, `@points-5`)

**Recognized tags:**
- Status: `@status-draft`, `@status-active`, `@status-in_progress`, `@status-done`, `@status-completed`, `@status-archived`
- Priority: `@priority-low`, `@priority-medium`, `@priority-high`, `@priority-critical`
- Points (Scenario-level only): `@points-1`, `@points-2`, `@points-3`, `@points-5`, `@points-8`, `@points-13`

**File naming:** Kebab-case slug with `.feature` extension (e.g., `login-flow.feature`).
**Folder naming:** Kebab-case slug (e.g., `improve-onboarding/`).
**Slug derivation:** Slugs are derived from the file/folder name, not the Gherkin `Feature:` title inside the file.

## GitHub API Integration Patterns

**GitHubClient** wraps PyGithub (or httpx calls to GitHub REST API) with methods:
- `list_folders(path)` — list directories under a path
- `list_files(path, extension)` — list files in a directory
- `get_file_content(path)` → `(content: str, sha: str)`
- `create_file(path, content, message)` — create a file with commit message
- `update_file(path, content, sha, message)` — update using SHA for conflict detection
- `delete_file(path, sha, message)` — delete a file
- `create_folder(path)` — create a folder (via creating a `.gitkeep` placeholder)
- `delete_folder(path)` — delete all files in folder recursively

**SHA-based concurrency:** Every file update requires the current file SHA. Services must fetch the SHA before writing. This prevents conflicting overwrites. Return `409 Conflict` if SHA is stale.

**Commit messages:** Auto-generated, descriptive:
- `"feat: create initiative improve-onboarding"`
- `"update: modify login-flow.feature in improve-onboarding/authentication"`
- `"delete: remove payment-processing.feature"`

## API Routing Pattern

Nested routes for list/create (scoped to parent), flat routes for single-resource operations:

```
# Initiatives — top-level
GET/POST   /api/v1/initiatives/
PUT/DELETE /api/v1/initiatives/{slug}

# Entities — nested under initiative
GET/POST   /api/v1/initiatives/{initiative_slug}/entities/
PUT/DELETE /api/v1/initiatives/{initiative_slug}/entities/{entity_slug}

# Features — nested under entity for list/create, flat for get/update/delete
GET/POST       /api/v1/initiatives/{initiative_slug}/entities/{entity_slug}/features/
GET/PUT/DELETE /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}

# Stories — nested under feature for list/create, flat for update/delete
GET/POST   /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}/stories
PUT/DELETE /api/v1/stories/{initiative_slug}/{entity_slug}/{feature_slug}/{story_index}

# Tree — full hierarchy
GET /api/v1/initiatives/tree
```

The tree endpoint returns the full 4-level hierarchy in a single response for sidebar navigation.

## Cascade Delete Behavior

- Deleting an **initiative** deletes all entity folders, feature files, and their contents
- Deleting an **entity** deletes all feature files within it
- Deleting a **feature** deletes the entire `.feature` file (all scenarios)
- Deleting a **story** removes one Scenario block and rewrites the `.feature` file
- The service layer should verify the folder/file exists before deleting (return 404 if not found)

## Coding Conventions

- Pydantic schema naming: `{Entity}Create`, `{Entity}Update`, `{Entity}Response`.
- Route function naming: verb first, noun second (`get_feature`, `create_initiative`, `list_stories`).
- Error responses: raise `HTTPException` with specific status codes and detail messages.
  - `404` when folder/file/scenario not found
  - `409` when SHA conflict (file changed since last read)
  - `422` when Gherkin content is malformed
- Environment config: use `pydantic-settings` with `Settings` class. Access via `get_settings()`. Never use `os.getenv()`.

## Testing

- Framework: `pytest` + `pytest-asyncio` (auto mode)
- HTTP client: `httpx.AsyncClient` with `ASGITransport`
- GitHub API: **always mocked** — never make real GitHub API calls in tests
- Mock strategy: patch `GitHubClient` methods to return fixture data (sample `.feature` file content, folder listings)
- Gherkin parser/serializer: unit-tested independently with sample `.feature` strings in `tests/fixtures/`
- Test files mirror the modules they test
- Run tests: `make test`

## NEVER DO THIS

1. **Never call the GitHub API in routers.** Routers call services, services call the GitHub client.
2. **Never return raw GitHub API responses from endpoints.** Always map to a Pydantic Response schema.
3. **Never hardcode tokens, repo names, or secrets.** Use environment variables via `pydantic-settings`.
4. **Never store metadata outside of Gherkin tags.** Status, priority, and points live in the `.feature` file.
5. **Never make real GitHub API calls in tests.** Always mock the GitHub client.
6. **Never write Gherkin by string concatenation.** Use the serializer module in `app/gherkin/serializer.py`.

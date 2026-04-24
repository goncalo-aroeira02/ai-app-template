# MVP Implementation Plan: Product Initiative Manager

## MVP Scope

Get the full 4-level hierarchy working end-to-end with the simplest possible UI. Prove that GitHub-backed Gherkin CRUD works through a web interface.

### What's IN the MVP
- Full backend: GitHub client, Gherkin parser/serializer, all CRUD services and routers
- Tree endpoint for sidebar
- Frontend: sidebar tree navigation + detail panel with basic forms
- Create and delete at all 4 levels
- View/edit features and stories
- Docker env vars for GitHub config
- Gherkin parser unit tests + backend conftest rewrite

### What's CUT (deferred to post-MVP)
- **Rename** operations for initiatives and entities (complex copy+delete via GitHub API — just delete and recreate)
- **Story points** (remove from schemas, parser, and UI — add later)
- **Priority** on features and stories (keep only status for MVP — fewer dropdowns, simpler tags)
- **Badge component** (show status as plain text for now)
- **Modal component** (use browser `window.confirm()` for deletes)
- **TagEditor component** (use a simple `<select>` inline for status)
- **ScenarioEditor / StepEditor as separate components** (inline the editing directly in StoryDetail)
- **Comprehensive backend router tests** (keep only happy-path tests per router + Gherkin parser tests)
- **409 SHA conflict handling** (just re-fetch and overwrite — acceptable for single-user MVP)
- **docs/template-guide.md update** (not user-facing for MVP)

---

## Phase 1: Backend Core Infrastructure

### Task 1 — Update backend dependencies
- **Depends on:** none
- **Context:** `backend/pyproject.toml` currently has `sqlalchemy[asyncio]` and `aiosqlite`. Replace with GitHub + Gherkin deps.
- [ ] 1.1 — Remove `sqlalchemy[asyncio]` and `aiosqlite`
- [ ] 1.2 — Add `PyGithub >= 2.0`
- [ ] 1.3 — Add `gherkin-official >= 29.0`
- [ ] 1.4 — Keep `fastapi`, `uvicorn`, `pydantic-settings`, `python-multipart`, `httpx`

### Task 2 — Update backend config (`backend/app/core/config.py`)
- **Depends on:** 1
- **Context:** Replace `database_url` with GitHub settings. Uses `pydantic-settings` with `APP_` env prefix.
- [ ] 2.1 — Remove `database_url` field
- [ ] 2.2 — Add `github_token: str`, `github_repo: str`, `github_branch: str = "main"`, `features_base_path: str = "initiatives/"`

### Task 3 — Create GitHub client (`backend/app/core/github_client.py`)
- **Depends on:** 2
- **Context:** Replaces `database.py`. Wraps PyGithub. Injected via `Depends(get_github_client)`.
- [ ] 3.1 — `GitHubClient` class: init with `Settings`, store repo/branch/base_path
- [ ] 3.2 — `list_contents(path) -> list[ContentFile]` — list files/dirs at path
- [ ] 3.3 — `get_file_content(path) -> tuple[str, str]` — returns `(content, sha)`
- [ ] 3.4 — `create_file(path, content, message)` — create with commit
- [ ] 3.5 — `update_file(path, content, sha, message)` — update with SHA
- [ ] 3.6 — `delete_file(path, sha, message)` — delete file
- [ ] 3.7 — `delete_folder(path, message)` — recursively delete all files in folder
- [ ] 3.8 — `create_folder(path, message)` — create `.gitkeep` to establish folder
- [ ] 3.9 — `get_github_client()` dependency function

### Task 4 — Create Gherkin parser (`backend/app/gherkin/parser.py`)
- **Depends on:** 1
- **Context:** Parses `.feature` file content into domain objects. Must extract tags, Feature title/description, Scenario blocks with steps. MVP tags: status only (no priority/points).
- [ ] 4.1 — Define dataclasses: `ParsedFeature(tags, title, description, scenarios)`, `ParsedScenario(tags, title, steps)`, `ParsedStep(keyword, text)`
- [ ] 4.2 — `parse_feature(content: str) -> ParsedFeature`
- [ ] 4.3 — `extract_tags(tag_list) -> dict` — converts `["@status-active"]` to `{"status": "active"}`
- [ ] 4.4 — Handle edge cases: empty files, features with no scenarios, scenarios with no steps

### Task 5 — Create Gherkin serializer (`backend/app/gherkin/serializer.py`)
- **Depends on:** 4
- **Context:** Converts domain objects back to `.feature` file content. Must round-trip through parser.
- [ ] 5.1 — `serialize_feature(feature: ParsedFeature) -> str`
- [ ] 5.2 — `serialize_tags(metadata: dict) -> str`
- [ ] 5.3 — `serialize_scenario(scenario: ParsedScenario) -> str`
- [ ] 5.4 — Proper indentation (2 spaces for scenarios, 4 for steps) and blank lines between scenarios

### Task 6 — Gherkin parser/serializer unit tests
- **Depends on:** 4, 5
- **Context:** `backend/tests/test_gherkin_parser.py` + fixture files. No HTTP, no mocking.
- [ ] 6.1 — Create `backend/tests/fixtures/sample_login.feature` with multiple scenarios and `@status-*` tags
- [ ] 6.2 — Create `backend/tests/fixtures/sample_empty.feature` with only a Feature line
- [ ] 6.3 — Test parse extracts title, description, tags, scenarios correctly
- [ ] 6.4 — Test serialize produces valid Gherkin
- [ ] 6.5 — Test round-trip: `parse(serialize(parsed))` is equivalent

---

## Phase 2: Backend Schemas (MVP — no priority, no points)

### Task 7 — Create all Pydantic schemas
- **Depends on:** none
- **Context:** Create `backend/app/schemas/` files. MVP simplification: only `status` tag (no priority, no story points). All schemas in minimal form.
- [ ] 7.1 — `common.py`: Define `Status` string enum (`draft`, `active`, `in_progress`, `done`, `completed`, `archived`)
- [ ] 7.2 — `initiative.py`: `InitiativeCreate(name: str)`, `InitiativeResponse(slug: str, name: str, entity_count: int)`
- [ ] 7.3 — `entity.py`: `EntityCreate(name: str)`, `EntityResponse(slug: str, initiative_slug: str, name: str, feature_count: int)`
- [ ] 7.4 — `feature.py`: `FeatureCreate(title: str, description: str = "", status: str = "draft")`, `FeatureUpdate(title: str | None, description: str | None, status: str | None)`, `FeatureResponse(slug, initiative_slug, entity_slug, title, description, status, stories: list[StoryResponse])`
- [ ] 7.5 — `story.py`: `GherkinStep(keyword: str, text: str)`, `StoryCreate(title: str, steps: list[GherkinStep], status: str = "draft")`, `StoryUpdate(title | None, steps | None, status | None)`, `StoryResponse(index, title, status, steps: list[GherkinStep])`
- [ ] 7.6 — `tree.py`: `StoryBrief(index, title, status)`, `FeatureTree(slug, title, status, story_count, stories: list[StoryBrief])`, `EntityTree(slug, name, feature_count, features: list[FeatureTree])`, `InitiativeTree(slug, name, entity_count, entities: list[EntityTree])`

---

## Phase 3: Backend Services

### Task 8 — Create initiative service (`backend/app/services/initiative_service.py`)
- **Depends on:** 3, 7
- **Context:** CRUD for initiative folders. MVP: no rename (just create, list, delete).
- [ ] 8.1 — `list_initiatives(client) -> list[InitiativeResponse]` — list dirs at base_path, count entity sub-dirs
- [ ] 8.2 — `create_initiative(data, client) -> InitiativeResponse` — slugify name, create folder via `.gitkeep`
- [ ] 8.3 — `delete_initiative(slug, client) -> None` — delete folder recursively, 404 if not found

### Task 9 — Create entity service (`backend/app/services/entity_service.py`)
- **Depends on:** 3, 7
- **Context:** CRUD for entity subfolders. MVP: no rename.
- [ ] 9.1 — `list_entities(initiative_slug, client) -> list[EntityResponse]` — list dirs, count `.feature` files
- [ ] 9.2 — `create_entity(initiative_slug, data, client) -> EntityResponse` — slugify, create folder
- [ ] 9.3 — `delete_entity(initiative_slug, entity_slug, client) -> None` — recursive delete, 404 if not found

### Task 10 — Create feature service (`backend/app/services/feature_service.py`)
- **Depends on:** 3, 4, 5, 7
- **Context:** CRUD for `.feature` files. Uses Gherkin parser/serializer.
- [ ] 10.1 — `list_features(initiative_slug, entity_slug, client) -> list[FeatureBrief]` — list `.feature` files, parse each for title/status/story count
- [ ] 10.2 — `get_feature(initiative_slug, entity_slug, feature_slug, client) -> FeatureResponse` — read, parse, return full detail with stories
- [ ] 10.3 — `create_feature(initiative_slug, entity_slug, data, client) -> FeatureResponse` — serialize to Gherkin, create file
- [ ] 10.4 — `update_feature(initiative_slug, entity_slug, feature_slug, data, client) -> FeatureResponse` — read file+SHA, merge updates, serialize, write back
- [ ] 10.5 — `delete_feature(initiative_slug, entity_slug, feature_slug, client) -> None` — get SHA, delete, 404

### Task 11 — Create story service (`backend/app/services/story_service.py`)
- **Depends on:** 3, 4, 5, 7
- **Context:** CRUD for Scenario blocks within a `.feature` file. Reads full file, modifies scenario list, writes back.
- [ ] 11.1 — `list_stories(initiative_slug, entity_slug, feature_slug, client) -> list[StoryResponse]`
- [ ] 11.2 — `create_story(..., data, client) -> StoryResponse` — read file, append scenario, write back
- [ ] 11.3 — `update_story(..., story_index, data, client) -> StoryResponse` — modify scenario at index, write back
- [ ] 11.4 — `delete_story(..., story_index, client) -> None` — remove scenario at index, write back
- [ ] 11.5 — 404 for index out of bounds

### Task 12 — Create tree service (`backend/app/services/tree_service.py`)
- **Depends on:** 3, 4, 7
- **Context:** Builds full 4-level hierarchy for sidebar.
- [ ] 12.1 — `get_tree(client) -> list[InitiativeTree]` — recursively list initiatives → entities → features → scenarios

---

## Phase 4: Backend Routers + main.py

### Task 13 — Create initiatives router (`backend/app/api/v1/initiatives.py`)
- **Depends on:** 3, 8
- **Context:** MVP: no PUT/rename. `Annotated[GitHubClient, Depends(get_github_client)]`.
- [ ] 13.1 — `GET /` → list initiatives
- [ ] 13.2 — `POST /` (201) → create initiative
- [ ] 13.3 — `DELETE /{slug}` (204) → delete initiative

### Task 14 — Create entities router (`backend/app/api/v1/entities.py`)
- **Depends on:** 3, 9
- **Context:** Nested under initiatives. MVP: no PUT/rename.
- [ ] 14.1 — `GET /` → list entities for initiative
- [ ] 14.2 — `POST /` (201) → create entity
- [ ] 14.3 — `DELETE /{entity_slug}` (204) → delete entity

### Task 15 — Create features router (`backend/app/api/v1/features.py`)
- **Depends on:** 3, 10
- **Context:** Mixed routing: list/create nested, get/update/delete flat.
- [ ] 15.1 — Nested: `GET /` and `POST /` scoped to initiative+entity
- [ ] 15.2 — Flat: `GET /{initiative_slug}/{entity_slug}/{feature_slug}`
- [ ] 15.3 — Flat: `PUT /{initiative_slug}/{entity_slug}/{feature_slug}` — accepts `FeatureUpdate`
- [ ] 15.4 — Flat: `DELETE /{initiative_slug}/{entity_slug}/{feature_slug}` (204)

### Task 16 — Create stories router (`backend/app/api/v1/stories.py`)
- **Depends on:** 3, 11
- **Context:** Mixed routing: list/create nested under feature, update/delete flat.
- [ ] 16.1 — Nested: `GET /stories` and `POST /stories` under feature path
- [ ] 16.2 — Flat: `PUT /{initiative_slug}/{entity_slug}/{feature_slug}/{story_index}`
- [ ] 16.3 — Flat: `DELETE /{initiative_slug}/{entity_slug}/{feature_slug}/{story_index}` (204)

### Task 17 — Create tree endpoint (`backend/app/api/v1/tree.py`)
- **Depends on:** 12
- [ ] 17.1 — `GET /api/v1/initiatives/tree` → returns `list[InitiativeTree]`

### Task 18 — Rewrite `backend/main.py`
- **Depends on:** 13, 14, 15, 16, 17
- **Context:** Remove all old routers/models/DB imports. Register new routers.
- [ ] 18.1 — Remove items_router, dictionary_router, model imports, DB lifespan
- [ ] 18.2 — Import and register all 5 new routers with correct prefixes
- [ ] 18.3 — Keep CORS, health endpoint

---

## Phase 5: Backend Tests + Cleanup

### Task 19 — Rewrite test conftest (`backend/tests/conftest.py`)
- **Depends on:** 3, 18
- **Context:** Replace DB fixtures with mocked GitHub client.
- [ ] 19.1 — Remove `db_session` fixture and all SQLAlchemy imports
- [ ] 19.2 — Create `mock_github_client` fixture returning `MagicMock` of `GitHubClient`
- [ ] 19.3 — Update `async_client` fixture to override `get_github_client` dependency
- [ ] 19.4 — Helper to load fixture `.feature` files from `tests/fixtures/`

### Task 20 — Happy-path router tests (one test file, lean coverage)
- **Depends on:** 13, 14, 15, 16, 17, 19
- **Context:** MVP: single test per endpoint, happy path only. One file `test_routers.py` covering all endpoints.
- [ ] 20.1 — Test `GET /api/v1/initiatives/` returns list
- [ ] 20.2 — Test `POST /api/v1/initiatives/` returns 201
- [ ] 20.3 — Test `DELETE /api/v1/initiatives/{slug}` returns 204
- [ ] 20.4 — Test `GET .../entities/` returns list
- [ ] 20.5 — Test `POST .../entities/` returns 201
- [ ] 20.6 — Test `GET .../features/` returns list
- [ ] 20.7 — Test `POST .../features/` returns 201
- [ ] 20.8 — Test `GET /api/v1/features/{i}/{e}/{f}` returns parsed feature
- [ ] 20.9 — Test `GET /api/v1/initiatives/tree` returns nested hierarchy

### Task 21 — Remove old files
- **Depends on:** 18, 19
- **Context:** Clean up all template artifacts.
- [ ] 21.1 — Delete `backend/app/models/` (item.py, word.py, base.py)
- [ ] 21.2 — Delete `backend/app/schemas/item.py`, `word.py`
- [ ] 21.3 — Delete `backend/app/services/item_service.py`, `dictionary_service.py`
- [ ] 21.4 — Delete `backend/app/api/v1/items.py`, `dictionary.py`
- [ ] 21.5 — Delete `backend/app/core/database.py`
- [ ] 21.6 — Delete `backend/data/`, `backend/scripts/`
- [ ] 21.7 — Delete old test files: `test_items_router.py`, `test_dictionary_router.py`, `test_dictionary_service.py`, `test_models.py`, `test_schemas.py`

---

## Phase 6: Docker & Infrastructure

### Task 22 — Update Docker Compose + env example
- **Depends on:** 2
- **Context:** Add GitHub env vars to `docker/docker-compose.yml`.
- [ ] 22.1 — Add `APP_GITHUB_TOKEN`, `APP_GITHUB_REPO`, `APP_GITHUB_BRANCH`, `APP_FEATURES_BASE_PATH` to environment
- [ ] 22.2 — Create `.env.example` documenting all required variables

---

## Phase 7: Frontend Types & API Services

### Task 23 — Define TypeScript types (`frontend/src/types/index.ts`)
- **Depends on:** 7
- **Context:** Replace `ItemResponse` with all domain types. MVP: no priority, no points.
- [ ] 23.1 — `Status` union type
- [ ] 23.2 — `Initiative`, `InitiativeCreate`
- [ ] 23.3 — `Entity`, `EntityCreate`
- [ ] 23.4 — `GherkinStep`, `Feature`, `FeatureCreate`, `FeatureUpdate`
- [ ] 23.5 — `Story`, `StoryCreate`, `StoryUpdate`, `StoryBrief`
- [ ] 23.6 — Tree types: `InitiativeTree`, `EntityTree`, `FeatureTree`
- [ ] 23.7 — Remove `ItemResponse`

### Task 24 — Create initiative API service (`frontend/src/services/initiativeApi.ts`)
- **Depends on:** 23
- **Context:** Follow `itemApi.ts` pattern. MVP: no rename hook.
- [ ] 24.1 — `getInitiatives()`, `createInitiative(data)`, `deleteInitiative(slug)`, `getInitiativeTree()`
- [ ] 24.2 — Hooks: `useInitiatives()`, `useInitiativeTree()`, `useCreateInitiative()`, `useDeleteInitiative()`
- [ ] 24.3 — Mutations invalidate `["initiatives", "tree"]` and `["initiatives"]`

### Task 25 — Create entity API service (`frontend/src/services/entityApi.ts`)
- **Depends on:** 23
- [ ] 25.1 — `getEntities(initiativeSlug)`, `createEntity(initiativeSlug, data)`, `deleteEntity(initiativeSlug, entitySlug)`
- [ ] 25.2 — Hooks: `useEntities()`, `useCreateEntity()`, `useDeleteEntity()`

### Task 26 — Create feature API service (`frontend/src/services/featureApi.ts`)
- **Depends on:** 23
- [ ] 26.1 — `getFeatures(...)`, `getFeature(...)`, `createFeature(...)`, `updateFeature(...)`, `deleteFeature(...)`
- [ ] 26.2 — Hooks: `useFeatures()`, `useFeature()`, `useCreateFeature()`, `useUpdateFeature()`, `useDeleteFeature()`

### Task 27 — Create story API service (`frontend/src/services/storyApi.ts`)
- **Depends on:** 23
- [ ] 27.1 — `createStory(...)`, `updateStory(...)`, `deleteStory(...)`
- [ ] 27.2 — Hooks: `useCreateStory()`, `useUpdateStory()`, `useDeleteStory()`

### Task 28 — Remove old API service
- **Depends on:** 24
- [ ] 28.1 — Delete `frontend/src/services/itemApi.ts`

---

## Phase 8: Frontend UI (Minimal)

### Task 29 — Create TreeView component (`frontend/src/components/ui/TreeView.tsx`)
- **Depends on:** none
- **Context:** Generic collapsible tree node for sidebar. Reuse `cn()` from `lib/utils.ts`.
- [ ] 29.1 — Props: `label`, `children?`, `isExpanded?`, `onToggle`, `isSelected?`, `onClick?`
- [ ] 29.2 — Chevron icon + label + indented children

---

## Phase 9: Frontend Sidebar

### Task 30 — Create sidebar components
- **Depends on:** 24, 29
- **Context:** Build the 4-level collapsible tree. MVP: all nodes use TreeView, show status as text (no Badge). All in `frontend/src/components/features/sidebar/`.
- [ ] 30.1 — `SidebarTree.tsx`: calls `useInitiativeTree()`, renders initiative list, handles loading/error/empty, accepts `selectedItem` + `onSelect`
- [ ] 30.2 — `InitiativeNode.tsx`: collapsible, renders entity children
- [ ] 30.3 — `EntityNode.tsx`: collapsible, renders feature children
- [ ] 30.4 — `FeatureNode.tsx`: collapsible, shows status text, renders story children
- [ ] 30.5 — `StoryNode.tsx`: leaf node, shows title + status text, clickable

---

## Phase 10: Frontend Detail Panel

### Task 31 — Create detail panel components
- **Depends on:** 24, 25, 26, 27
- **Context:** MVP: simple forms, browser `confirm()` for deletes, plain `<select>` for status. All in `frontend/src/components/features/detail-panel/`.
- [ ] 31.1 — `EmptyState.tsx`: "Select an item from the sidebar"
- [ ] 31.2 — `DetailPanel.tsx`: switch on selected type → render correct detail component, or EmptyState if null
- [ ] 31.3 — `InitiativeDetail.tsx`: show name + entity count, "Create Entity" inline form, delete button with `confirm()`
- [ ] 31.4 — `EntityDetail.tsx`: show name + feature count, "Create Feature" inline form, delete button
- [ ] 31.5 — `FeatureDetail.tsx`: fetch via `useFeature()`, show title/description/status, edit mode with text inputs + status `<select>`, list stories, "Add Story" button, delete button
- [ ] 31.6 — `StoryDetail.tsx`: show title/status/steps, edit mode with title input + status `<select>` + inline step editing (keyword select + text input per step, add/remove steps), delete button

---

## Phase 11: Frontend Layout & Routing

### Task 32 — Create ManagerPage (`frontend/src/pages/ManagerPage.tsx`)
- **Depends on:** 30, 31
- **Context:** Two-panel layout replacing HomePage.
- [ ] 32.1 — Selection state: `{ type, slugs, index } | null`
- [ ] 32.2 — Sidebar (`w-80 border-r overflow-y-auto`) with `SidebarTree`
- [ ] 32.3 — Detail panel (`flex-1 overflow-y-auto p-6`) with `DetailPanel`
- [ ] 32.4 — "New Initiative" button in sidebar header

### Task 33 — Update App.tsx + delete old page
- **Depends on:** 32
- [ ] 33.1 — Replace `HomePage` import/route with `ManagerPage`
- [ ] 33.2 — Delete `frontend/src/pages/HomePage.tsx`

---

## Phase 12: Smoke Test

### Task 34 — End-to-end verification
- **Depends on:** 18, 33
- [ ] 34.1 — `make build && make server`
- [ ] 34.2 — `curl` the tree endpoint, verify response
- [ ] 34.3 — Open UI, verify sidebar loads hierarchy
- [ ] 34.4 — Create an initiative, entity, feature, and story through the UI
- [ ] 34.5 — Verify the `.feature` file was created in GitHub with correct Gherkin content
- [ ] 34.6 — Run `make test`, fix any failures

---

## Dependency Graph

```
Phase 1 (Core):        1 → 2 → 3
                       1 → 4 → 5 → 6

Phase 2 (Schemas):     7 (standalone)

Phase 3 (Services):    3+7 → 8,9    3+4+5+7 → 10,11    3+4+7 → 12

Phase 4 (Routers):     8→13  9→14  10→15  11→16  12→17  → 18

Phase 5 (Tests):       18 → 19 → 20,21

Phase 6 (Docker):      2 → 22

Phase 7 (FE Types):    7 → 23 → 24,25,26,27 → 28

Phase 8 (FE UI):       29 (standalone)

Phase 9 (FE Sidebar):  24+29 → 30

Phase 10 (FE Detail):  24+25+26+27 → 31

Phase 11 (FE Layout):  30+31 → 32 → 33

Phase 12 (Smoke):      18+33 → 34
```

**Total: 34 tasks** (down from 59 in the full plan)

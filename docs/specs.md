# PRD: Product Initiative Manager

## Feature Overview

A GitHub-synced Gherkin feature file manager for product teams. Provides a web UI to organize and manage work across a 4-level hierarchy that maps directly to the GitHub repository filesystem:

**Initiatives → Entities → Features (.feature files) → User Stories (Gherkin Scenarios)**

The GitHub repository is the single source of truth — there is no database. All content and metadata lives in the filesystem as folders and Gherkin `.feature` files.

## Core Requirements

- **4-level hierarchy** backed by GitHub filesystem:
  - Initiatives = folders under `initiatives/`
  - Entities = subfolders within an initiative (domain sub-groups like "payments", "users")
  - Features = `.feature` files inside entity folders
  - User Stories = `Scenario` blocks inside `.feature` files
- **Full CRUD at every level** via a web UI
- **Two-way sync with GitHub**: UI writes commit via GitHub API; GitHub edits (PRs, direct commits) reflected on next load
- **Gherkin format**: Feature files follow the Gherkin specification for BDD automation compatibility
- **Metadata via Gherkin tags**: Status, priority, and story points encoded as tags on Feature/Scenario blocks

## Data Model (Filesystem-Backed)

### Initiative (folder)

Path: `initiatives/{initiative-slug}/`

Initiatives are named folders — no metadata beyond the name. The slug is the folder name in kebab-case.

### Entity (subfolder)

Path: `initiatives/{initiative-slug}/{entity-slug}/`

Entities are domain sub-groups within an initiative (e.g., "payments", "users", "accounts"). Named folders with no metadata beyond the name.

### Feature (.feature file)

Path: `initiatives/{initiative-slug}/{entity-slug}/{feature-slug}.feature`

| Field         | Source                        | Description                          |
|---------------|-------------------------------|--------------------------------------|
| slug          | filename (without `.feature`) | Kebab-case identifier                |
| title         | `Feature:` line               | Human-readable feature name          |
| description   | Gherkin description block     | Free-text description under Feature  |
| status        | `@status-*` tag               | `draft`, `active`, `in_progress`, `done`, `completed`, `archived` |
| priority      | `@priority-*` tag             | `low`, `medium`, `high`, `critical`  |

### User Story (Gherkin Scenario)

Lives inside a `.feature` file as a `Scenario` block.

| Field               | Source                    | Description                          |
|---------------------|---------------------------|--------------------------------------|
| index               | position in file (0-based)| Identifies the scenario within the file |
| title               | `Scenario:` line          | Short summary                        |
| steps               | Given/When/Then lines     | BDD steps                            |
| status              | `@status-*` tag           | `draft`, `in_progress`, `done`       |
| priority            | `@priority-*` tag         | `low`, `medium`, `high`, `critical`  |
| story_points        | `@points-*` tag           | `1`, `2`, `3`, `5`, `8`, `13`        |

### Gherkin Tag Conventions

Tags are placed above `Feature:` or `Scenario:` lines using the format `@category-value`:

```
@status-active @priority-high @points-5
```

**Recognized tags:**
- Status: `@status-draft`, `@status-active`, `@status-in_progress`, `@status-done`, `@status-completed`, `@status-archived`
- Priority: `@priority-low`, `@priority-medium`, `@priority-high`, `@priority-critical`
- Story points (Scenario-level only): `@points-1`, `@points-2`, `@points-3`, `@points-5`, `@points-8`, `@points-13`

### Example `.feature` File

```gherkin
@status-active @priority-high
Feature: Login Flow
  As a user, I want to log in securely so that I can access my account.

  @status-in_progress @priority-high @points-5
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to the dashboard

  @status-draft @priority-medium @points-3
  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter an invalid password
    Then I should see an error message
```

### Filesystem Structure

```
initiatives/
├── improve-onboarding/
│   ├── glossary.md                          # (out of scope)
│   ├── authentication/
│   │   ├── login-flow.feature
│   │   └── password-reset.feature
│   └── user-profile/
│       └── profile-setup.feature
└── payments-revamp/
    ├── glossary.md                          # (out of scope)
    └── transactions/
        ├── payment-processing.feature
        └── refund-handling.feature
```

## Core Features

### 1. Initiative Management
- List all initiatives in the sidebar as top-level folders
- Create new initiative (creates folder in GitHub)
- Rename initiative (renames folder)
- Delete initiative with confirmation (deletes folder and all contents recursively)

### 2. Entity Management
- List entities within an initiative as sub-folders
- Create new entity within an initiative
- Rename entity
- Delete entity with confirmation (cascades to child features)

### 3. Feature Management
- List features within an entity as `.feature` files
- Create new feature (creates `.feature` file with Gherkin template)
- Edit feature title, description, status, and priority
- Delete feature with confirmation

### 4. User Story Management
- List user stories as Scenario blocks within a feature file
- Create new story (appends Scenario block to `.feature` file)
- Edit story title, steps (Given/When/Then), status, priority, and story points
- Delete story (removes Scenario block from file)

### 5. Sidebar Navigation
- Collapsible 4-level tree: Initiatives → Entities → Features → Stories
- Click to select and view details in the main panel
- Visual indicators for status (color-coded badges) on features and stories

### 6. Detail Panel
- Displays full details of the selected item
- For folders (initiatives/entities): name and child count
- For features: parsed Gherkin content with metadata tags
- For stories: Gherkin Scenario with step editor (Given/When/Then)
- Edit mode with save/cancel
- Delete button with confirmation dialog

### 7. Two-Way GitHub Sync
- All writes go through the GitHub API (creates commits)
- SHA-based concurrency: updates require current file SHA to prevent conflicts
- GitHub edits (PRs, direct commits) reflected on next UI load
- Auto-generated commit messages (e.g., `"feat: create initiative improve-onboarding"`)

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Python 3.12+, FastAPI, PyGithub, gherkin-official, Pydantic v2 |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4      |
| Storage  | GitHub repository (no database)                  |
| State    | TanStack React Query 5                           |
| Routing  | React Router 7                                   |
| Tooling  | Docker Compose, Poetry, npm                      |

## API Endpoints

### Initiatives (folder CRUD)
- `GET    /api/v1/initiatives/` — list initiative folders
- `POST   /api/v1/initiatives/` — create initiative folder
- `PUT    /api/v1/initiatives/{slug}` — rename initiative folder
- `DELETE /api/v1/initiatives/{slug}` — delete initiative folder (cascades)

### Entities (subfolder CRUD within initiative)
- `GET    /api/v1/initiatives/{initiative_slug}/entities/` — list entity folders
- `POST   /api/v1/initiatives/{initiative_slug}/entities/` — create entity folder
- `PUT    /api/v1/initiatives/{initiative_slug}/entities/{entity_slug}` — rename entity
- `DELETE /api/v1/initiatives/{initiative_slug}/entities/{entity_slug}` — delete entity (cascades)

### Features (.feature file CRUD)
- `GET    /api/v1/initiatives/{initiative_slug}/entities/{entity_slug}/features/` — list feature files
- `POST   /api/v1/initiatives/{initiative_slug}/entities/{entity_slug}/features/` — create feature
- `GET    /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}` — get parsed feature
- `PUT    /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}` — update feature
- `DELETE /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}` — delete feature

### Stories (Scenario CRUD within a .feature file)
- `GET    /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}/stories` — list scenarios
- `POST   /api/v1/features/{initiative_slug}/{entity_slug}/{feature_slug}/stories` — add scenario
- `PUT    /api/v1/stories/{initiative_slug}/{entity_slug}/{feature_slug}/{story_index}` — update scenario
- `DELETE /api/v1/stories/{initiative_slug}/{entity_slug}/{feature_slug}/{story_index}` — remove scenario

### Tree
- `GET    /api/v1/initiatives/tree` — full 4-level hierarchy for sidebar navigation

## Environment Variables

| Variable                | Default          | Description                         |
|-------------------------|------------------|-------------------------------------|
| `APP_GITHUB_TOKEN`      | (required)       | GitHub personal access token        |
| `APP_GITHUB_REPO`       | (required)       | Target repository (`owner/repo`)    |
| `APP_GITHUB_BRANCH`     | `main`           | Branch to read/write files          |
| `APP_FEATURES_BASE_PATH`| `initiatives/`   | Root path in repo for initiative folders |
| `VITE_API_URL`          | `http://localhost:8000` | Backend API base URL          |

## Implementation Plan (High-Level)

1. **Backend core** — GitHub client wrapper, Gherkin parser/serializer
2. **Backend schemas** — Pydantic schemas for all 4 entity types
3. **Backend services** — CRUD services for initiatives, entities, features, stories
4. **Backend routers** — REST endpoints + tree endpoint
5. **Backend tests** — Full test coverage with mocked GitHub API
6. **Frontend types** — TypeScript interfaces mirroring backend schemas
7. **Frontend API services** — API client functions + React Query hooks
8. **Frontend sidebar** — 4-level collapsible tree component
9. **Frontend detail panel** — View/edit forms with Gherkin step editor
10. **Frontend layout** — Sidebar + detail panel with routing

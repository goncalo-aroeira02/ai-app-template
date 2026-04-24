# Product Initiative Manager

A GitHub-synced Gherkin feature file manager for product teams. Organizes work across a 4-level hierarchy — **Initiatives → Entities → Features → User Stories** — using a GitHub repository as the single source of truth.

## Tech Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Backend  | Python 3.12+, FastAPI, PyGithub, gherkin-official   |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4          |
| Storage  | GitHub repository (no database)                      |
| State    | TanStack React Query 5                               |
| Routing  | React Router 7                                       |
| Tooling  | Docker Compose, Poetry, npm                          |

## Quick Start

```bash
# Build the Docker image
make build

# Start the app (backend on :8000, frontend on :5173)
make server

# Check health
curl http://localhost:8000/health

# View logs
make logs

# Run tests
make test

# Stop
make clean
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/               # REST endpoints (initiatives, entities, features, stories)
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Business logic + GitHub API calls
│   │   ├── gherkin/              # Gherkin parser and serializer
│   │   └── core/                 # Config, GitHub client
│   ├── tests/                    # pytest + mocked GitHub API
│   └── main.py                   # FastAPI app entry point
├── frontend/
│   ├── src/
│   │   ├── pages/                # ManagerPage (sidebar + detail panel)
│   │   ├── services/             # API clients + React Query hooks
│   │   ├── types/                # TypeScript interfaces
│   │   └── components/           # ui/, features/sidebar/, features/detail-panel/, features/gherkin/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── start.sh
├── docs/
│   ├── specs.md                  # Product Requirements Document
│   └── template-guide.md         # Detailed guide for using this template
├── CLAUDE.md                     # Root-level Claude Code instructions
└── Makefile                      # Build, run, test commands
```

## How It Works

### Filesystem as Data Model

The app manages Gherkin `.feature` files stored in a GitHub repository:

```
initiatives/
├── improve-onboarding/
│   ├── authentication/
│   │   ├── login-flow.feature
│   │   └── password-reset.feature
│   └── user-profile/
│       └── profile-setup.feature
└── payments-revamp/
    └── transactions/
        ├── payment-processing.feature
        └── refund-handling.feature
```

- **Initiative** = top-level folder (strategic goal/theme)
- **Entity** = subfolder (domain sub-group like "authentication", "transactions")
- **Feature** = `.feature` file (Gherkin format with BDD scenarios)
- **User Story** = `Scenario` block inside a feature file

### Metadata via Gherkin Tags

Status, priority, and story points are encoded as tags directly in the `.feature` files:

```gherkin
@status-active @priority-high
Feature: Login Flow
  As a user, I want to log in securely so that I can access my account.

  @status-in_progress @priority-high @points-5
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to the dashboard
```

### Two-Way GitHub Sync

- UI edits → committed to GitHub via the GitHub API
- GitHub edits (PRs, direct commits) → reflected in the UI on next load
- SHA-based concurrency prevents conflicting overwrites

## Architecture Overview

**Backend** (Router → Service → GitHub API):
- **Routers** (`api/v1/`) — HTTP endpoints, input validation
- **Services** (`services/`) — business logic, Gherkin parsing, GitHub API calls
- **Gherkin** (`gherkin/`) — parser and serializer for `.feature` files

**Frontend** (Sidebar + Detail Panel):
- **Sidebar** — collapsible 4-level tree navigation
- **Detail Panel** — view/edit forms with Gherkin step editor
- **Services** — API calls via `apiFetch` + React Query hooks

## Environment Variables

| Variable                 | Default                  | Description                    |
|--------------------------|--------------------------|--------------------------------|
| `APP_GITHUB_TOKEN`       | (required)               | GitHub API token               |
| `APP_GITHUB_REPO`        | (required)               | Target repo (`owner/repo`)     |
| `APP_GITHUB_BRANCH`      | `main`                   | Branch to read/write files     |
| `APP_FEATURES_BASE_PATH` | `initiatives/`           | Root path for initiative folders |
| `VITE_API_URL`           | `http://localhost:8000`  | Backend API URL                |

## AI-Assisted Development

This project includes `CLAUDE.md` files for Claude Code:

- **`CLAUDE.md`** (root) — repo-wide instructions (architecture, commands, domain model, endpoints)
- **`backend/CLAUDE.md`** — backend-specific rules (GitHub API patterns, Gherkin conventions, testing)
- **`frontend/CLAUDE.md`** — frontend-specific rules (component structure, React Query patterns, badge colors)
- **`docs/specs.md`** — full Product Requirements Document

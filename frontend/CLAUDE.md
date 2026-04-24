## Tech Stack

- React 19 (TypeScript) + Vite
- Tailwind CSS 4
- TanStack React Query 5 (server state)
- React Router 7 (routing)

## Project Structure

```
src/
├── pages/
│   └── ManagerPage.tsx              # Main layout: sidebar + detail panel
├── components/
│   ├── ui/
│   │   ├── Button.tsx               # Reusable button
│   │   ├── Modal.tsx                # Dialog/modal wrapper
│   │   ├── TreeView.tsx             # Collapsible tree for sidebar navigation
│   │   └── Badge.tsx                # Tag/status/priority badge display
│   └── features/
│       ├── sidebar/
│       │   ├── SidebarTree.tsx      # Full 4-level tree (initiatives → entities → features → stories)
│       │   ├── InitiativeNode.tsx   # Collapsible initiative folder node
│       │   ├── EntityNode.tsx       # Collapsible entity folder node
│       │   ├── FeatureNode.tsx      # Collapsible feature file node
│       │   └── StoryNode.tsx        # Leaf node for user stories (scenarios)
│       ├── detail-panel/
│       │   ├── DetailPanel.tsx      # Router/switcher by selected entity type
│       │   ├── InitiativeDetail.tsx # View/edit initiative (name only)
│       │   ├── EntityDetail.tsx     # View/edit entity (name only)
│       │   ├── FeatureDetail.tsx    # View/edit feature metadata + description
│       │   ├── StoryDetail.tsx      # View/edit scenario with step editor
│       │   └── EmptyState.tsx       # Welcome message when nothing selected
│       └── gherkin/
│           ├── ScenarioEditor.tsx   # Edit a single Scenario block
│           ├── StepEditor.tsx       # Given/When/Then step line editor
│           └── TagEditor.tsx        # Visual editor for @status, @priority, @points tags
├── services/
│   ├── api.ts                       # Base fetch client — all HTTP calls go here
│   ├── initiativeApi.ts             # Initiative CRUD + useInitiatives, useInitiativeTree hooks
│   ├── entityApi.ts                 # Entity CRUD + useEntities hooks
│   ├── featureApi.ts                # Feature CRUD + useFeature, useFeatures hooks
│   └── storyApi.ts                  # Story (Scenario) CRUD + useStory hooks
├── types/
│   └── index.ts                     # All entity types, enums, tree types
├── lib/
│   └── utils.ts                     # cn() — conditional class helper
├── App.tsx                          # Router setup, QueryClientProvider
├── main.tsx                         # React root + StrictMode
└── index.css                        # Tailwind directives
```

## Architecture Rules

- **API layer is the boundary.** All HTTP calls go through `services/api.ts`. Never use `fetch` directly in components.
- **Server state via React Query.** Use `useQuery` for reads, `useMutation` for writes. Invalidate related queries on success.
- **Path alias:** `@` maps to `./src` (configured in `vite.config.ts` and `tsconfig`).
- **API base URL:** Set via `VITE_API_URL` env var (defaults to `http://localhost:8000`).
- **Sidebar + detail panel layout.** The left sidebar shows the 4-level tree. The right panel shows the selected item's detail view or edit form.
- **Gherkin editing is structured.** Users edit scenarios via step editors (Given/When/Then dropdowns + text inputs), not raw text. Tags are edited via visual selectors, not free-text tag entry.

## Layout Architecture

The app uses a two-panel layout:
- **Left sidebar** (~300px fixed): Collapsible 4-level tree powered by the tree endpoint (`GET /api/v1/initiatives/tree`). Uses a single `useInitiativeTree` query.
- **Right detail panel** (flexible): Shows view/edit form for the selected item. Content varies by entity type.

**Selection state:** Managed locally in `ManagerPage.tsx` (or via URL params). Stores the selected entity's type and identifying slugs/index.

## Key TypeScript Types

```typescript
type Status = 'draft' | 'active' | 'in_progress' | 'done' | 'completed' | 'archived';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface Initiative {
  slug: string;
  name: string;          // display name derived from slug
  entityCount: number;
}

interface Entity {
  slug: string;
  initiativeSlug: string;
  name: string;
  featureCount: number;
}

interface Feature {
  slug: string;
  initiativeSlug: string;
  entitySlug: string;
  title: string;         // from Gherkin Feature: line
  description: string;   // from Gherkin description block
  status: Status;
  priority: Priority;
  stories: Story[];
}

interface Story {
  index: number;         // position of Scenario in file (0-based)
  title: string;         // from Gherkin Scenario: line
  status: Status;
  priority: Priority;
  points: number | null;
  steps: GherkinStep[];
}

interface GherkinStep {
  keyword: 'Given' | 'When' | 'Then' | 'And' | 'But';
  text: string;
}

// Tree types for sidebar
interface InitiativeTree extends Initiative {
  entities: EntityTree[];
}

interface EntityTree extends Entity {
  features: FeatureTree[];
}

interface FeatureTree {
  slug: string;
  title: string;
  status: Status;
  priority: Priority;
  storyCount: number;
  stories: StoryBrief[];
}

interface StoryBrief {
  index: number;
  title: string;
  status: Status;
}
```

## Adding a New Feature

1. Add TypeScript types in `src/types/index.ts`
2. Create API service functions in `src/services/yourApi.ts` using `apiFetch`
3. Create React Query hooks (useQuery/useMutation) in the same service file
4. Create page component in `src/pages/YourPage.tsx`
5. Add route in `src/App.tsx`
6. For reusable UI, add components to `src/components/ui/`
7. For feature-specific components, create `src/components/features/YourFeature/`

## React Query Cache Invalidation

After any mutation, invalidate related queries to keep the sidebar and detail panel in sync:

- **After initiative CRUD:** invalidate `["initiatives", "tree"]`, `["initiatives"]`
- **After entity CRUD:** invalidate `["initiatives", "tree"]`, `["entities"]`
- **After feature CRUD:** invalidate `["initiatives", "tree"]`, `["features"]`
- **After story CRUD:** invalidate `["initiatives", "tree"]`, `["features", initiativeSlug, entitySlug, featureSlug]`

Always invalidate the tree query — it powers the sidebar.

## Badge Color Map

Consistent color coding for status and priority badges across all components:

**Status:**
- `draft` = gray
- `active` / `in_progress` = blue
- `done` / `completed` = green
- `archived` = neutral/dim

**Priority:**
- `low` = gray
- `medium` = yellow
- `high` = orange
- `critical` = red

## Component Conventions

- **Sidebar nodes** receive tree data as props from `SidebarTree.tsx` (no individual queries per node).
- **Detail panel components** receive the entity's identifying info (slugs/index) as props, then fetch their own data via the appropriate hook (e.g., `useFeature(initiativeSlug, entitySlug, featureSlug)`).
- **Edit mode** is toggled within each detail component (not a separate route).
- **Delete** triggers a `Modal` confirmation dialog. On confirm: call delete mutation → clear selection → tree invalidation updates sidebar.
- Pages are named exports (`export function ManagerPage()`).
- Components are in `components/features/` (feature-specific) or `components/ui/` (generic).
- Types live in `types/` and mirror backend Pydantic schemas.
- API services are thin wrappers: one function per endpoint, typed return values.
- Tailwind classes directly in JSX. Use `cn()` for conditional classes.

## Coding Conventions

- Gherkin steps are always rendered as structured lists, not raw text blocks.
- Tag metadata (status, priority, points) is displayed as color-coded `Badge` components.
- Forms use controlled inputs with local state, submitted via React Query mutations.
- Error states from the API (404, 409 conflicts, 422 validation) are shown inline, not as alerts.

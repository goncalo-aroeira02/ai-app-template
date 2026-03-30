## Tech Stack

- React 19 (TypeScript) + Vite
- Tailwind CSS 4
- TanStack React Query 5 (server state)
- React Router 7 (routing)
- Web MediaRecorder API (audio capture)

## Project Structure

```
src/
├── pages/
│   └── HomePage.tsx          # Landing page with item list
├── components/
│   └── ui/
│       └── Button.tsx        # Reusable button component
├── services/
│   ├── api.ts                # Base fetch client — all HTTP calls go here
│   └── itemApi.ts            # GET /items (useItems hook)
├── types/
│   └── index.ts              # ItemResponse type
├── lib/
│   └── utils.ts              # cn() — conditional class helper
├── App.tsx                   # Router setup, QueryClientProvider
├── main.tsx                  # React root + StrictMode
└── index.css                 # Tailwind directives
```

## Architecture Rules

- **API layer is the boundary.** All HTTP calls go through `services/api.ts`. Never use `fetch` directly in components.
- **Server state via React Query.** Use `useQuery` for reads, `useMutation` for writes. Invalidate related queries on success.
- **Path alias:** `@` maps to `./src` (configured in `vite.config.ts` and `tsconfig`).
- **API base URL:** Set via `VITE_API_URL` env var (defaults to `http://localhost:8000`).

## Adding a New Feature

1. Add TypeScript types in `src/types/index.ts`
2. Create API service functions in `src/services/yourApi.ts` using `apiFetch`
3. Create React Query hooks (useQuery/useMutation) in the same service file
4. Create page component in `src/pages/YourPage.tsx`
5. Add route in `src/App.tsx`
6. For reusable UI, add components to `src/components/ui/`
7. For feature-specific components, create `src/components/features/YourFeature/`

## Key Domain Concepts

- **PhonemeResult:** `{ phoneme: string, expected: string, correct: boolean, hint?: string }`. The `PhoneticBreakdown` component renders one chip per result.
- **EvaluationResponse:** Array of `PhonemeResult` returned by POST `/evaluate`. Drives the color-coded IPA display.
- **CorrectionHint:** Shown when user clicks a red phoneme chip. Content comes from the backend error map (e.g., `"Sound should be /θ/ as in 'Think', not /f/ as in 'Finger'"`).
- **Session loop:** `SessionPage` advances through words in a list; failed phonemes are flagged for retry injection.

## Coding Conventions

- Pages are named exports (`export function HomePage()`).
- Components are in `components/features/` (feature-specific) or `components/ui/` (generic).
- Types live in `types/` and mirror backend Pydantic schemas.
- API services are thin wrappers: one function per endpoint, typed return values.
- Tailwind classes directly in JSX. Use `cn()` for conditional classes.

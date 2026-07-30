# Autonomous Research Agent — Frontend

A Next.js interface for the LangGraph research pipeline in `backend/` — ask a question,
optionally attach a PDF, and a six-agent graph (Planner → Information Gathering →
Research → Citation → Writer → Critic) plans, searches, retrieves, drafts, and
critiques a report before handing it back.

This app was built by reading the actual backend source end to end — the request/response
types, the API routes, and the pipeline visualization all mirror the real code, not an
assumed or idealized version of it. Three real gaps turned up along the way; they're
documented below rather than silently papered over.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. By default the app expects your FastAPI backend at
`http://localhost:8000` (see `.env.local`) — start it separately:

```bash
cd ../backend
uvicorn app.main:app --reload
```

## How the two servers talk to each other

Your FastAPI app has no CORS middleware configured, so a browser calling it directly from
a different origin (e.g. `localhost:3000` → `localhost:8000`) would be blocked. Rather than
touching the backend, this frontend proxies through its own server:

```
Browser  →  Next.js route handler (same origin, no CORS)  →  FastAPI backend
         app/api/research/route.ts   ─┐
         app/api/upload/route.ts      ├─►  RESEARCH_BACKEND_URL (server-side env var)
         app/api/health/route.ts     ─┘
```

The browser only ever calls `/api/research`, `/api/upload`, and `/api/health` on the
Next.js server itself. Those route handlers forward the request server-to-server (where
CORS doesn't apply), relay the backend's response, and normalize error shapes. This also
means `RESEARCH_BACKEND_URL` never ships to the client bundle.

## Backend notes — three things worth fixing

These were found by reading `backend/` and the top-level pipeline modules directly. None
of them block the frontend from working, but they're worth knowing about.

**1. `/upload` is never mounted.** `backend/app/api/upload.py` defines a working router,
but `backend/app/main.py` only includes `research_router`. As written, `POST /upload`
currently 404s. Fix:

```python
# backend/app/main.py
from app.api.upload import router as upload_router

app.include_router(research_router, prefix="/api/v1")
app.include_router(upload_router, prefix="/api/v1")  # add this
```

The frontend already calls `POST {RESEARCH_BACKEND_URL}/api/v1/upload`, matching the
`/api/v1` prefix used for `/research` — so no frontend change is needed once this is added.
Until then, attaching a PDF in the UI will show a clear inline error rather than failing
silently.

**2. Uploaded PDFs aren't indexed before retrieval.** `retriever.py` defines a fully
working `document_retriever_node` that indexes a document into Chroma before querying it —
but the actual graph (`backend/app/graph/workflow.py`) only uses
`information_gathering_node` (from `information_gathering.py`), which calls
`get_relevant_documents(question)` directly against whatever is already in the persisted
vector store. It never calls `index_document(document_path)` first. Practically, attaching
a new PDF saves the file and passes its path through, but doesn't currently make that PDF
searchable. Wiring `document_retriever_node` into the graph (or calling `index_document`
inside `information_gathering_node`) would close this gap — the frontend doesn't need any
changes either way, since it just passes `document_path` through as the API contract
specifies.

**3. The 3-retry cap on the critic loop doesn't fire.** `graph.py`'s
`route_after_critic` checks `state["retry_count"] >= 3`, but nothing in the codebase ever
increments `retry_count` — it's initialized to `0` in `run_workflow` and never touched
again. In practice the graph loops `research → citation → writer → critic` until the
critic approves, bounded only by LangGraph's own default recursion limit (which would
surface to this frontend as a request failure, not a clean rejection). One fix is
incrementing it in `critic_node` right before returning `state`:

```python
# critic_agent.py, inside critic_node, before `return state`
state["retry_count"] = state.get("retry_count", 0) + 1
```

The UI's copy was written to reflect actual current behavior (a loop with no guaranteed
cap, rather than a promised 3 passes), and the `/api/research` route gives the backend a
generous 5-minute window to finish rather than timing out on a slow-but-working run. It
still fully supports rendering `approved: false` responses correctly, so nothing needs to
change here if you add the increment above.

## Project structure

```
app/
  page.tsx                 the whole ask → results flow (client component)
  how-it-works/page.tsx    pipeline + API contract explainer
  layout.tsx               fonts, metadata, theme-flash prevention
  icon.tsx                 generated favicon
  api/
    research/route.ts      proxies POST /api/v1/research
    upload/route.ts        proxies POST /api/v1/upload
    health/route.ts        proxies GET / for the connection indicator
components/                header, footer, ask box, pipeline visualization,
                            report renderer, review card, history drawer, etc.
lib/
  types.ts                 TS types mirroring the Pydantic schemas exactly
  api-client.ts             typed fetch wrappers around the /api/* routes
  backend.ts                shared backend URL + error-shape helpers
  history.ts                localStorage-backed recent-questions store
```

## What's real vs. what's local-only

- The question/answer flow, PDF attach, and connection indicator all call your actual
  backend — nothing there is mocked.
- "Recent questions" (the history drawer) is stored in `localStorage` only. Your backend
  has no database or history endpoint (it has `sqlalchemy`/`aiosqlite` in
  `requirements.txt`, but nothing in the given code uses them), so this is a client-side
  convenience, not synced data. It's scoped to one browser.
- The pipeline animation shown while a request is in flight is a paced visual guess, not a
  real progress signal — the backend is a single synchronous call with no streaming
  endpoint. It's paired with a real elapsed-time clock so the UI never claims more
  precision than it has, and it holds at the Critic stage rather than completing until the
  actual response arrives.

## Configuration

| Variable               | Default                 | Where it's used                          |
| ----------------------- | ------------------------ | ----------------------------------------- |
| `RESEARCH_BACKEND_URL`  | `http://localhost:8000` | Server-side only, in `app/api/*/route.ts` |

Set it in `.env.local` (already created with the default) and restart `next dev` after
changing it.

## Design system

Type is IBM Plex Sans (UI/body) and IBM Plex Mono (labels, scores, technical metadata),
self-hosted via `@fontsource` rather than `next/font/google` — the sandbox this was built
in couldn't reach Google's font CDN at build time, and self-hosting sidesteps that
dependency in any environment. Colors, radii, shadows, and easing curves are defined as
CSS custom properties in `app/globals.css` under a Tailwind v4 `@theme` block, with a
class-based dark mode toggle (persisted to `localStorage`, no flash on load).

The recurring visual motif — a small six-node graph with a loop-back edge — isn't
decorative; it's a literal diagram of the LangGraph topology in `graph.py`, reused as the
logomark, the idle pipeline preview, the live loading indicator, and the completed-state
summary.

## Production build

```bash
npm run build
npm start
```

## Credit

Designed and built by **Lavanya Singh**.

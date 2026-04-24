# SAT Prep

Self-hosted SAT prep webapp. Vite + React + TypeScript.

## Setup

```
npm install
npm run dev
```

Dev server runs at the URL Vite prints (usually `http://localhost:5173`).

## Scripts

- `npm run dev` — start dev server with HMR
- `npm run build` — typecheck + production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run typecheck` — run the TypeScript compiler without emitting

## Project layout

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Top-level router/state container
├── App.module.css
├── assets/
│   ├── icons/                # SVGs (exported from Figma)
│   ├── images/               # PNG/WebP
│   └── fonts/                # Font files
├── styles/
│   ├── tokens.css            # Design tokens (CSS variables) — Figma bridge
│   ├── global.css            # Reset + body defaults
│   └── index.ts              # Single import for both stylesheets
├── components/
│   ├── Sidebar.tsx           + Sidebar.module.css
│   ├── ModuleDropdown.tsx    + ModuleDropdown.module.css
│   ├── BluebookGrid.tsx      + BluebookGrid.module.css
│   ├── SkillPicker.tsx       + SkillPicker.module.css (used by Practice + Test)
│   └── primitives/           # Reusable atoms (Btn, Pill, Label, Shell, Back)
├── views/
│   ├── HomeView.tsx
│   ├── PracticeView.tsx
│   ├── TestView.tsx
│   ├── formLayout.module.css # Shared page chrome for Practice + Test
│   ├── HistoryView.tsx       + HistoryView.module.css
│   └── session/
│       ├── SessionView.tsx   # Phase orchestrator (no DOM)
│       ├── QuestionsPhase.tsx
│       ├── BreakPhase.tsx
│       ├── ResultsPhase.tsx
│       └── ReviewPhase.tsx
├── hooks/
│   └── useBreakpoint.ts
├── lib/
│   ├── storage.ts            # localStorage wrapper
│   ├── modules.ts            # Module definitions for test/practice
│   ├── skills.ts             # Skill assignment
│   └── grid.ts               # Grid column math
├── data/
│   └── taxonomy.ts           # SAT section/category/skill taxonomy
└── types/
    └── index.ts              # Shared TypeScript types
```

## How styling works

Every component has a matching `.module.css` file next to it. CSS Modules
scope class names automatically so nothing collides across components.

All colors, spacing, font sizes, radii, and shadows come from CSS variables
defined in `src/styles/tokens.css`. Reference them as `var(--sat-tx)`,
`var(--sat-space-4)`, etc.

When you add a new component:

1. Create `Foo.tsx` and `Foo.module.css` next to each other.
2. In `Foo.module.css`, define classes using tokens: `color: var(--sat-tx);`
3. In `Foo.tsx`, import the styles: `import styles from "./Foo.module.css";`
4. Apply with `className={styles.className}`.

## Adding assets

- **Icons** (SVG): put in `src/assets/icons/`, import as URL or inline.
- **Images**: put in `src/assets/images/`, `import img from "./assets/images/foo.png"` then use as `src={img}`.
- **Fonts**: put in `src/assets/fonts/`, register via `@font-face` in `global.css`.

Vite handles asset imports natively — no extra config needed.

## Figma integration

`src/styles/tokens.css` is the single source of truth for design values. A
future Figma MCP or design-to-code tool should write to this file, and every
component picks up the change automatically via `var(--sat-*)` references.

## Status

This is the structural scaffold. AI question generation and Supabase
persistence are not yet wired — today, questions are placeholders and
correct answers are randomized so the UI can be exercised end-to-end.
Persistence uses `localStorage` via `src/lib/storage.ts`.

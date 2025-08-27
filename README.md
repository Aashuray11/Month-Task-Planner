# Month View Task Planner (React + TS + Tailwind)

A fast, frontend-only Month View Task Planner with drag-to-create, move, resize, filtering, search, and localStorage persistence.

## Features
- Month grid (Mon–Sun), 5/6 rows, today highlight
- Drag to select days → create task (name + category)
- Drag task to move; resize from left/right ends
- Categories: To Do, In Progress, Review, Completed (distinct colors)
- Filters: categories (multi), time window (All/1w/2w/3w), live search
- LocalStorage persistence, simple tooltips, month navigation

## Tech
- React + TypeScript (Vite)
- TailwindCSS
- date utilities (lightweight, no deps at runtime)

## Quick Start
1) Install dependencies (needed only once):
```powershell
npm install
```
2) Run dev server:
```powershell
npm run dev
```
3) Build for production:
```powershell
npm run build
npm run preview
```

If installation is slow, check your network and try a faster registry:
```powershell
npm config set registry https://registry.npmmirror.com
npm install
```

## Deployment
- Vercel/Netlify: import repo, framework = Vite, build = `npm run build`, output = `dist`

## Notes
- All data is in-memory with localStorage persistence.
- Drag-and-drop uses native pointer events; adding @dnd-kit is optional.
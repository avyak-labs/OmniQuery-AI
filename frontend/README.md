# 🖥️ OmniQuery-AI Enterprise Web Console

Production-grade web console built with **React 19**, **Vite 8**, **TypeScript**, and **Tailwind CSS v4** communicating via real-time Server-Sent Events (SSE) with the OmniQuery-AI FastAPI microservice.

---

## 🌟 Key Architecture & Features

1. **Autonomous LangGraph Intent Badges:**
   - Visual indicator displaying the routed engine (`ROUTED: TEXT-TO-SQL ENGINE` in Cyan, `ROUTED: ENTERPRISE DOCUMENT RAG` in Violet, `DIRECT SYNTHESIS` in Slate).

2. **Safe Read-Only SQL Inspector:**
   - Collapsible IDE-style code block showing the generated parameterized SQL query.
   - Dynamic query execution latency badge.
   - Styled tabular data preview with formatted currency/numeric values and colored status badges (`Shipped`, `Processing`, `Delivered`).

3. **Grounded Provenance Citations:**
   - Displays source document names, page numbers, and FlashRank cross-encoder relevance scores (`score >= 0.85`).

4. **Live System Status Monitoring:**
   - Real-time polling of `GET /api/v1/system/status` reporting live PostgreSQL connection health, active table record counts, and indexed pgvector chunks.

5. **Full Theme Engine:**
   - Seamless instant switching between **Dark Mode** (`#090d16` base, `#0f172a` surfaces) and **Light Mode** (`#f8fafc` base, `#ffffff` surfaces) with custom CSS token variables.

6. **Persistent Local Chat History:**
   - Sessions grouped chronologically (`Today` and `Previous 7 Days`) with automatic title summarization and browser `localStorage` persistence.

---

## 🛠️ Local Development

### Install Dependencies
```bash
npm install
```

### Start Vite Development Server
```bash
npm run dev
```
Runs at `http://localhost:5173/` with automated reverse-proxy for `/api` forwarded to the FastAPI backend at `http://localhost:8000`.

### Type Check & Production Build
```bash
npm run build
```
Generates optimized static assets in `dist/` in under 300ms with zero TypeScript errors.

---

## 🐳 Production Containerization

The console uses a multi-stage `Dockerfile`:
- **Stage 1 (Builder):** `node:20-alpine` runs `npm run build`.
- **Stage 2 (Runner):** Lightweight `nginx:alpine` serving static SPA assets on port `3000`.

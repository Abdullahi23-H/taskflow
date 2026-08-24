# TaskFlow — Learning Roadmap

## Project
Task management app (Trello-lite): **workspaces → boards → lists → cards**

## Stack
| Layer | Choice |
|-------|--------|
| Backend | Node.js + Express + TypeScript (`apps/api`, port 3001) |
| Database | MySQL 8 local (`taskflow`) + Prisma 7 |
| Frontend | React + Vite + TypeScript (`apps/web`, port 5173) |
| Auth | JWT (15 min expiry), bcrypt |

## Rules
- Do one phase at a time, never skip ahead
- Always keep existing functionality working
- Never break the current UI while adding new features
- Test each phase manually before moving to the next
- Update ROADMAP.md to mark steps as done after completing each one

## Git workflow — MANDATORY before and after every phase

### Before starting any phase — create a feature branch:
```
git checkout main
git pull origin main
git checkout -b feat/phase-name
```

### After a phase is fully done — commit and push:
```
git add .
git commit -m "feat: description of what was built"
git push origin feat/phase-name
```
Then go to GitHub, open a pull request, write what was built, merge it, then run:
```
git checkout main
git pull origin main
```

Cursor must remind the user of this workflow at the START and END of every phase.
This is not optional. Never skip it.

## Current step
**Phase 7 — Step 7.3:** Show due date + priority on card UI in BoardView

---

## Completed

### Phase 0 — Setup
- [x] Step 1a: Node, npm, git, MySQL installed
- [x] Step 1b: MySQL database `taskflow`
- [x] Step 1c: Git + ROADMAP + .gitignore

### Phase 1 — API foundation
- [x] Step 2: API folder + package.json
- [x] Step 3: Express + TypeScript + health check
- [x] Step 4: Prisma 7 + MySQL + User model

### Phase 2 — Auth
- [x] Step 7: POST `/api/auth/register`
- [x] Step 8: POST `/api/auth/login` + JWT
- [x] Step 9: `authMiddleware` + GET `/api/auth/me`

### Phase 3 — Core API
- [x] Step 10: Workspaces create + list
- [x] Step 11: Workspace get / update / delete
- [x] Step 12: Boards create + list + delete
- [x] Step 13: Lists create + list + delete
- [x] Step 14: Cards create + list
- [x] Step 15: Move card between lists (`PATCH .../cards/:id/move`)
- [x] Step 16: Update + delete card (`PATCH` / `DELETE .../cards/:id`)

### Phase 4 — Frontend MVP + UI
- [x] Step 17: React scaffold — TaskFlow page, `@taskflow/web`
- [x] Step 18: CORS on API + fetch `/health` from React
- [x] Step 19: Login + register pages + token storage
- [x] Step 20: Workspaces list + create UI
- [x] Step 21: Boards list + create UI (click workspace → boards)
- [x] Step 22: Board view — lists as columns + cards + create
- [x] Step 23: Tailwind CSS setup + full styling pass (login, workspaces, board)
- [x] Step 24 & 25: Delete workspace / board / list / card (frontend + missing backend routes)

---

## Up next

### Phase 5 — Testing
- [x] **Step 5.1:** Install Vitest + supertest; configure test environment
- [x] **Step 5.2:** Auth tests — register, login wrong password, `/me` without token
- [x] **Step 5.3:** Workspace tests — create, list, only owner can see
- [x] **Step 5.4:** Board tests — create, list, delete
- [x] **Step 5.5:** List and card tests — create, delete

### Phase 6 — React Router
- [x] **Step 6.1:** Install React Router v6; replace if/else navigation with routes
- [x] **Step 6.2:** Add protected routes (redirect to login if no token)
- [x] **Step 6.3:** Proper URLs: `/workspaces`, `/workspaces/:id`, `/boards/:id`

### Phase 7 — Card improvements
- [x] **Step 7.1:** Add `dueDate` field to card (Prisma migration + API)
- [x] **Step 7.2:** Add `priority` field (low / medium / high) with colored dot
- [ ] **Step 7.3:** Show due date + priority on card UI in BoardView

### Phase 8 — Dashboard page
- [ ] **Step 8.1:** Create `/dashboard` route with sidebar navigation
- [ ] **Step 8.2:** Show stats: total cards, in progress, completed, overdue
- [ ] **Step 8.3:** Show all cards across all workspaces grouped by status

### Phase 9 — Search
- [ ] **Step 9.1:** Add search endpoint to API (search cards by title)
- [ ] **Step 9.2:** Add search bar in navbar; show results as dropdown

### Phase 10 — Assignees
- [ ] **Step 10.1:** Add `assigneeId` field to card (Prisma migration + API)
- [ ] **Step 10.2:** Show assignee avatar initials on card UI

### Phase 11 — Deploy
- [ ] **Step 11.1:** Dockerize backend (`Dockerfile` + `.dockerignore`)
- [ ] **Step 11.2:** Deploy backend to Railway or Render
- [ ] **Step 11.3:** Deploy frontend to Vercel
- [ ] **Step 11.4:** Set up environment variables for production

---

## MySQL (local dev)
- User: `root`
- Database: `taskflow`
- Connection: `mysql://root:YOUR_PASSWORD@localhost:3306/taskflow`

## Test user
- Email: `test@example.com` / Password: `password123`

## How to resume in a new Cursor chat
1. Open `~/fst/prof_project` (repo root, not `apps/api` alone)
2. Cursor rule `.cursor/rules/taskflow-learning.mdc` loads automatically
3. Say: **"Continue from current step in ROADMAP"** or **"Step X done"**

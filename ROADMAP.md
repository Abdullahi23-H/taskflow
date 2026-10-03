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
**Phase 11 — Step 11.1:** Prepare backend for production

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
- [x] **Step 7.3:** Show due date + priority on card UI in BoardView

### Phase 8 — Dashboard page
- [x] **Step 8.1:** Create `/dashboard` route with stats and card list
- [x] **Step 8.2:** Show stats: total cards, in progress, completed, overdue
- [x] **Step 8.3:** Shared Navbar component + ProtectedLayout in App.tsx

### Phase 9 — Search
- [x] **Step 9.1:** Add search endpoint to API (search cards by title)
- [x] **Step 9.2:** Add search bar in navbar; show results as dropdown

### Phase 10 — Assignees
- [x] **Step 10.1:** Add `assigneeId` field to card (Prisma migration + API)
- [x] **Step 10.2:** Show assignee avatar initials on card UI

### Phase 11 — Deploy
> Git workflow first — before starting anything run:
> ```
> git checkout master
> git pull origin master
> git checkout -b feat/phase-11-deploy
> ```

- [ ] **Step 11.1 — Prepare backend for production**
  - Add `"build": "tsc"` script to `apps/api/package.json`
  - Add `"start": "node dist/index.js"` script
  - Move `JWT_SECRET` and `DATABASE_URL` to `process.env` (no hardcoded values)
  - Configure CORS to read allowed origin from `process.env.FRONTEND_URL`
  - Create `apps/api/.env.example` with all required variable names (no real values)
  - Add `prisma migrate deploy` to the build command

- [ ] **Step 11.2 — Prepare frontend for production**
  - Replace every hardcoded `http://localhost:3001` with `import.meta.env.VITE_API_URL`
  - Update `apps/web/src/lib/api.ts` to use `VITE_API_URL` as the base URL
  - Create `apps/web/.env.example` with `VITE_API_URL=https://your-render-url.onrender.com`
  - Verify `npm run build` completes without errors

- [ ] **Step 11.3 — Deploy database on Render**
  - Go to render.com → create free account
  - Click New → PostgreSQL → free tier
  - Copy the **Internal Database URL**
  - Save it — needed in next step

- [ ] **Step 11.4 — Deploy backend on Render**
  - Click New → Web Service on Render
  - Connect GitHub repo
  - Set root directory: `apps/api`
  - Build command: `npm install && npm run build && npx prisma migrate deploy`
  - Start command: `npm start`
  - Runtime: Node
  - Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL` (add after Step 11.5)
  - Copy the Render backend URL after deploy succeeds

- [ ] **Step 11.5 — Deploy frontend on Vercel**
  - Go to vercel.com → create free account
  - Connect GitHub repo → select `apps/web` folder
  - Add environment variable: `VITE_API_URL=<Render backend URL from Step 11.4>`
  - Click deploy
  - Copy the Vercel frontend URL
  - Go back to Render → update `FRONTEND_URL` with the Vercel URL

- [ ] **Step 11.6 — Connect Namecheap domain**
  - Log in to namecheap.com → Domain List → confirm domain is Active (renew if expired)
  - **Frontend:** Vercel → project → Settings → Domains → add your domain → copy DNS records → paste in Namecheap Advanced DNS
  - **Backend:** Use `api.yourdomain.com` → Render → Settings → Custom Domains → add `api.yourdomain.com` → copy DNS record → paste in Namecheap Advanced DNS
  - Wait 24–48 hours for DNS propagation

- [ ] **Step 11.7 — Test everything in production**
  - Test register and login
  - Test creating workspace, board, list, card
  - Test dashboard stats
  - Test search
  - Verify all pages load on the custom domain
  - Check Render logs and Vercel logs if anything fails

- [ ] **Step 11.8 — Final Git cleanup**
  - `git add .`
  - `git commit -m "feat: add production deployment configuration"`
  - `git push origin feat/phase-11-deploy`
  - Open PR on GitHub → merge into master
  - `git checkout master && git pull origin master`

> **Final result:**
> - `yourdomainname.com` → Frontend on Vercel
> - `api.yourdomainname.com` → Backend on Render
> - Database → Render PostgreSQL

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

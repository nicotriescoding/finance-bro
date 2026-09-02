# finance-bro multiplayer worker

Cloudflare worker: one Durable Object per lobby (WebSockets, server-side
grading, the "Inflation" bot) + the D1 semester scoreboard (BroDollars
earned, overall and per subject - fed by solo postings and duels). Everything fits the
Cloudflare free tier, and free-tier resources are never paused or deleted for
inactivity (unlike Supabase - see CLAUDE.md hard rule 1).

The worker bundles the SAME question banks and grading code as the site (via
the `@/*` path alias into `../src`), so a deploy of new questions means:
push to `main` -> Vercel rebuilds the site AND Cloudflare rebuilds the worker.

## One-time setup (Cloudflare dashboard, ~10 minutes)

1. **Create the D1 database.** Dashboard -> Storage & Databases -> D1 ->
   Create -> name it `finance-bro-mp`. Copy the Database ID into
   `wrangler.jsonc` (`database_id`). Then apply the schema: open the database
   -> Console -> paste the contents of `schema.sql` and run it.
   (Or with the CLI: `npx wrangler d1 create finance-bro-mp` and
   `npx wrangler d1 execute finance-bro-mp --remote --file=schema.sql`.)
2. **Connect the repo.** Dashboard -> Workers & Pages -> Create -> Workers ->
   Import a repository -> pick `nicotriescoding/finance-bro`.
   - Project name: `finance-bro-mp`
   - Root directory: `worker`
   - Build command: leave default (`npx wrangler deploy` runs from the root
     directory)
   Every push to `main` now auto-deploys the worker, same flow as Vercel.
3. **Point the site at it.** Vercel -> Project -> Settings -> Environment
   Variables -> add `NEXT_PUBLIC_MP_URL` = the worker URL from step 2
   (e.g. `https://finance-bro-mp.<account>.workers.dev`, no trailing slash)
   -> redeploy. Until this is set, /multiplayer shows the canon placeholder.

## Local development

```bash
cd worker
npm install
npm run dev        # local worker on :8787 (uses a local D1)
npm run typecheck
```

Run the site with `NEXT_PUBLIC_MP_URL=http://localhost:8787 npm run dev` to
play against yourself in two tabs. `npx tsx worker/test/e2e.ts` from the repo
root plays three games and exercises the scoreboard endpoints against it.

## Endpoints

| Method | Path                  | Purpose                          |
| ------ | --------------------- | -------------------------------- |
| POST   | /api/rooms            | create a lobby, returns `{code}` |
| GET    | /api/rooms/:code/ws   | WebSocket join                   |
| GET    | /api/leaderboard      | semester scoreboard: `?subject=all\|<id>&pid=` -> rows + your rank |
| POST   | /api/earnings         | one settled solo posting `{pid,name,qid,seed,value,amount}` - re-graded, capped, paid once |
| POST   | /api/players/name     | claim/change the desk name `{pid,name}` |

## Design notes

- Room codes: 5 chars, no 0/O/1/I. The DO id is `idFromName(code)`.
- The server only ever sends `(question id, seed)` - clients build the posting
  locally with the shared engine. Answers are graded in the DO with
  `isWithinTolerance`, so the scoreboard cannot be faked from devtools.
- Modes: **Front Running 🏃** (shared posting, first correct settles it,
  120s deadline, 3s wrong-answer lockout) and **Bull Run 🐂** (own pace,
  write-offs re-queue with fresh seeds, first finished statement wins).
- The bot answers on Durable Object alarms with per-difficulty delay and
  accuracy (see `BOT_TUNING` in `src/lobby.ts`).
- Scoreboard rows are upserted per (semester, player id, subject): at game
  end from the DO (bell bonus goes to the subject that paid the winner most),
  and per solo posting from `/api/earnings` after the worker re-graded the
  answer itself. Unclaimed players get a numbered intern name derived from
  their id (`src/lib/scoreboard/shared.ts`).
- Schema changes: re-run `npx wrangler d1 execute finance-bro-mp --remote
  --file=schema.sql` (idempotent). The v1 `leaderboard` (wins) table is
  unused since 2026-09-02 and can be dropped.
- BroDollars: every settled/won posting pays its difficulty's base points
  (`maxPoints`), the winner gets a flat closing-bell bonus (`WIN_BONUS`).
  Computed server-side, credited to the local `bwr_score_v1` balance by the
  client once, on the `end` message.

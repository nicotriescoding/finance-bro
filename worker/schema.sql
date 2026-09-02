-- D1 schema for the semester scoreboard.
-- Apply with:  npx wrangler d1 execute finance-bro-mp --remote --file=schema.sql
-- (idempotent - safe to re-run after every change to this file)

-- BroDollars earned per player, per semester, per subject. "Overall" is the
-- SUM over subjects at query time. Written by the worker only: solo postings
-- via POST /api/earnings (re-graded first), multiplayer games from the Lobby
-- Durable Object at the closing bell.
CREATE TABLE IF NOT EXISTS earnings (
    semester   TEXT    NOT NULL,
    player_id  TEXT    NOT NULL,
    subject    TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    amount     INTEGER NOT NULL DEFAULT 0,
    postings   INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (semester, player_id, subject)
);
CREATE INDEX IF NOT EXISTS idx_earnings_subject
    ON earnings (semester, subject, amount DESC);

-- Replay guard for solo reports: one (player, question, seed) pays once.
CREATE TABLE IF NOT EXISTS settled_postings (
    player_id  TEXT    NOT NULL,
    qid        TEXT    NOT NULL,
    seed       INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (player_id, qid, seed)
);

-- The wins-based v1 table is no longer written or read (2026-09-02, the
-- board ranks BroDollars now). Drop it once the new schema is live:
--   DROP TABLE IF EXISTS leaderboard;

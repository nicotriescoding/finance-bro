-- D1 schema for the semester leaderboard.
-- Apply with:  npx wrangler d1 execute finance-bro-mp --remote --file=schema.sql
CREATE TABLE IF NOT EXISTS leaderboard (
    semester   TEXT    NOT NULL,
    player_id  TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    wins       INTEGER NOT NULL DEFAULT 0,
    games      INTEGER NOT NULL DEFAULT 0,
    settled    INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (semester, player_id)
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank
    ON leaderboard (semester, wins DESC, settled DESC);

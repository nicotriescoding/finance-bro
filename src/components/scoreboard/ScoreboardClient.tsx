"use client";

/**
 * The semester leaderboard - BroDollars earned this semester, one tab for the
 * whole book and one per subject. Your own standing rides on top even when
 * you are not in the visible rows, and an intern still on the board without
 * a name gets nudged to claim one (the name is shared with the duels desk).
 *
 * Hard rule 1: optional extra. No worker configured or unreachable -> the
 * "desk not staffed" card, never a blank page.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SUBJECTS } from "@/content/subjects";
import { formatMoney, MONEY } from "@/lib/money";
import type { SubjectId } from "@/lib/questions/types";
import {
    claimDeskName,
    claimedName,
    deskName,
    fetchScoreboard,
    myPlayerId,
    scoreboardEnabled,
} from "@/lib/scoreboard/client";
import { MAX_NAME_LENGTH } from "@/lib/multiplayer/protocol";
import type { ScoreboardResponse, ScoreboardScope } from "@/lib/scoreboard/shared";
import AdSlot from "@/components/AdSlot";

const CARD =
    "rounded-[14px] border border-hairline bg-surface shadow-[0_1px_2px_rgba(15,33,55,.05)]";

const TABS: { scope: ScoreboardScope; label: string; emoji: string }[] = [
    { scope: "all", label: "Overall", emoji: "🏆" },
    ...SUBJECTS.map((s) => ({ scope: s.id as SubjectId, label: s.short, emoji: s.emoji })),
];

export default function ScoreboardClient() {
    const [scope, setScope] = useState<ScoreboardScope>("all");
    const [data, setData] = useState<ScoreboardResponse | null>(null);
    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState({ id: "", name: "", claimed: "" });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        setMe({ id: myPlayerId().slice(0, 6), name: deskName(), claimed: claimedName() });
    }, []);

    useEffect(() => {
        if (!scoreboardEnabled) {
            setLoading(false);
            return;
        }
        let alive = true;
        setLoading(true);
        setFailed(false);
        fetchScoreboard(scope)
            .then((d) => {
                if (!alive) return;
                setData(d);
                setLoading(false);
            })
            .catch(() => {
                if (!alive) return;
                setFailed(true);
                setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [scope, reloadKey]);

    const onRenamed = useCallback((shown: string) => {
        setMe((m) => ({ ...m, name: shown, claimed: claimedName() }));
        setReloadKey((k) => k + 1);
    }, []);

    const tab = TABS.find((t) => t.scope === scope) ?? TABS[0];

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
            <header className="flex flex-col gap-1">
                <span className="caps-label text-[10px] text-muted-light">
                    Trading floor · semester leaderboard
                </span>
                <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Leaderboard 🏆</h1>
                <p className="text-[15px] text-muted">
                    BroDollars earned this semester - solo postings and duels alike. Prove you
                    are a top performer to people who never asked. Rankings reset every semester,
                    trauma does not.
                </p>
            </header>

            {!scoreboardEnabled ? (
                <DeskClosed />
            ) : (
                <>
                    <Tabs scope={scope} onPick={setScope} />

                    <YouCard
                        me={me}
                        you={data?.you ?? null}
                        semester={data?.semester ?? ""}
                        scopeLabel={tab.label}
                        onRenamed={onRenamed}
                    />

                    <div className={`${CARD} flex flex-col gap-2 p-4 sm:p-6`}>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-extrabold tracking-[-0.01em]">
                                {tab.emoji} {tab.label}
                            </h2>
                            {data?.semester && (
                                <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-bold text-muted">
                                    {data.semester}
                                </span>
                            )}
                            <span className="caps-label ml-auto text-[10px] text-muted-light">
                                top {data?.rows.length ?? 0} · by {MONEY} earned
                            </span>
                        </div>

                        {loading && <p className="text-sm text-muted">Pulling the statements…</p>}
                        {failed && !loading && (
                            <p className="text-sm text-muted">
                                The leaderboard desk is not staffed right now. Your BroDollars are
                                safe - the board just cannot show them.
                            </p>
                        )}
                        {data && !loading && !failed && data.rows.length === 0 && (
                            <p className="text-sm text-muted">
                                Nobody on the board yet. First settled posting takes the corner
                                office -{" "}
                                <Link href="/career" className="font-bold text-brand hover:underline">
                                    start a run
                                </Link>
                                .
                            </p>
                        )}
                        {data && !loading && !failed && data.rows.length > 0 && (
                            <div className="flex flex-col">
                                {data.rows.map((r, i) => {
                                    const mine = r.playerId === me.id;
                                    return (
                                        <div
                                            key={`${r.playerId}-${i}`}
                                            className={`flex items-center gap-3 border-t border-hairline-soft py-2 text-sm first:border-t-0 ${
                                                mine ? "-mx-2 rounded-[8px] bg-brand-tint px-2" : ""
                                            }`}
                                        >
                                            <span className="w-6 text-right font-extrabold tabular-nums text-muted">
                                                {i + 1}.
                                            </span>
                                            <span className="w-5 text-center">{medal(i)}</span>
                                            <span
                                                className={`min-w-0 truncate font-bold ${
                                                    mine ? "text-brand" : ""
                                                }`}
                                            >
                                                {r.name}
                                                {mine && " (you)"}
                                            </span>
                                            <span className="caps-label hidden text-[10px] text-muted-light sm:inline">
                                                #{r.playerId}
                                            </span>
                                            <span className="ml-auto shrink-0 tabular-nums text-muted">
                                                <span className="hidden sm:inline">
                                                    {r.postings} settled ·{" "}
                                                </span>
                                                <span className="font-extrabold text-ink">
                                                    {formatMoney(r.amount)} {MONEY}
                                                </span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-muted">
                        Solo postings count once the desk has re-graded them; duel winnings are
                        booked at the closing bell, per subject. Both go to the same balance.
                    </p>
                </>
            )}

            {/* ads - standard sizes, below the board */}
            <div className="hidden md:block">
                <AdSlot variant="leaderboard" />
            </div>
            <div className="md:hidden">
                <AdSlot variant="feed" />
            </div>
        </div>
    );
}

function medal(i: number): string {
    return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
}

function Tabs({
    scope,
    onPick,
}: {
    scope: ScoreboardScope;
    onPick: (s: ScoreboardScope) => void;
}) {
    return (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex w-max gap-1.5 sm:w-auto sm:flex-wrap">
                {TABS.map((t) => {
                    const active = t.scope === scope;
                    return (
                        <button
                            key={t.scope}
                            type="button"
                            onClick={() => onPick(t.scope)}
                            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition ${
                                active
                                    ? "border-brand bg-brand text-white"
                                    : "border-hairline bg-surface text-muted hover:border-[#c8d3de] hover:text-ink"
                            }`}
                        >
                            {t.emoji} {t.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Your standing in the current scope, plus the desk-name field. An intern on
 * the board without a claimed name gets the nudge; everybody else can still
 * rename at any time (the duels desk picks the new name up automatically).
 */
function YouCard({
    me,
    you,
    semester,
    scopeLabel,
    onRenamed,
}: {
    me: { id: string; name: string; claimed: string };
    you: ScoreboardResponse["you"];
    semester: string;
    scopeLabel: string;
    onRenamed: (shown: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);
    const intern = !me.claimed;
    const nudge = intern && you !== null;

    const open = () => {
        setDraft(me.claimed);
        setEditing(true);
    };

    const save = async () => {
        if (!draft.trim()) return;
        setSaving(true);
        const shown = await claimDeskName(draft);
        setSaving(false);
        setEditing(false);
        onRenamed(shown);
    };

    return (
        <div
            className={`${CARD} flex flex-col gap-3 p-4 sm:p-5 ${
                nudge ? "border-brand-border bg-brand-tint" : ""
            }`}
        >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="caps-label text-[10px] text-muted-light">Your desk</span>
                <span className="text-[15px] font-extrabold">{me.name || "…"}</span>
                {me.id && (
                    <span className="caps-label text-[10px] text-muted-light">#{me.id}</span>
                )}
                <span className="ml-auto tabular-nums text-sm text-muted">
                    {you ? (
                        <>
                            <span className="font-extrabold text-ink">#{you.rank}</span> in{" "}
                            {scopeLabel}
                            {semester ? ` ${semester}` : ""} ·{" "}
                            <span className="font-extrabold text-brand">
                                {formatMoney(you.amount)} {MONEY}
                            </span>
                        </>
                    ) : (
                        <>Not on the {scopeLabel} board yet</>
                    )}
                </span>
            </div>

            {nudge && !editing && (
                <p className="text-sm text-muted">
                    You are on the board as <span className="font-bold text-ink">{me.name}</span>.
                    Claim a name before HR files you under that.
                </p>
            )}

            {editing ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={draft}
                        maxLength={MAX_NAME_LENGTH}
                        autoFocus
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") void save();
                            if (e.key === "Escape") setEditing(false);
                        }}
                        placeholder="e.g. WolfOfGarching"
                        className="flex-1 rounded-[10px] border-2 border-brand bg-brand-input px-4 py-2.5 text-[15px] font-extrabold outline-none placeholder:text-sm placeholder:font-medium placeholder:text-muted"
                    />
                    <button
                        type="button"
                        disabled={saving || !draft.trim()}
                        onClick={() => void save()}
                        className="rounded-[10px] bg-brand px-5 py-2.5 text-[15px] font-extrabold text-white transition hover:bg-[#175a3a] disabled:opacity-60"
                    >
                        {saving ? "Filing…" : "Save name"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="rounded-[10px] border border-hairline bg-surface px-4 py-2.5 text-[15px] font-bold text-muted transition hover:text-ink"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={open}
                        className={`rounded-[10px] px-4 py-2 text-[14px] font-extrabold transition ${
                            nudge
                                ? "bg-brand text-white hover:bg-[#175a3a]"
                                : "border border-hairline bg-surface text-muted hover:border-[#c8d3de] hover:text-ink"
                        }`}
                    >
                        {intern ? "Claim your name ✍️" : "Change name"}
                    </button>
                    <span className="text-xs text-muted">
                        Same name at the{" "}
                        <Link href="/multiplayer" className="font-bold text-brand hover:underline">
                            duels desk
                        </Link>
                        .
                    </span>
                </div>
            )}
        </div>
    );
}

function DeskClosed() {
    return (
        <div className={`${CARD} flex flex-col items-center gap-3 px-6 py-10 text-center`}>
            <span className="caps-label text-[10px] text-muted-light">
                Service notice · desk not staffed
            </span>
            <p className="max-w-md text-[15px] text-muted">
                The leaderboard desk is not staffed right now. Your BroDollars still count -
                the board just cannot show them yet.
            </p>
            <Link href="/career" className="text-sm font-bold text-brand hover:underline">
                Make some money in the meantime 🤑
            </Link>
        </div>
    );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { getSubject } from "@/content/subjects";
import type { QuestionInstance } from "@/lib/questions/types";
import {
    applyAnswer,
    applySkip,
    buildUnlimitedSession,
    clearSession,
    currentInstance,
    loadSession,
    saveSession,
    segmentStates,
    sessionTotals,
    type StoredSession,
} from "@/lib/session";
import { useScore } from "@/hooks/useScore";
import { reportEarning } from "@/lib/scoreboard/client";
import { useLevel } from "@/hooks/useLevel";
import { useStopwatch } from "@/hooks/useStopwatch";
import { difficultyTimes } from "@/lib/scoring";
import { bonusForScore, getNextRank, getRank } from "@/lib/rankings";
import { formatMoney, MONEY } from "@/lib/money";

import QuestionCard from "./QuestionCard";
import ProgressSegments from "./ProgressSegments";
import AdSlot from "@/components/AdSlot";
import BalanceCard from "@/components/account/BalanceCard";
import ActivityLedger from "@/components/account/ActivityLedger";
import CareerTrack from "@/components/account/CareerTrack";

type View = { instance: QuestionInstance; posting: number };

/**
 * The account view: the running Semester Marathon. Quiz in the nav resumes
 * the stored run; if there is none, the Career page opens one.
 */
export default function QuizClient() {
    const router = useRouter();
    const params = useSearchParams();
    const subjectParam = params.get("subject");

    const [ready, setReady] = useState(false);
    const [session, setSession] = useState<StoredSession | null>(null);
    const [view, setView] = useState<View | null>(null);
    const [award, setAward] = useState<number | null>(null);

    const { score, addScore } = useScore();
    const { elapsedMs, start, stop, reset } = useStopwatch();

    // resume the stored run (client-only state)
    useEffect(() => {
        const s = loadSession();
        setSession(s);
        if (s && s.queue.length > 0) {
            const instance = currentInstance(s);
            if (instance) setView({ instance, posting: s.log.length + 1 });
        }
        setReady(true);
        reset();
        start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // no run to resume -> the Career page is where a run starts
    useEffect(() => {
        if (ready && session === null) {
            router.replace(subjectParam ? `/career?subject=${subjectParam}` : "/career");
        }
    }, [ready, session, router, subjectParam]);

    const handleAnswered = useCallback(
        (correct: boolean, payoutFactor: number, value: number | number[]) => {
            if (!session || !view) return;
            stop();
            let points = 0;
            if (correct) {
                const difficulty = view.instance.question.difficulty;
                const limit = difficultyTimes[difficulty] ?? 120;
                // advice was never free: peeking at the table costs 30% of
                // the payout, the full hint (table + formula) costs 50%
                points = addScore(
                    difficulty,
                    Math.round(elapsedMs / 1000),
                    limit,
                    payoutFactor
                );
                // semester scoreboard: fire-and-forget, re-graded server-side
                const head = session.queue[0];
                if (head) {
                    reportEarning({ qid: head.id, seed: head.seed, value, amount: points });
                }
            }
            const next = applyAnswer(session, correct, points);
            saveSession(next);
            setSession(next);
            setAward(correct ? points : 0);
        },
        [session, view, stop, addScore, elapsedMs]
    );

    // skip: the posting leaves the run entirely and the next one comes up
    const handleSkip = useCallback(() => {
        if (!session || !view) return;
        stop();
        const next = applySkip(session);
        saveSession(next);
        setSession(next);
        setAward(null);
        if (next.queue.length === 0) {
            setView(null); // -> statement
            return;
        }
        const instance = currentInstance(next);
        if (instance) setView({ instance, posting: next.log.length + 1 });
        reset();
        start();
    }, [session, view, stop, reset, start]);

    const handleNext = useCallback(() => {
        if (!session) return;
        if (session.queue.length === 0) {
            setView(null); // -> statement
            return;
        }
        const instance = currentInstance(session);
        if (!instance) return;
        setView({ instance, posting: session.log.length + 1 });
        setAward(null);
        reset();
        start();
    }, [session, reset, start]);

    if (!ready || session === null) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="caps-label text-[10px] text-muted">Opening the account view</p>
                <p className="mt-3 text-sm text-muted">
                    No run in progress -{" "}
                    <Link href="/career" className="font-bold text-brand underline underline-offset-4">
                        open one on the Career page
                    </Link>
                    .
                </p>
            </div>
        );
    }

    const subject = getSubject(session.subjectId);
    const totals = sessionTotals(session);

    // ---------------------------------------------------------- statement
    // The card for the just-answered final posting stays on screen until
    // "Close the statement"; a completed run resumed from storage (no open
    // card, award === null) goes straight to the statement.
    if (view === null || (totals.complete && award === null)) {
        return (
            <Statement
                session={session}
                onRestart={() => {
                    const fresh = buildUnlimitedSession(session.subjectId, session.topicIds);
                    if (!fresh) return;
                    saveSession(fresh);
                    setSession(fresh);
                    const instance = currentInstance(fresh);
                    if (instance) setView({ instance, posting: 1 });
                    setAward(null);
                    reset();
                    start();
                }}
                onChangeSetup={() => {
                    clearSession();
                    router.push(`/career?subject=${session.subjectId}`);
                }}
            />
        );
    }

    if (view === null) return null; // unreachable, keeps TS happy

    const states = segmentStates(session);
    const streak = session.streak;

    return (
        <div>
            {/* phone: the full progress stack lives in the navy header */}
            <PhoneProgressStack
                courseName={subject?.short ?? session.subjectId}
                session={session}
                score={score}
                posting={view.posting}
            />

            <div className="mx-auto max-w-[1440px] px-4 pt-4 lg:px-[22px] lg:pt-[18px]">
                <div className="flex gap-[18px]">
                    {/* left rail - ads only, kept away from the maths; sticky so it
                        rides alongside the whole page (2026-08-29) */}
                    <aside className="sticky top-20 hidden w-[200px] flex-none flex-col gap-3 self-start xl:flex">
                        <AdSlot variant="skyscraper" />
                        <AdSlot variant="square" />
                    </aside>

                    {/* centre - the work */}
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="hidden items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-2.5 lg:flex">
                            <span className="text-sm font-extrabold">
                                {subject?.label ?? session.subjectId}
                            </span>
                            <ProgressSegments states={states} variant="light" />
                            <span className="text-[13px] font-extrabold tabular-nums">
                                {totals.settledCount} / {totals.total}
                            </span>
                            {streak >= 2 && (
                                <span className="text-[13px] font-bold text-warn">
                                    🔥 {streak} streak
                                </span>
                            )}
                        </div>

                        <QuestionCard
                            key={view.instance.key}
                            instance={view.instance}
                            postingNo={view.posting}
                            award={award}
                            settledCorrect={totals.settledCount}
                            postings={totals.postings}
                            writeoffs={totals.writeoffs}
                            lastWriteoffPosting={totals.lastWriteoffPosting}
                            rankBonus={bonusForScore(score)}
                            onAnswered={handleAnswered}
                            onSkip={handleSkip}
                            onNext={handleNext}
                            isLast={totals.left === 0}
                        />

                        <div className="hidden md:block">
                            <AdSlot variant="leaderboard" />
                        </div>
                        <div className="md:hidden">
                            <AdSlot variant="feed" />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                clearSession();
                                router.push(`/career?subject=${session.subjectId}`);
                            }}
                            className="self-start text-sm text-muted underline underline-offset-4 transition hover:text-ink"
                        >
                            End session
                        </button>
                    </div>

                    {/* right rail - the account */}
                    <aside className="hidden w-[300px] flex-none flex-col gap-3 lg:flex">
                        <BalanceCard score={score} recentCredit={award ?? undefined} />
                        <ActivityLedger log={session.log} />
                        <CareerTrack score={score} />
                    </aside>
                </div>

                {/* phone: the account folds in below the feed */}
                <div className="mt-3 flex flex-col gap-3 lg:hidden">
                    <ActivityLedger log={session.log} />
                    <CareerTrack score={score} />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ phone */

function PhoneProgressStack({
    courseName,
    session,
    score,
    posting,
}: {
    courseName: string;
    session: StoredSession;
    score: number;
    posting: number;
}) {
    const totals = sessionTotals(session);
    const states = segmentStates(session);
    const { level, progress, nextRequired } = useLevel(score);
    const rank = getRank(level);
    const next = getNextRank(level);
    const remaining = Math.max(0, nextRequired - Math.floor(progress * nextRequired));
    const pct = Math.round(progress * 100);

    return (
        <div className="bg-ink px-4 pb-3.5 pt-0.5 lg:hidden">
            <div className="flex flex-col gap-2.5 rounded-xl bg-ink-raised p-3 text-[#e8eef5]">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold">{courseName}</span>
                    <div className="flex-1" />
                    <span className="text-[11px] font-extrabold text-mint">
                        {totals.settledCount} ✓
                    </span>
                    <span className="text-[11px] font-extrabold text-warn-soft">
                        {totals.writeoffs} ✗
                    </span>
                    <span className="text-[11px] font-bold text-muted-light">
                        {totals.left} left
                    </span>
                </div>
                <ProgressSegments states={states} variant="navy" />
                <div className="flex items-center gap-2">
                    {session.streak >= 2 && (
                        <span className="text-[11px] font-extrabold text-warn-mild">
                            🔥 {session.streak} streak
                        </span>
                    )}
                    <div className="flex-1" />
                    <span className="caps-label text-[10px] text-muted-light">
                        Posting {String(posting).padStart(2, "0")} · {totals.left} left
                    </span>
                </div>
                <span className="h-px bg-ink-track" />
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] text-[#b7c8d9]">
                        <span>
                            TIER {level} · {rank.title.toUpperCase()} {rank.emoji}
                        </span>
                        <span>
                            {next
                                ? `${formatMoney(remaining)} ${MONEY} to ${next.emoji}`
                                : "top tier"}
                        </span>
                    </div>
                    <span className="block h-[5px] overflow-hidden rounded-[3px] bg-ink-track">
                        <span
                            className="block h-full bg-mint transition-[width] duration-500 ease-out"
                            style={{ width: `${pct}%` }}
                        />
                    </span>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------- statement */

function Statement({
    session,
    onRestart,
    onChangeSetup,
}: {
    session: StoredSession;
    onRestart: () => void;
    onChangeSetup: () => void;
}) {
    const subject = getSubject(session.subjectId);
    const totals = sessionTotals(session);
    const joke =
        totals.skipped > 0
            ? "Some postings were forwarded to your tax advisor. He has questions."
            : totals.writeoffs === 0
              ? "A clean statement. The auditors are suspicious."
              : "Every write-off recovered eventually. The bank thanks you for the volume.";

    return (
        <div className="mx-auto max-w-xl px-4 py-10 lg:py-16">
            <div className="flex flex-col gap-4 rounded-[14px] border border-hairline bg-surface p-6 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-8">
                <span className="caps-label text-[10px] text-muted">
                    Session statement · {subject?.short ?? session.subjectId}
                </span>
                <h1 className="text-3xl font-extrabold tracking-[-0.02em]">
                    {totals.settledCount} / {totals.total} postings settled
                </h1>
                <div className="overflow-hidden rounded-[10px] border border-hairline-table">
                    <Row label="Postings answered" value={String(totals.postings)} />
                    <Row label="Write-offs" value={String(totals.writeoffs)} warn={totals.writeoffs > 0} />
                    {totals.skipped > 0 && (
                        <Row label="Forwarded to the tax advisor" value={String(totals.skipped)} />
                    )}
                    <Row label="Credited this run" value={`+${formatMoney(totals.earned)} ${MONEY}`} credit />
                </div>
                <p className="text-sm text-muted">{joke}</p>
                <div className="flex flex-wrap gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onRestart}
                        className="rounded-[10px] bg-brand px-6 py-3 font-extrabold text-white transition hover:bg-[#175a3a]"
                    >
                        Run it back
                    </button>
                    <button
                        type="button"
                        onClick={onChangeSetup}
                        className="rounded-[10px] border border-hairline bg-surface px-6 py-3 font-extrabold text-ink transition hover:border-[#c8d3de]"
                    >
                        Change setup
                    </button>
                </div>
            </div>
        </div>
    );
}

function Row({
    label,
    value,
    credit,
    warn,
}: {
    label: string;
    value: string;
    credit?: boolean;
    warn?: boolean;
}) {
    return (
        <div className="flex justify-between border-b border-hairline-soft px-3.5 py-2.5 text-sm last:border-b-0">
            <span className="text-muted">{label}</span>
            <span
                className={`font-extrabold tabular-nums ${
                    credit ? "text-brand" : warn ? "text-warn" : "text-ink"
                }`}
            >
                {value}
            </span>
        </div>
    );
}

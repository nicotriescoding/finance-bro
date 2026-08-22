"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { SUBJECTS, getSubject } from "@/content/subjects";
import { countsByTopic, countForSubject, questionsFor } from "@/content/questions";
import type { SubjectId } from "@/lib/questions/types";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
    buildUnlimitedSession,
    loadSession,
    saveSession,
    sessionTotals,
    type StoredSession,
} from "@/lib/session";
import { formatMoney, MONEY } from "@/lib/money";

import TopicSelector from "@/components/quiz/TopicSelector";
import AdSlot from "@/components/AdSlot";

/**
 * "Choose your dead-end career" - the setup page (design 3a). Pick a course,
 * tick topics, one session mode, start earning. A running session is resumed
 * from the Quiz nav link instead.
 *
 * Phone flow: the two columns stack, so picking a career auto-scrolls to the
 * setup step, and tapping the already-selected career again starts the run
 * immediately (with the ticked topics, or all of them if none are ticked).
 * Topics start unselected on purpose - "Select all" in the topic list is the
 * fast path.
 */

/** below lg the columns stack - that is where scroll + tap-again apply */
const isStackedLayout = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;

export default function CareerSetup() {
    const router = useRouter();
    const params = useSearchParams();
    const subjectId = (params.get("subject") ?? "finance") as SubjectId;
    const subject = getSubject(subjectId) ?? SUBJECTS[0];

    const counts = useMemo(() => countsByTopic(subject.id), [subject.id]);
    const availableTopics = useMemo(
        () => subject.topics.filter((t) => (counts[t.id] ?? 0) > 0).map((t) => t.id),
        [subject.topics, counts]
    );

    // nothing preselected - ticking topics (or "Select all") is step 2
    const [selected, setSelected] = usePersistentState<string[]>(
        `fb_topics_${subject.id}_v1`,
        []
    );
    const [modeOpen, setModeOpen] = useState(false);
    const [running, setRunning] = useState<StoredSession | null>(null);
    const setupRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const s = loadSession();
        setRunning(s && s.queue.length > 0 ? s : null);
    }, []);

    // drop topic ids that no longer exist for this subject
    useEffect(() => {
        setSelected((prev) => {
            const cleaned = prev.filter((t) => availableTopics.includes(t));
            return cleaned.length === prev.length ? prev : cleaned;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subject.id]);

    const pool = useMemo(
        () => questionsFor(subject.id, selected),
        [subject.id, selected]
    );

    const bankIsEmpty = availableTopics.length === 0;
    const estMinutes = Math.max(1, Math.round(pool.length * 1.2));

    const startSession = (topics: string[] = selected) => {
        const session = buildUnlimitedSession(subject.id, topics);
        if (!session) return;
        saveSession(session);
        router.push("/quiz");
    };

    const pickCareer = (id: SubjectId, locked: boolean) => {
        if (id === subject.id) {
            // tap-again on the stacked (phone) layout starts the run: with the
            // ticked topics, or the whole bank if nothing is ticked yet
            if (isStackedLayout() && !locked) {
                startSession(selected.length > 0 ? selected : availableTopics);
            }
            return;
        }
        router.replace(`/career?subject=${id}`, { scroll: false });
        if (isStackedLayout()) {
            requestAnimationFrame(() =>
                setupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            );
        }
    };

    return (
        <div className="mx-auto max-w-[1100px] px-4 pt-5 md:px-5 md:pt-6">
            {running && (
                <Link
                    href="/quiz"
                    className="mb-4 flex items-center gap-3 rounded-xl border border-brand-border bg-brand-tint px-4 py-3 text-sm transition hover:border-brand"
                >
                    <span className="caps-label text-[10px] text-brand">Run open</span>
                    <span className="text-ledger">
                        {sessionTotals(running).settledCount} / {sessionTotals(running).total}{" "}
                        postings settled · starting a new run replaces it
                    </span>
                    <span className="ml-auto font-extrabold text-brand">Resume →</span>
                </Link>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:gap-4">
                {/* careers - the course menu */}
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div>
                        <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">
                            Choose your dead-end career 🪦
                        </h1>
                        <p className="mt-1.5 max-w-[60ch] text-sm text-muted [text-wrap:pretty]">
                            Your career decides which questions come first, what the app calls
                            you, and how sad the loading screens are. You can quit any time,
                            unlike in real life.
                        </p>
                        <span className="caps-label mt-3 block text-[10px] text-muted">
                            Step 1 · Pick a career
                        </span>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                        {SUBJECTS.map((s) => {
                            const count = countForSubject(s.id);
                            const active = s.id === subject.id;
                            const locked = count === 0;
                            return (
                                <button
                                    type="button"
                                    key={s.id}
                                    onClick={() => pickCareer(s.id, locked)}
                                    className={`flex items-start gap-2.5 rounded-xl bg-surface p-3 text-left transition ${
                                        active
                                            ? "border-2 border-brand"
                                            : "border border-hairline hover:border-[#c8d3de]"
                                    } ${locked ? "opacity-55" : ""}`}
                                >
                                    <span className="text-[22px]">{s.emoji}</span>
                                    <span className="flex flex-col gap-0.5">
                                        <span className="text-[15px] font-extrabold">{s.label}</span>
                                        <span className="text-xs leading-[1.5] text-muted">
                                            {s.description}
                                        </span>
                                        {active ? (
                                            <>
                                                <span className="text-[11px] font-extrabold text-brand lg:hidden">
                                                    {locked
                                                        ? "SELECTED · BEING REBUILT FROM REAL TUM EXAMS"
                                                        : `SELECTED · TAP AGAIN TO START ${
                                                              selected.length > 0
                                                                  ? `(${pool.length} QUESTIONS)`
                                                                  : "(ALL TOPICS)"
                                                          } ▸`}
                                                </span>
                                                <span className="hidden text-[11px] font-extrabold text-brand lg:inline">
                                                    SELECTED ·{" "}
                                                    {locked
                                                        ? "BEING REBUILT FROM REAL TUM EXAMS"
                                                        : `${count} POSTINGS`}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[11px] font-extrabold text-muted">
                                                {locked
                                                    ? "Locked · being rebuilt from real TUM exams"
                                                    : `${count} questions`}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                        <div className="sm:col-span-2">
                            <AdSlot variant="sponsored-career" />
                        </div>
                    </div>
                </div>

                {/* session setup */}
                <div
                    ref={setupRef}
                    className="flex w-full flex-none scroll-mt-20 flex-col gap-2 lg:w-[330px]"
                >
                    <span className="caps-label text-[10px] text-muted">
                        Step 2 · Topics & session
                    </span>
                    <div className="flex flex-col gap-2.5 rounded-[14px] border border-hairline bg-surface p-3.5">
                        <span className="caps-label text-[10px] text-muted">Session mode</span>

                        <button
                            type="button"
                            onClick={() => setModeOpen((o) => !o)}
                            className="flex items-center gap-2 rounded-[10px] border-2 border-ink px-3.5 py-2.5 text-left"
                        >
                            <span className="text-base font-extrabold">Semester Marathon · ∞</span>
                            <span className="flex-1" />
                            <span className="text-[13px] text-muted">{modeOpen ? "▲" : "▼"}</span>
                        </button>

                        {modeOpen && (
                            <div className="overflow-hidden rounded-[10px] border border-hairline shadow-[0_6px_14px_rgba(15,33,55,.08)]">
                                <div className="flex items-center justify-between border-b border-hairline-soft bg-brand-tint px-3.5 py-2.5">
                                    <span className="text-sm font-extrabold">
                                        Semester Marathon · ∞
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="text-[11px] text-muted-light">
                                            until you cry
                                        </span>
                                        <span className="text-xs font-extrabold text-brand">✓</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-3.5 py-2.5 opacity-55">
                                    <span className="text-sm">More modes</span>
                                    <span className="text-[11px] text-muted-light">
                                        in development
                                    </span>
                                </div>
                            </div>
                        )}

                        <p className="text-xs leading-[1.5] text-muted">
                            Every selected question, dealt once, in random order. A write-off
                            re-enters the queue with fresh numbers - the run ends when every
                            posting is settled correctly.
                        </p>

                        {bankIsEmpty ? (
                            <div className="flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-[#c8d3de] px-4 py-8 text-center">
                                <p className="text-3xl">🏗️</p>
                                <p className="text-sm font-extrabold">No postings yet</p>
                                <p className="text-xs leading-relaxed text-muted">
                                    This bank is being rebuilt from real TUM exams - questions
                                    land here as soon as the past exams are ingested.
                                </p>
                                <Link
                                    href="/career?subject=finance"
                                    className="mt-2 rounded-[10px] bg-brand px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#175a3a]"
                                >
                                    Practice Finance instead
                                </Link>
                            </div>
                        ) : (
                            <>
                                <TopicSelector
                                    subject={subject}
                                    counts={counts}
                                    selected={selected}
                                    onChange={setSelected}
                                />

                                <div className="flex items-baseline gap-2 pt-0.5 text-xs text-muted">
                                    {pool.length > 0 ? (
                                        <>
                                            <span className="font-extrabold text-ink">
                                                {formatMoney(pool.length)} questions selected
                                            </span>
                                            <span>· est. {estMinutes} min</span>
                                        </>
                                    ) : (
                                        <span>
                                            Nothing ticked yet - use Select all or tick topics
                                            above.
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => startSession()}
                                    disabled={pool.length === 0}
                                    className="flex h-[52px] items-center justify-center gap-2 rounded-[11px] bg-brand text-[17px] font-extrabold text-white transition hover:bg-[#175a3a] disabled:cursor-not-allowed disabled:bg-hairline disabled:text-muted"
                                >
                                    Start earning {MONEY}
                                </button>

                                <span className="text-center text-[11px] leading-[1.5] text-muted-light">
                                    No email, no account, no upsell. Your balance lives in this
                                    browser and dies with your cache.
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

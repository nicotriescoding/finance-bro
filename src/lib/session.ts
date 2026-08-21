/**
 * The one session mode: Semester Marathon (unlimited).
 *
 * A run deals every question of the selected topics exactly once, in random
 * order. A correct answer settles the posting and credits BroDollars. A wrong
 * answer is a write-off: it pays 0 and the question re-enters the back of the
 * queue with a FRESH seed (the numbers reroll, so the fix must be understood,
 * not memorised). The run ends when every question has been answered
 * correctly in this run.
 *
 * Persisted in localStorage so the Quiz nav link can resume a run; the Career
 * page starts a new one. No accounts, no server - the balance lives in this
 * browser and dies with the cache.
 */

import { ALL_QUESTIONS, questionsFor } from "@/content/questions";
import { topicLabel } from "@/content/subjects";
import { buildInstance } from "./questions/engine";
import { createRng, randomSeed } from "./questions/rng";
import type { Question, QuestionInstance, SubjectId } from "./questions/types";

const KEY = "fb_session_v1";

export type LedgerEntry = {
    /** 1-based posting number in this run */
    posting: number;
    id: string;
    /** short ledger label, e.g. "Annuities & Perpetuities" or "… (MC)" */
    label: string;
    result: "credit" | "writeoff";
    /** BroDollars credited (0 for a write-off) */
    amount: number;
};

export type StoredSession = {
    v: 1;
    subjectId: SubjectId;
    topicIds: string[];
    /** distinct question ids in dealt order - drives the progress segments */
    order: string[];
    /** remaining postings; head is the current one */
    queue: { id: string; seed: number }[];
    /** ids answered correctly in this run */
    settled: string[];
    /** ids with at least one write-off in this run */
    missed: string[];
    log: LedgerEntry[];
    streak: number;
    startedAt: number;
};

const QUESTION_BY_ID: Map<string, Question> = new Map(
    ALL_QUESTIONS.map((q) => [q.id, q])
);

export function buildUnlimitedSession(
    subjectId: SubjectId,
    topicIds: string[]
): StoredSession | null {
    const pool = questionsFor(subjectId, topicIds);
    if (pool.length === 0) return null;
    const rng = createRng(randomSeed());
    const dealt = rng.shuffle(pool);
    return {
        v: 1,
        subjectId,
        topicIds,
        order: dealt.map((q) => q.id),
        queue: dealt.map((q) => ({ id: q.id, seed: rng.int(1, 2_147_483_646) })),
        settled: [],
        missed: [],
        log: [],
        streak: 0,
        startedAt: Date.now(),
    };
}

export function loadSession(): StoredSession | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const s = JSON.parse(raw) as StoredSession;
        if (s?.v !== 1 || !Array.isArray(s.queue) || !Array.isArray(s.order)) return null;
        // Drop postings whose question no longer exists in the bank.
        const alive = (id: string) => QUESTION_BY_ID.has(id);
        s.queue = s.queue.filter((q) => alive(q.id));
        s.order = s.order.filter(alive);
        s.settled = (s.settled ?? []).filter(alive);
        s.missed = (s.missed ?? []).filter(alive);
        if (s.order.length === 0) return null;
        return s;
    } catch {
        return null;
    }
}

export function saveSession(s: StoredSession): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
        /* private mode etc. */
    }
}

export function clearSession(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
}

/** Resolve the head of the queue into a renderable question instance. */
export function currentInstance(s: StoredSession): QuestionInstance | null {
    const head = s.queue[0];
    if (!head) return null;
    const question = QUESTION_BY_ID.get(head.id);
    if (!question) return null;
    return buildInstance(question, head.seed);
}

/** Ledger label for a question: topic label, "(MC)" for multiple choice. */
export function ledgerLabel(question: Question): string {
    const label = topicLabel(question.subject, question.topic);
    return question.kind === "choice" ? `${label} (MC)` : label;
}

/**
 * Apply an answer to the head posting. Pure - returns the next state.
 * `points` is what the scoring engine actually credited (0 when wrong).
 */
export function applyAnswer(
    s: StoredSession,
    correct: boolean,
    points: number
): StoredSession {
    const head = s.queue[0];
    if (!head) return s;
    const question = QUESTION_BY_ID.get(head.id);
    const posting = s.log.length + 1;
    const entry: LedgerEntry = {
        posting,
        id: head.id,
        label: question ? ledgerLabel(question) : head.id,
        result: correct ? "credit" : "writeoff",
        amount: correct ? points : 0,
    };

    const rest = s.queue.slice(1);
    return {
        ...s,
        queue: correct ? rest : [...rest, { id: head.id, seed: randomSeed() }],
        settled: correct && !s.settled.includes(head.id) ? [...s.settled, head.id] : s.settled,
        missed: !correct && !s.missed.includes(head.id) ? [...s.missed, head.id] : s.missed,
        log: [...s.log, entry],
        streak: correct ? s.streak + 1 : 0,
    };
}

export type SessionTotals = {
    /** distinct questions in the run */
    total: number;
    /** distinct questions settled correctly */
    settledCount: number;
    /** write-off events (a question can be written off more than once) */
    writeoffs: number;
    /** postings still open */
    left: number;
    /** postings answered so far (next posting number = postings + 1) */
    postings: number;
    /** BroDollars credited in this run */
    earned: number;
    /** posting number of the most recent write-off, if any */
    lastWriteoffPosting: number | null;
    complete: boolean;
};

export function sessionTotals(s: StoredSession): SessionTotals {
    const writeoffEntries = s.log.filter((e) => e.result === "writeoff");
    return {
        total: s.order.length,
        settledCount: s.settled.length,
        writeoffs: writeoffEntries.length,
        left: s.queue.length,
        postings: s.log.length,
        earned: s.log.reduce((sum, e) => sum + e.amount, 0),
        lastWriteoffPosting: writeoffEntries.length
            ? writeoffEntries[writeoffEntries.length - 1].posting
            : null,
        complete: s.queue.length === 0,
    };
}

/** Per-question segment state for the progress strip, in dealt order. */
export type SegmentState = "settled" | "missed" | "current" | "open";

export function segmentStates(s: StoredSession): SegmentState[] {
    const currentId = s.queue[0]?.id;
    return s.order.map((id) => {
        if (s.settled.includes(id)) return "settled";
        if (id === currentId) return "current";
        if (s.missed.includes(id)) return "missed";
        return "open";
    });
}

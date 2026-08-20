"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { SUBJECTS, getSubject } from "@/content/subjects";
import { countsByTopic, questionsFor } from "@/content/questions";
import { buildSession } from "@/lib/questions/engine";
import type { QuestionInstance, SubjectId } from "@/lib/questions/types";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useScore } from "@/hooks/useScore";
import { useStopwatch } from "@/hooks/useStopwatch";
import { difficultyTimes } from "@/lib/scoring";

import TopicSelector from "./TopicSelector";
import QuestionCard from "./QuestionCard";
import Scoreboard from "@/components/Scoreboard/Scoreboard";

const LENGTHS = [5, 10, 20, 30];

export default function QuizClient() {
    const params = useSearchParams();
    const subjectId = (params.get("subject") ?? "finance") as SubjectId;
    const subject = getSubject(subjectId) ?? SUBJECTS[0];

    const counts = useMemo(() => countsByTopic(subject.id), [subject.id]);
    const availableTopics = useMemo(
        () => subject.topics.filter((t) => (counts[t.id] ?? 0) > 0).map((t) => t.id),
        [subject.topics, counts]
    );

    const [selected, setSelected] = usePersistentState<string[]>(
        `fb_topics_${subject.id}_v1`,
        availableTopics
    );
    const [length, setLength] = usePersistentState<number>("fb_length_v1", 10);

    const [session, setSession] = useState<QuestionInstance[] | null>(null);
    const [index, setIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const { score, addScore } = useScore();
    const { elapsedMs, start, stop, reset } = useStopwatch();

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

    const startSession = () => {
        const built = buildSession(pool, Math.min(length, Math.max(length, pool.length ? length : 0)));
        if (built.length === 0) return;
        setSession(built);
        setIndex(0);
        setCorrectCount(0);
        reset();
        start();
    };

    const handleAnswered = (correct: boolean) => {
        if (!session) return;
        if (!correct) return;
        setCorrectCount((c) => c + 1);
        const difficulty = session[index].question.difficulty;
        const limit = difficultyTimes[difficulty] ?? 120;
        addScore(difficulty, Math.round(elapsedMs / 1000), limit);
    };

    const handleNext = () => {
        if (!session) return;
        if (index + 1 >= session.length) {
            stop();
            setIndex(session.length); // -> summary
            return;
        }
        setIndex((i) => i + 1);
        reset();
        start();
    };

    // ------------------------------------------------------------------ setup
    if (!session) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <SubjectSwitcher current={subject.id} />

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">
                        {subject.emoji} {subject.label}
                    </h1>
                    <p className="mt-2 text-slate-600">{subject.description}</p>
                </div>

                <TopicSelector
                    subject={subject}
                    counts={counts}
                    selected={selected}
                    onChange={setSelected}
                />

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-900">Länge</h2>
                    <div className="flex flex-wrap gap-2">
                        {LENGTHS.map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => setLength(l)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                    length === l
                                        ? "border-slate-900 bg-slate-900 text-white"
                                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                {l} Aufgaben
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-slate-600">
                        {pool.length > 0
                            ? `${pool.length} Aufgaben im gewählten Pool`
                            : "Wähle mindestens ein Thema aus."}
                    </p>
                    <button
                        type="button"
                        onClick={startSession}
                        disabled={pool.length === 0}
                        className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        Los geht&apos;s
                    </button>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------------- summary
    if (index >= session.length) {
        const pct = Math.round((correctCount / session.length) * 100);
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="text-6xl">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</p>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">
                    {correctCount} von {session.length} richtig
                </h1>
                <p className="mt-2 text-lg text-slate-600">{pct} % Trefferquote</p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={startSession}
                        className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
                    >
                        Nochmal
                    </button>
                    <button
                        type="button"
                        onClick={() => setSession(null)}
                        className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Themen ändern
                    </button>
                    <Link
                        href="/"
                        className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Fach wechseln
                    </Link>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------- quiz
    const current = session[index];
    const progress = ((index) / session.length) * 100;

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                    <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                            <span>
                                Aufgabe {index + 1} von {session.length}
                            </span>
                            <span>{Math.floor(elapsedMs / 1000)} s</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <QuestionCard
                        key={current.key}
                        instance={current}
                        onAnswered={handleAnswered}
                        onNext={handleNext}
                        isLast={index + 1 >= session.length}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            stop();
                            setSession(null);
                        }}
                        className="mt-4 text-sm text-slate-500 underline underline-offset-4 hover:text-slate-700"
                    >
                        Session abbrechen
                    </button>
                </div>

                <aside>
                    <Scoreboard score={score} />
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
                        <p className="font-semibold text-slate-900">{subject.emoji} {subject.short}</p>
                        <p className="mt-1 text-slate-600">
                            {correctCount} richtig · {index - correctCount} falsch
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function SubjectSwitcher({ current }: { current: SubjectId }) {
    return (
        <div className="mb-6 flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
                <Link
                    key={s.id}
                    href={`/quiz?subject=${s.id}`}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        s.id === current
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    {s.emoji} {s.short}
                </Link>
            ))}
        </div>
    );
}

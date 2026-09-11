import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import QuizClient from "@/components/quiz/QuizClient";
import { SUBJECTS, getSubject } from "@/content/subjects";
import { countForSubject } from "@/content/questions";
import { QUIZ_INTRO, SUBJECT_INTROS } from "@/content/subject-intros";
import { SUBJECT_DE, pageMeta } from "@/lib/seo";

type Search = Promise<{ subject?: string | string[] }>;

const DEFAULT_DESCRIPTION =
    "Practice exam-style business-administration (BWL) calculation questions by subject and topic - Finance, Econ 1 & 2, Financial Accounting, Cost Accounting, Entrepreneurship and Marketing - built for the BWL bachelor in München and Garching.";

function pickSubject(raw: string | string[] | undefined) {
    const id = Array.isArray(raw) ? raw[0] : raw;
    return id ? getSubject(id) : undefined;
}

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
    const subject = pickSubject((await searchParams).subject);
    if (!subject) return pageMeta({ title: "Quiz", description: DEFAULT_DESCRIPTION, path: "/quiz" });
    const n = countForSubject(subject.id);
    return pageMeta({
        title: `${subject.label} - exam-style practice`,
        description: `${n > 0 ? `${n} exam-style calculation questions` : "Exam-style calculation questions"} for the TUM course ${subject.label} (${SUBJECT_DE[subject.id]}), BWL bachelor München / Garching: ${subject.description} Fresh numbers every run, instant grading, worked solutions.`,
        path: `/quiz?subject=${subject.id}`,
    });
}

/**
 * `/quiz` = the account view (client component, needs a stored run). The
 * header below is server-rendered on purpose: a crawler or an ad-network
 * reviewer gets a real h1, the subject intro, the live question count and
 * the topic list in the first byte instead of "Loading...". While a run is
 * open, QuizClient marks the body with `data-quiz-run` and the header hides.
 */
export default async function QuizPage({ searchParams }: { searchParams: Search }) {
    const subject = pickSubject((await searchParams).subject);
    const count = subject ? countForSubject(subject.id) : 0;

    return (
        <>
            <header className="mx-auto max-w-3xl px-4 pt-8 [body[data-quiz-run]_&]:hidden">
                <p className="caps-label text-[10px] text-muted-light">
                    {subject ? `Exam-style practice · ${subject.short}` : "Exam-style practice"}
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">
                    {subject ? `${subject.emoji} ${subject.label}` : "The exam trainer"}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                    {subject ? SUBJECT_INTROS[subject.id] : QUIZ_INTRO}
                </p>
                {subject && count > 0 && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                        <strong className="text-ink">{count} questions</strong> across{" "}
                        {subject.topics.length} topics:{" "}
                        {subject.topics.map((t) => t.label).join(", ")}.
                    </p>
                )}
                {!subject && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                        Subjects:{" "}
                        {SUBJECTS.map((s, i) => (
                            <span key={s.id}>
                                {i > 0 && ", "}
                                <Link
                                    href={`/quiz?subject=${s.id}`}
                                    className="font-bold text-brand underline underline-offset-2"
                                >
                                    {s.label}
                                </Link>
                            </span>
                        ))}
                        .
                    </p>
                )}
                <p className="mt-2 text-sm text-muted">
                    <Link
                        href={subject ? `/career?subject=${subject.id}` : "/career"}
                        className="font-bold text-brand underline underline-offset-2"
                    >
                        Set up a run on the Career page →
                    </Link>
                </p>
            </header>
            <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading…</div>}>
                <QuizClient />
            </Suspense>
        </>
    );
}

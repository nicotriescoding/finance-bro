"use client";

import { useEffect, useRef, useState } from "react";
import type { QuestionInstance } from "@/lib/questions/types";
import { formatAnswer, isWithinTolerance, parseNumericInput, unitHint } from "@/lib/questions/grading";
import { topicLabel } from "@/content/subjects";
import RichText from "./RichText";

const DIFFICULTY_LABEL: Record<string, string> = {
    very_easy: "very easy",
    easy: "easy",
    medium: "medium",
    hard: "hard",
    very_hard: "very hard",
};

type Props = {
    instance: QuestionInstance;
    onAnswered: (correct: boolean) => void;
    onNext: () => void;
    isLast: boolean;
};

export default function QuestionCard({ instance, onAnswered, onNext, isLast }: Props) {
    const [value, setValue] = useState("");
    const [picked, setPicked] = useState<number[]>([]);
    const [result, setResult] = useState<null | boolean>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // reset whenever a new question comes in
    useEffect(() => {
        setValue("");
        setPicked([]);
        setResult(null);
        inputRef.current?.focus();
    }, [instance.key]);

    const isNumeric = instance.question.kind === "numeric";
    const multi = (instance.correctIndices?.length ?? 0) > 1;

    const check = () => {
        if (result !== null) return;
        let correct = false;

        if (isNumeric) {
            const parsed = parseNumericInput(value);
            if (parsed === null) return; // nothing typed yet
            const q = instance.question;
            correct =
                q.kind === "numeric" &&
                instance.answer !== undefined &&
                isWithinTolerance(parsed, instance.answer, q.unit, q.tolerance);
        } else {
            const expected = [...(instance.correctIndices ?? [])].sort().join(",");
            correct = [...picked].sort().join(",") === expected && picked.length > 0;
        }

        setResult(correct);
        onAnswered(correct);
    };

    const togglePick = (i: number) => {
        if (result !== null) return;
        setPicked((prev) =>
            multi
                ? prev.includes(i)
                    ? prev.filter((p) => p !== i)
                    : [...prev, i]
                : [i]
        );
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-slate-900 px-2.5 py-1 font-semibold text-white">
                    {topicLabel(instance.question.subject, instance.question.topic)}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    {DIFFICULTY_LABEL[instance.question.difficulty]}
                </span>
                {instance.question.source && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800">
                        {instance.question.source}
                    </span>
                )}
            </div>

            <p className="text-base leading-relaxed text-slate-800">
                <RichText text={instance.prompt} />
            </p>

            {instance.given && Object.keys(instance.given).length > 0 && (
                <dl className="mt-4 grid gap-x-6 gap-y-1 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                    {Object.entries(instance.given).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                            <dt className="text-slate-500">
                                <RichText text={k} />
                            </dt>
                            <dd className="font-medium text-slate-900">
                                <RichText text={v} />
                            </dd>
                        </div>
                    ))}
                </dl>
            )}

            {isNumeric ? (
                <div className="mt-5">
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal"
                        value={value}
                        disabled={result !== null}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            if (result === null) check();
                            else onNext();
                        }}
                        placeholder={unitHint(instance.unit ?? "number")}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                        Comma or dot as the decimal separator. Rounded intermediate steps are fine.
                    </p>
                </div>
            ) : (
                <div className="mt-5 space-y-2">
                    {multi && (
                        <p className="text-xs font-medium text-slate-500">Multiple answers possible.</p>
                    )}
                    {instance.choices?.map((choice, i) => {
                        const isPicked = picked.includes(i);
                        const isCorrect = instance.correctIndices?.includes(i);
                        let tone = "border-slate-200 bg-white hover:border-slate-300";
                        if (result !== null && isCorrect) tone = "border-emerald-500 bg-emerald-50";
                        else if (result !== null && isPicked) tone = "border-rose-400 bg-rose-50";
                        else if (isPicked) tone = "border-slate-900 bg-slate-50";

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => togglePick(i)}
                                disabled={result !== null}
                                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${tone}`}
                            >
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-slate-600">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <span className="text-slate-800">
                                    <RichText text={choice} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {result !== null && (
                <div
                    className={`mt-5 rounded-xl border p-4 text-sm ${
                        result
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : "border-rose-300 bg-rose-50 text-rose-900"
                    }`}
                >
                    <p className="font-semibold">
                        {result ? "Correct." : "Not quite."}
                        {isNumeric && instance.answer !== undefined && (
                            <> Correct answer: {formatAnswer(instance.answer, instance.unit ?? "number")}</>
                        )}
                    </p>
                    {instance.explanation && (
                        <p className="mt-2 leading-relaxed text-slate-700">
                            <RichText text={instance.explanation} />
                        </p>
                    )}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                {result === null ? (
                    <button
                        type="button"
                        onClick={check}
                        className="rounded-xl bg-slate-900 px-6 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                    >
                        Check
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onNext}
                        className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition hover:bg-emerald-500"
                    >
                        {isLast ? "See results" : "Next question"}
                    </button>
                )}
            </div>
        </div>
    );
}


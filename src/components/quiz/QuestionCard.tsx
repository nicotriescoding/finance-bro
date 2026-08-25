"use client";

import { useEffect, useRef, useState } from "react";
import type { QuestionInstance } from "@/lib/questions/types";
import {
    formatAnswer,
    isWithinTolerance,
    parseNumericInput,
    toleranceLabel,
    unitHint,
    UNIT_SUFFIX,
} from "@/lib/questions/grading";
import { maxPoints } from "@/lib/scoring";
import { formatMoney, MONEY } from "@/lib/money";
import { hintFor } from "@/lib/hints";
import RichText from "./RichText";

const DIFFICULTY_LABEL: Record<string, string> = {
    very_easy: "VERY EASY",
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD",
    very_hard: "VERY HARD",
};

type Props = {
    instance: QuestionInstance;
    /** 1-based posting number of this question in the run */
    postingNo: number;
    /** BroDollars credited for this posting once answered correctly */
    award: number | null;
    /** footer note data */
    settledCorrect: number;
    postings: number;
    writeoffs: number;
    lastWriteoffPosting: number | null;
    /** flat seniority bonus of the current rank, added to every settled posting */
    rankBonus: number;
    /** `usedHint` halves the payout upstream */
    onAnswered: (correct: boolean, usedHint: boolean) => void;
    /** forward the posting to the tax advisor - out of the run, 0 BroDollars */
    onSkip: () => void;
    onNext: () => void;
    isLast: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** The posting card - a question dressed as a bank statement line (3a). */
export default function QuestionCard({
    instance,
    postingNo,
    award,
    settledCorrect,
    postings,
    writeoffs,
    lastWriteoffPosting,
    rankBonus,
    onAnswered,
    onSkip,
    onNext,
    isLast,
}: Props) {
    const [value, setValue] = useState("");
    const [picked, setPicked] = useState<number[]>([]);
    const [result, setResult] = useState<null | boolean>(null);
    const [hintUsed, setHintUsed] = useState(false);
    const [eliminated, setEliminated] = useState<number[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // reset whenever a new question comes in
    useEffect(() => {
        setValue("");
        setPicked([]);
        setResult(null);
        setHintUsed(false);
        setEliminated([]);
        inputRef.current?.focus();
    }, [instance.key]);

    const isNumeric = instance.question.kind === "numeric";
    const multi = (instance.correctIndices?.length ?? 0) > 1;

    // 💡 the hint: numeric postings reveal the lecture formula, choice
    // postings write off half of the wrong options. Either way the payout
    // drops to 50% - advice was never free.
    const formulaHint = isNumeric ? hintFor(instance) : null;
    const wrongIndices = isNumeric
        ? []
        : (instance.choices ?? [])
              .map((_, i) => i)
              .filter((i) => !(instance.correctIndices ?? []).includes(i));
    const hintAvailable = isNumeric ? formulaHint !== null : wrongIndices.length >= 2;

    const useHint = () => {
        if (result !== null || hintUsed || !hintAvailable) return;
        setHintUsed(true);
        if (!isNumeric) {
            const cut = wrongIndices.slice(0, Math.floor(wrongIndices.length / 2));
            setEliminated(cut);
            setPicked((prev) => prev.filter((i) => !cut.includes(i)));
        }
        inputRef.current?.focus();
    };

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
        onAnswered(correct, hintUsed);
    };

    // Enter advances once the posting is settled - the input is disabled by
    // then, so the listener has to live on the window (design 3a: "Enter both
    // submits and advances"). Arm it on the next task so the very keystroke
    // that submitted the answer cannot also advance past the explanation.
    useEffect(() => {
        if (result === null) return;
        let armed = false;
        const arm = setTimeout(() => {
            armed = true;
        }, 0);
        const onKey = (e: KeyboardEvent) => {
            if (armed && e.key === "Enter") onNext();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            clearTimeout(arm);
            window.removeEventListener("keydown", onKey);
        };
    }, [result, onNext]);

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

    const meta = [
        `POSTING ${pad(postingNo)}`,
        isNumeric ? "NUMERIC" : "MULTIPLE CHOICE",
        ...(isNumeric && instance.question.kind === "numeric"
            ? [`TOLERANCE ${toleranceLabel(instance.question.unit, instance.question.tolerance)}`]
            : []),
        DIFFICULTY_LABEL[instance.question.difficulty],
    ].join(" · ");

    const suffix = instance.unit ? UNIT_SUFFIX[instance.unit] : "";

    const writeoffNote =
        writeoffs === 0
            ? ""
            : writeoffs === 1
              ? ` · one write-off, we do not talk about posting ${pad(lastWriteoffPosting ?? 0)}`
              : ` · ${writeoffs} write-offs, we do not talk about them`;

    return (
        <div className="flex flex-col gap-4 rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-6">
            {/* meta row */}
            <div className="flex flex-wrap items-center gap-2.5">
                <span className="caps-label text-[11px] text-muted">{meta}</span>
                <div className="min-w-2 flex-1" />
                {result === null && (
                    <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-muted">
                        OPEN
                    </span>
                )}
                {result === true && (
                    <span className="rounded-full bg-brand-chip px-2.5 py-1 text-xs font-bold text-brand">
                        SETTLED
                    </span>
                )}
                {result === false && (
                    <span className="rounded-full bg-warn-tint px-2.5 py-1 text-xs font-bold text-warn">
                        WRITTEN OFF
                    </span>
                )}
                <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-muted">
                    {hintUsed
                        ? `UP TO ${formatMoney(maxPoints(instance.question.difficulty) * 0.5 + rankBonus)} ${MONEY} · HINT`
                        : `UP TO ${formatMoney(maxPoints(instance.question.difficulty) + rankBonus)} ${MONEY}`}
                </span>
                {instance.question.source && (
                    <span className="caps-label rounded-full bg-chip px-2.5 py-1 text-[10px] text-muted">
                        {instance.question.source}
                    </span>
                )}
            </div>

            {/* the posting itself */}
            <p className="max-w-[60ch] text-lg leading-[1.45] tracking-[-0.01em] [text-wrap:pretty] sm:text-[22px]">
                <RichText text={instance.prompt} />
            </p>

            {instance.given && Object.keys(instance.given).length > 0 && (
                <div className="overflow-hidden rounded-[10px] border border-hairline-table">
                    <div className="caps-label bg-given-head px-3.5 py-2 text-[11px] text-muted">
                        Given values · rerolled every run
                    </div>
                    <div className="grid sm:grid-cols-2">
                        {Object.entries(instance.given).map(([k, v]) => (
                            <div
                                key={k}
                                className="flex justify-between gap-4 border-t border-hairline-soft px-3.5 py-2 text-sm sm:odd:border-r"
                            >
                                <span className="text-muted">
                                    <RichText text={k} />
                                </span>
                                <span className="font-bold tabular-nums">
                                    <RichText text={v} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hintUsed && (
                <div className="flex flex-col gap-1.5 rounded-[10px] border border-hairline bg-chip p-3.5">
                    <span className="caps-label text-[10px] text-muted">
                        💡 Hint · advisory fee: 50% of the payout
                    </span>
                    {isNumeric && formulaHint ? (
                        <p className="text-[15px] leading-relaxed text-ledger">
                            <RichText text={formulaHint} />
                        </p>
                    ) : (
                        <p className="text-[13px] text-ledger">
                            Half of the wrong options were written off for you.
                        </p>
                    )}
                </div>
            )}

            {isNumeric ? (
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                        <div className="flex flex-1 items-center gap-2.5 rounded-[10px] border-2 border-brand bg-brand-input px-4 py-3">
                            <span className="caps-label hidden text-[11px] tracking-[.12em] text-muted sm:inline">
                                Amount
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                value={value}
                                disabled={result !== null}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key !== "Enter") return;
                                    check();
                                }}
                                placeholder={unitHint(instance.unit ?? "number")}
                                className="w-full min-w-0 flex-1 bg-transparent text-xl font-extrabold tabular-nums caret-muted outline-none placeholder:text-sm placeholder:font-medium placeholder:text-muted disabled:text-ink sm:text-2xl"
                            />
                            {suffix && <span className="text-[15px] text-muted">{suffix}</span>}
                            {result === true && <span className="text-lg text-brand">✓</span>}
                        </div>
                        <button
                            type="button"
                            onClick={check}
                            disabled={result !== null}
                            className="rounded-[10px] bg-ink-raised px-6 py-3 text-[15px] font-extrabold text-white transition hover:bg-ink disabled:opacity-60 sm:py-0"
                        >
                            {result === null ? "Check" : "Checked"}
                        </button>
                    </div>
                    <p className="text-xs text-muted">
                        Comma or dot as the decimal separator. Rounded intermediate steps are fine.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {multi && (
                        <p className="caps-label text-[10px] text-muted">Multiple answers possible</p>
                    )}
                    {instance.choices?.map((choice, i) => {
                        const isPicked = picked.includes(i);
                        const isCorrect = instance.correctIndices?.includes(i);
                        const isEliminated = eliminated.includes(i);
                        let tone = "border-hairline bg-surface hover:border-[#c8d3de]";
                        if (result !== null && isCorrect) tone = "border-brand-border bg-brand-tint";
                        else if (result !== null && isPicked) tone = "border-warn-border bg-warn-tint";
                        else if (isPicked) tone = "border-brand-border bg-brand-tint";
                        if (isEliminated) tone = "border-hairline bg-surface opacity-40 line-through";

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => togglePick(i)}
                                disabled={result !== null || isEliminated}
                                className={`flex w-full items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-left text-sm transition ${tone}`}
                            >
                                <span
                                    className={`mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] text-[11px] font-extrabold ${
                                        isPicked || (result !== null && isCorrect)
                                            ? "bg-brand text-white"
                                            : "border-[1.5px] border-[#c8d3de] text-transparent"
                                    }`}
                                >
                                    ✓
                                </span>
                                <span className="text-ink">
                                    <RichText text={choice} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {result !== null && (
                <div
                    className={`flex flex-col gap-2 rounded-[10px] border p-4 ${
                        result
                            ? "border-brand-border bg-brand-tint"
                            : "border-warn-border bg-warn-tint"
                    }`}
                >
                    <div className="flex flex-wrap items-center gap-3">
                        {result ? (
                            <>
                                <span className="text-[17px] font-extrabold text-brand">
                                    Correct · credited to your account
                                </span>
                                {award !== null && award > 0 && (
                                    <span className="text-sm font-extrabold text-brand">
                                        +{formatMoney(award)} {MONEY}
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-[17px] font-extrabold text-warn">
                                    Not quite · written off
                                </span>
                                <span className="text-sm font-extrabold text-warn">−0 {MONEY}</span>
                            </>
                        )}
                    </div>
                    {!result && isNumeric && instance.answer !== undefined && (
                        <p className="text-sm font-bold">
                            Correct answer: {formatAnswer(instance.answer, instance.unit ?? "number")}
                        </p>
                    )}
                    {!result && (
                        <p className="text-xs text-muted">
                            The posting re-enters the queue with fresh numbers.
                        </p>
                    )}
                    {instance.explanation && (
                        <p className="max-w-[66ch] text-[15px] leading-[1.65] text-ledger">
                            <RichText text={instance.explanation} />
                        </p>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                {result === null ? (
                    <>
                        {!isNumeric && (
                            <button
                                type="button"
                                onClick={check}
                                className="h-[54px] w-full rounded-[10px] bg-ink-raised px-6 text-[15px] font-extrabold text-white transition hover:bg-ink sm:h-auto sm:w-auto sm:py-3"
                            >
                                Check
                            </button>
                        )}
                        {hintAvailable && (
                            <button
                                type="button"
                                onClick={useHint}
                                disabled={hintUsed}
                                className="flex-1 rounded-[10px] border border-hairline bg-surface px-4 py-2.5 text-[13px] font-bold text-muted transition hover:border-[#c8d3de] hover:text-ink disabled:cursor-default disabled:opacity-50 sm:flex-none"
                            >
                                💡 Hint · −50%
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onSkip}
                            title="Out of the run, 0 BroDollars, no questions asked"
                            className="flex-1 rounded-[10px] border border-hairline bg-surface px-4 py-2.5 text-[13px] font-bold text-muted transition hover:border-[#c8d3de] hover:text-ink sm:flex-none"
                        >
                            Skip ⏭ · 0 {MONEY}
                        </button>
                        <span className="hidden text-[13px] text-muted-light lg:inline">
                            Skipped postings go straight to your tax advisor.
                        </span>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onNext}
                            className="h-[54px] w-full rounded-[10px] bg-brand px-6 text-base font-extrabold text-white transition hover:bg-[#175a3a] sm:h-auto sm:w-auto sm:py-3.5"
                        >
                            {isLast && result ? "Close the statement ⏎" : "Next posting ⏎"}
                        </button>
                        <span className="text-[13px] text-muted">
                            Enter advances · {settledCorrect} of {postings} settled correctly
                            {writeoffNote}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

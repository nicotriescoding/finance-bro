"use client";

import { useEffect, useRef, useState } from "react";
import type { QuestionInstance } from "@/lib/questions/types";
import {
    parseNumericInput,
    toleranceLabel,
    unitHint,
    UNIT_SUFFIX,
} from "@/lib/questions/grading";
import RichText from "@/components/quiz/RichText";

const DIFFICULTY_LABEL: Record<string, string> = {
    very_easy: "VERY EASY",
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD",
    very_hard: "VERY HARD",
};

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
    instance: QuestionInstance;
    /** 1-based posting number and total */
    postingNo: number;
    total: number;
    /** duel card: no hints, no skips - the answer is graded by the house */
    onSubmit: (value: number | number[]) => void;
    /** ms timestamp until which submissions are locked (wrong-answer cooldown) */
    cooldownUntil: number;
    /** the last grading result for THIS instance, if any */
    lastWrong: boolean;
};

/** The multiplayer posting card - same statement styling, house rules. */
export default function MpQuestionCard({
    instance,
    postingNo,
    total,
    onSubmit,
    cooldownUntil,
    lastWrong,
}: Props) {
    const [value, setValue] = useState("");
    const [picked, setPicked] = useState<number[]>([]);
    const [now, setNow] = useState(() => Date.now());
    const [givenOpen, setGivenOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // reset when a new posting comes in
    useEffect(() => {
        setValue("");
        setPicked([]);
        setGivenOpen(false);
        inputRef.current?.focus();
    }, [instance.key]);

    // tick the cooldown countdown
    useEffect(() => {
        if (cooldownUntil <= Date.now()) return;
        const id = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(id);
    }, [cooldownUntil]);

    const coolingDown = cooldownUntil > now;
    const isNumeric = instance.question.kind === "numeric";
    const multi = (instance.correctIndices?.length ?? 0) > 1;
    const suffix = instance.unit ? UNIT_SUFFIX[instance.unit] : "";

    const submit = () => {
        if (coolingDown) return;
        if (isNumeric) {
            const parsed = parseNumericInput(value);
            if (parsed === null) return;
            onSubmit(parsed);
        } else {
            if (picked.length === 0) return;
            onSubmit(picked);
        }
    };

    const togglePick = (i: number) => {
        if (coolingDown) return;
        setPicked((prev) =>
            multi ? (prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i]) : [i]
        );
    };

    const meta = [
        `POSTING ${pad(postingNo)}/${pad(total)}`,
        isNumeric ? "NUMERIC" : "MULTIPLE CHOICE",
        ...(isNumeric && instance.question.kind === "numeric"
            ? [`TOLERANCE ${toleranceLabel(instance.question.unit, instance.question.tolerance)}`]
            : []),
        DIFFICULTY_LABEL[instance.question.difficulty],
    ].join(" · ");

    return (
        <div className="flex flex-col gap-4 rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-6">
            <div className="flex flex-wrap items-center gap-2.5">
                <span className="caps-label text-[11px] text-muted">{meta}</span>
                <div className="min-w-2 flex-1" />
                {coolingDown ? (
                    <span className="rounded-full bg-warn-tint px-2.5 py-1 text-xs font-bold text-warn">
                        LOCKED {Math.max(0, Math.ceil((cooldownUntil - now) / 1000))}s
                    </span>
                ) : (
                    <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-muted">
                        OPEN
                    </span>
                )}
            </div>

            <p className="max-w-[60ch] text-lg leading-[1.45] tracking-[-0.01em] [text-wrap:pretty] sm:text-[22px]">
                <RichText text={instance.prompt} />
            </p>

            {instance.given && Object.keys(instance.given).length > 0 && (
                <div className="overflow-hidden rounded-[10px] border border-hairline-table">
                    {/* Folded by default, same as solo play - the posting text
                        carries every number; the table is a free convenience. */}
                    <button
                        type="button"
                        onClick={() => setGivenOpen((o) => !o)}
                        aria-expanded={givenOpen}
                        className="caps-label flex w-full items-center justify-between bg-given-head px-3.5 py-2 text-left text-[11px] text-muted"
                    >
                        <span>Given values · same numbers for everyone</span>
                        <span className="font-bold">{givenOpen ? "HIDE TABLE" : "SHOW TABLE"}</span>
                    </button>
                    {givenOpen && (
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
                    )}
                </div>
            )}

            {lastWrong && !coolingDown && (
                <p className="text-sm font-bold text-warn">
                    Not quite - written off. Try again with fresh numbers.
                </p>
            )}
            {lastWrong && coolingDown && (
                <p className="text-sm font-bold text-warn">
                    Not quite - the compliance desk locked your terminal for a moment.
                </p>
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
                                disabled={coolingDown}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") submit();
                                }}
                                placeholder={unitHint(instance.unit ?? "number")}
                                className="w-full min-w-0 flex-1 bg-transparent text-xl font-extrabold tabular-nums caret-muted outline-none placeholder:text-sm placeholder:font-medium placeholder:text-muted disabled:text-ink sm:text-2xl"
                            />
                            {suffix && <span className="text-[15px] text-muted">{suffix}</span>}
                        </div>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={coolingDown}
                            className="rounded-[10px] bg-ink-raised px-6 py-3 text-[15px] font-extrabold text-white transition hover:bg-ink disabled:opacity-60 sm:py-0"
                        >
                            Check
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
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => togglePick(i)}
                                disabled={coolingDown}
                                className={`flex w-full items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-left text-sm transition ${
                                    isPicked
                                        ? "border-brand-border bg-brand-tint"
                                        : "border-hairline bg-surface hover:border-[#c8d3de]"
                                }`}
                            >
                                <span
                                    className={`mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] text-[11px] font-extrabold ${
                                        isPicked
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
                    <button
                        type="button"
                        onClick={submit}
                        disabled={coolingDown || picked.length === 0}
                        className="mt-1 h-[54px] w-full rounded-[10px] bg-ink-raised px-6 text-[15px] font-extrabold text-white transition hover:bg-ink disabled:opacity-60 sm:h-auto sm:w-auto sm:py-3"
                    >
                        Check
                    </button>
                </div>
            )}
        </div>
    );
}

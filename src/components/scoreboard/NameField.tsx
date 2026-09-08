"use client";

/**
 * The desk-name field, shared by the duels desk and the leaderboard. While
 * it is empty the placeholder cycles through the player's intern names
 * (same badge number, different title); the 🎲 button drops the one currently
 * shown into the field and moves on. Parents read `suggestion` back through
 * `onSuggestion` so an empty submit can adopt what the player was looking at.
 *
 * The line under the input is the Art. 13 GDPR notice at the point of entry
 * (2026-09-08 audit): the name is shown publicly, here is the policy, here
 * are the rules. Keep it on every place the field is used.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MAX_NAME_LENGTH } from "@/lib/multiplayer/protocol";

const CYCLE_MS = 2200;

export default function NameField({
    id,
    value,
    suggestions,
    onChange,
    onSuggestion,
    onEnter,
    onEscape,
    autoFocus = false,
    size = "lg",
}: {
    id: string;
    value: string;
    suggestions: string[];
    onChange: (v: string) => void;
    /** fires with the suggestion currently shown, on mount and every cycle */
    onSuggestion?: (s: string) => void;
    onEnter?: () => void;
    onEscape?: () => void;
    autoFocus?: boolean;
    size?: "lg" | "md";
}) {
    const [i, setI] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestion = suggestions[i % Math.max(1, suggestions.length)] ?? "";
    const empty = value.trim().length === 0;

    // cycle only while the field is empty - a typed name is not to be nagged
    useEffect(() => {
        if (!empty || suggestions.length < 2) return;
        const t = setInterval(() => setI((k) => k + 1), CYCLE_MS);
        return () => clearInterval(t);
    }, [empty, suggestions.length]);

    useEffect(() => {
        onSuggestion?.(suggestion);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestion]);

    const roll = () => {
        onChange(suggestion);
        setI((k) => k + 1);
        inputRef.current?.focus();
    };

    const pad = size === "lg" ? "px-4 py-3 text-lg" : "px-4 py-2.5 text-[15px]";

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={value}
                    maxLength={MAX_NAME_LENGTH}
                    autoFocus={autoFocus}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onEnter?.();
                        if (e.key === "Escape") onEscape?.();
                    }}
                    placeholder={suggestion}
                    aria-label="Your desk name"
                    className={`min-w-0 flex-1 rounded-[10px] border-2 border-brand bg-brand-input font-extrabold outline-none placeholder:font-bold placeholder:text-muted-light ${pad}`}
                />
                <button
                    type="button"
                    onClick={roll}
                    title="Use this suggestion"
                    aria-label="Use the suggested name"
                    className={`shrink-0 rounded-[10px] border border-hairline bg-surface font-extrabold text-ink transition hover:border-[#c8d3de] ${
                        size === "lg" ? "px-4 text-xl" : "px-3.5 text-lg"
                    }`}
                >
                    🎲
                </button>
            </div>
            <p className="text-xs leading-snug text-muted">
                Shown publicly on the leaderboard and in duels. No real names of others, nothing
                rude - see the{" "}
                <Link href="/terms" className="font-bold text-brand hover:underline">
                    name rules
                </Link>{" "}
                and the{" "}
                <Link href="/privacy" className="font-bold text-brand hover:underline">
                    privacy policy
                </Link>
                .
            </p>
        </div>
    );
}

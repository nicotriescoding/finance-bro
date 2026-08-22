"use client";

import type { Subject } from "@/lib/questions/types";

type Props = {
    subject: Subject;
    counts: Record<string, number>;
    selected: string[];
    onChange: (topics: string[]) => void;
};

/**
 * Topic tickboxes, design 3a: 17px rounded-square boxes, ticked rows on the
 * green tint. Multi-select - this is the filter for what the run quizzes.
 * Nothing is preselected; the "Select all" row at the top is the fast path.
 */
export default function TopicSelector({ subject, counts, selected, onChange }: Props) {
    const available = subject.topics.filter((t) => (counts[t.id] ?? 0) > 0);
    const empty = subject.topics.filter((t) => (counts[t.id] ?? 0) === 0);
    const allSelected = available.length > 0 && available.every((t) => selected.includes(t.id));
    const totalCount = available.reduce((sum, t) => sum + (counts[t.id] ?? 0), 0);

    const toggle = (id: string) =>
        onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]);

    return (
        <div className="flex flex-col gap-1.5">
            <span className="caps-label pt-0.5 text-[10px] text-muted">Topics in this mode</span>

            {/* select-all tick row - same anatomy as a topic row, bolder role */}
            <button
                type="button"
                onClick={() => onChange(allSelected ? [] : available.map((t) => t.id))}
                className={`flex items-center gap-2.5 rounded-[9px] border px-2.5 py-2 text-left transition ${
                    allSelected
                        ? "border-brand-border bg-brand-tint"
                        : "border-hairline bg-surface hover:border-[#c8d3de]"
                }`}
            >
                <span
                    className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] text-[11px] font-extrabold ${
                        allSelected
                            ? "bg-brand text-white"
                            : "border-[1.5px] border-[#c8d3de] text-transparent"
                    }`}
                >
                    ✓
                </span>
                <span className="flex-1 text-[13px] font-extrabold">Select all</span>
                <span className="text-xs tabular-nums text-muted">{totalCount}</span>
            </button>

            <div className="flex flex-col gap-1.5">
                {available.map((topic) => {
                    const active = selected.includes(topic.id);
                    return (
                        <button
                            type="button"
                            key={topic.id}
                            onClick={() => toggle(topic.id)}
                            className={`flex items-center gap-2.5 rounded-[9px] border px-2.5 py-2 text-left transition ${
                                active
                                    ? "border-brand-border bg-brand-tint"
                                    : "border-hairline bg-surface hover:border-[#c8d3de]"
                            }`}
                        >
                            <span
                                className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] text-[11px] font-extrabold ${
                                    active
                                        ? "bg-brand text-white"
                                        : "border-[1.5px] border-[#c8d3de] text-transparent"
                                }`}
                            >
                                ✓
                            </span>
                            <span
                                className={`flex-1 text-[13px] ${active ? "font-bold" : "font-medium"}`}
                            >
                                {topic.label}
                            </span>
                            <span className="text-xs tabular-nums text-muted">{counts[topic.id]}</span>
                        </button>
                    );
                })}
            </div>

            {empty.length > 0 && (
                <p className="pt-1 text-xs text-muted">
                    No questions yet: {empty.map((t) => t.label).join(", ")}
                </p>
            )}
        </div>
    );
}

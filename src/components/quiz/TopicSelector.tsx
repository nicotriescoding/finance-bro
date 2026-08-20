"use client";

import type { Subject } from "@/lib/questions/types";

type Props = {
    subject: Subject;
    counts: Record<string, number>;
    selected: string[];
    onChange: (topics: string[]) => void;
};

export default function TopicSelector({ subject, counts, selected, onChange }: Props) {
    const available = subject.topics.filter((t) => (counts[t.id] ?? 0) > 0);
    const empty = subject.topics.filter((t) => (counts[t.id] ?? 0) === 0);
    const allSelected = available.length > 0 && available.every((t) => selected.includes(t.id));

    const toggle = (id: string) =>
        onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Themen auswählen</h2>
                <button
                    type="button"
                    onClick={() => onChange(allSelected ? [] : available.map((t) => t.id))}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    {allSelected ? "Alle abwählen" : "Alle auswählen"}
                </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                {available.map((topic) => {
                    const active = selected.includes(topic.id);
                    return (
                        <label
                            key={topic.id}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                                active
                                    ? "border-emerald-400 bg-emerald-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={() => toggle(topic.id)}
                                    className="h-4 w-4 accent-emerald-600"
                                />
                                <span className="text-sm font-medium text-slate-800">{topic.label}</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                {counts[topic.id]}
                            </span>
                        </label>
                    );
                })}
            </div>

            {empty.length > 0 && (
                <p className="mt-4 text-xs text-slate-500">
                    Noch ohne Aufgaben: {empty.map((t) => t.label).join(", ")}
                </p>
            )}
        </div>
    );
}

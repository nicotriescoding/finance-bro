import Link from "next/link";
import { SUBJECTS } from "@/content/subjects";
import { ALL_QUESTIONS, countForSubject } from "@/content/questions";

export default function Home() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <section className="mb-12 text-center">
                <p className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                    {ALL_QUESTIONS.length} Aufgaben · komplett offline verfügbar
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    finance-bro 💸
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                    Klausurtraining für BWL. Fach wählen, Themen abhaken, losrechnen — mit
                    Sofort-Feedback, Rechenweg und BroDollars.
                </p>
            </section>

            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {SUBJECTS.map((subject) => {
                    const count = countForSubject(subject.id);
                    return (
                        <Link
                            key={subject.id}
                            href={`/quiz?subject=${subject.id}`}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div
                                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${subject.accent}`}
                            />
                            <div className="mb-3 text-3xl">{subject.emoji}</div>
                            <h2 className="text-lg font-semibold text-slate-900">{subject.label}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                {subject.description}
                            </p>
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-slate-500">
                                    {subject.topics.length} Themen · {count} Aufgaben
                                </span>
                                <span className="font-semibold text-emerald-700 transition group-hover:translate-x-0.5">
                                    Starten →
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </section>
        </div>
    );
}

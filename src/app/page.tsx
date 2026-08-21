import Link from "next/link";
import { SUBJECTS } from "@/content/subjects";
import { ALL_QUESTIONS, countForSubject } from "@/content/questions";

export default function Home() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
            <section className="mb-10 text-center sm:mb-12">
                <p className="caps-label mb-4 inline-block rounded-full bg-brand-chip px-3.5 py-1.5 text-[10px] text-brand">
                    {ALL_QUESTIONS.length} questions · works fully offline
                </p>
                <h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl">
                    finance-bro 💸
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted [text-wrap:pretty]">
                    Exam training for German business administration. Pick a subject, tick the
                    topics, start solving — with instant feedback, a worked solution and BroDollars.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SUBJECTS.map((subject) => {
                    const count = countForSubject(subject.id);
                    return (
                        <Link
                            key={subject.id}
                            href={`/career?subject=${subject.id}`}
                            className="group flex flex-col rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)] transition hover:border-[#c8d3de] hover:shadow-[0_2px_6px_rgba(15,33,55,.08)]"
                        >
                            <div className="mb-2.5 text-3xl">{subject.emoji}</div>
                            <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                                {subject.label}
                            </h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted">
                                {subject.description}
                            </p>
                            <div className="mt-4 flex items-center justify-between border-t border-hairline-soft pt-3 text-sm">
                                <span className="text-muted">
                                    {count > 0
                                        ? `${subject.topics.length} topics · ${count} questions`
                                        : "Exam questions coming soon"}
                                </span>
                                <span className="font-extrabold text-brand transition group-hover:translate-x-0.5">
                                    {count > 0 ? "Open account →" : "Preview →"}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </section>
        </div>
    );
}

import Link from "next/link";
import { SUBJECTS } from "@/content/subjects";
import { ALL_QUESTIONS, countForSubject } from "@/content/questions";

/**
 * The landing page. One job: explain the joke and point at /career, where a
 * run actually starts. The compact subject strip below keeps the seven course
 * names on the page for search engines (and the smoke test).
 */

const TEASERS = [
    {
        emoji: "🍵",
        title: "Munich Matcha Alert",
        text: "Get pinged when the matcha price around campus beats your hourly wage. Early data suggests: it always does.",
        status: "in development",
    },
    {
        emoji: "🥋",
        title: "Multiplayer duels",
        text: "Settle postings 1-vs-1 against your study group. Loser buys the oat-milk flat whites.",
        status: "in development",
    },
    {
        emoji: "🏆",
        title: "Semester leaderboard",
        text: "Prove you are a top performer to people who never asked. Rankings reset every semester, trauma does not.",
        status: "planned",
    },
];

export default function Home() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
            {/* hero */}
            <section className="text-center">
                <p className="caps-label mb-4 inline-block rounded-full bg-brand-chip px-3.5 py-1.5 text-[10px] text-brand">
                    {ALL_QUESTIONS.length} questions · works fully offline · tuition: 0 €
                </p>
                <h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl">
                    finance-bro 💸
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted [text-wrap:pretty]">
                    The exam trainer for business administration at TUM. Solve real exam-style
                    questions against the clock, earn BroDollars (a proud currency with an
                    exchange rate of exactly nothing), and climb the ladder from Unemployed to
                    FinanceBro.
                </p>
                <p className="mx-auto mt-3 max-w-2xl text-[15px] text-muted [text-wrap:pretty]">
                    Built for people who say &quot;let&apos;s circle back&quot; at family
                    dinners. No account, no paywall, no LinkedIn post required - just you, a
                    timer, and the quiet fear of the second attempt.
                </p>

                <div className="mt-8 flex flex-col items-center gap-3">
                    <Link
                        href="/career"
                        className="rounded-[12px] bg-brand px-9 py-4 text-lg font-extrabold text-white shadow-[0_2px_8px_rgba(15,33,55,.18)] transition hover:bg-[#175a3a]"
                    >
                        Start your career 🪦
                    </Link>
                    <p className="text-[13px] text-muted-light">
                        Pick a career, tick your topics, start earning. Quitting is allowed,
                        unlike at your future employer.
                    </p>
                </div>
            </section>

            {/* coming soon(ish) */}
            <section className="mt-14">
                <div className="mb-4 text-center">
                    <h2 className="text-xl font-extrabold tracking-[-0.02em]">
                        Coming soon(ish)
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                        Features currently stuck in the approval workflow.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    {TEASERS.map((t) => (
                        <div
                            key={t.title}
                            className="flex flex-col rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{t.emoji}</span>
                                <span className="caps-label rounded-full bg-brand-chip px-2.5 py-1 text-[9px] text-brand">
                                    {t.status}
                                </span>
                            </div>
                            <h3 className="mt-2.5 text-[15px] font-extrabold tracking-[-0.01em]">
                                {t.title}
                            </h3>
                            <p className="mt-1 text-[13px] leading-relaxed text-muted">
                                {t.text}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* subject strip - the course names live here for SEO and the smoke test */}
            <section className="mt-14 text-center">
                <h2 className="text-xl font-extrabold tracking-[-0.02em]">
                    The seven flavors of pain
                </h2>
                <p className="mt-1 text-sm text-muted">
                    Every question traceable to real TUM course material.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {SUBJECTS.map((subject) => {
                        const count = countForSubject(subject.id);
                        return (
                            <Link
                                key={subject.id}
                                href={`/career?subject=${subject.id}`}
                                className="flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3.5 py-2 text-[13px] font-bold transition hover:border-[#c8d3de] hover:shadow-[0_2px_6px_rgba(15,33,55,.08)]"
                            >
                                <span>{subject.emoji}</span>
                                <span>{subject.label}</span>
                                <span className="font-semibold text-muted">
                                    {count > 0 ? `· ${count}` : "· soon"}
                                </span>
                            </Link>
                        );
                    })}
                </div>
                <p className="mt-3 text-xs text-muted-light">
                    &quot;soon&quot; = Exam questions coming soon. The TUM past exams are being
                    ingested, bank by bank.
                </p>
            </section>
        </div>
    );
}

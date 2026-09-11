import type { Metadata } from "next";
import Link from "next/link";
import { SUBJECTS } from "@/content/subjects";
import { countForSubject } from "@/content/questions";
import { CAMPUS_NOTES } from "@/content/course-pages";
import NotAffiliated from "@/components/course/NotAffiliated";
import { CITY_PATH, PLACES, SITE_URL, SUBJECT_DE, SUBJECT_SLUG, pageMeta } from "@/lib/seo";

/**
 * The city entrance page - `/bwl-muenchen` (scenario C, 2026-09-11). One
 * page, not five city clones: it names every place once, links the seven
 * course pages, and says how the trainer works. Linked from the footer's
 * course line and the sitemap; no nav item. TUM stays out of the metadata
 * here (only the course pages, /career and /quiz name it) - the body names
 * it once, descriptively, next to the not-affiliated line.
 */

export const metadata: Metadata = pageMeta({
    title: "BWL München - free exam trainer for Garching, Arcisstraße and the U6",
    description:
        "Free exam-style calculation questions for the business administration (BWL) bachelor in München: Finance, Mikroökonomie, Makroökonomie, Kostenrechnung and more - for students in Garching, on Arcisstraße, in Straubing, Heilbronn and Ottobrunn. No account, fresh numbers every run.",
    path: CITY_PATH,
});

const TOTAL = SUBJECTS.reduce((sum, s) => sum + countForSubject(s.id), 0);
const LIVE = SUBJECTS.filter((s) => countForSubject(s.id) > 0);

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${CITY_PATH}#page`,
    name: "BWL München - exam trainer",
    url: `${SITE_URL}${CITY_PATH}`,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: PLACES.map((name) => ({ "@type": "City", name })),
    hasPart: SUBJECTS.map((s) => ({
        "@type": "LearningResource",
        name: s.label,
        url: `${SITE_URL}/${SUBJECT_SLUG[s.id]}`,
    })),
};

export default function CityPage() {
    return (
        <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
            <header>
                <NotAffiliated />
                <p className="caps-label mt-3 text-[10px] text-muted-light">
                    Exam-style practice · München · Garching · Arcisstraße
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">
                    🥨 BWL in München: the exam trainer for everyone on the U6
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                    FinanceBro is a free trainer for the business administration bachelor as it is
                    taught at TUM: {TOTAL} exam-style calculation questions across {LIVE.length} live
                    courses, numbers redrawn on every run, graded within a tolerance, worked solution
                    after every posting. Built by a student who sat these exams, not by the university
                    that set them. If you got here by googling the German course name, correct - this
                    is that.
                </p>
                <p className="mt-3">
                    <Link
                        href="/career"
                        className="inline-flex items-center gap-2 rounded-[9px] border border-brand-border bg-brand-input px-3 py-1.5 text-sm font-extrabold text-brand transition hover:bg-brand-tint"
                    >
                        Pick a course and start →
                    </Link>
                </p>
            </header>

            <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="text-lg font-extrabold tracking-[-0.02em]">The courses</h2>
                <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-muted">
                    {SUBJECTS.map((s) => {
                        const n = countForSubject(s.id);
                        return (
                            <li key={s.id}>
                                <Link
                                    href={`/${SUBJECT_SLUG[s.id]}`}
                                    className="font-bold text-brand underline underline-offset-2"
                                >
                                    {s.emoji} {s.label}
                                </Link>{" "}
                                <span className="text-muted-light">(&quot;{SUBJECT_DE[s.id]}&quot;)</span> -{" "}
                                {n > 0 ? `${n} questions, ${s.topics.length} topics.` : "exam questions coming soon."}{" "}
                                {s.description}
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="text-lg font-extrabold tracking-[-0.02em]">The campus map, by exam anxiety</h2>
                <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-muted">
                    {CAMPUS_NOTES.map((c) => (
                        <li key={c.place}>
                            <strong className="text-ink">{c.place}:</strong> {c.note}
                        </li>
                    ))}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                    Wherever you sit, the exam is the same sheet of calculations. The trainer draws
                    new numbers each run, so the second attempt at a topic is never the first one
                    again - which is, statistically, where most of the panic lives.
                </p>
            </section>

            <section className="text-sm leading-relaxed text-muted">
                <h2 className="text-lg font-extrabold tracking-[-0.02em] text-ink">How it works</h2>
                <p className="mt-1.5">
                    No account, no paywall. Choose a course and its topics on the{" "}
                    <Link href="/career" className="font-bold text-brand underline underline-offset-2">
                        Career page
                    </Link>
                    , settle postings, earn BroDollars (exchange rate: none) and climb from Pupil to
                    FinanceBro. Duel your study group in{" "}
                    <Link href="/multiplayer" className="font-bold text-brand underline underline-offset-2">
                        multiplayer
                    </Link>{" "}
                    or check the{" "}
                    <Link href="/leaderboard" className="font-bold text-brand underline underline-offset-2">
                        semester leaderboard
                    </Link>
                    . The{" "}
                    <Link href="/library" className="font-bold text-brand underline underline-offset-2">
                        Library
                    </Link>{" "}
                    has the books behind the bravado and the{" "}
                    <Link href="/products" className="font-bold text-brand underline underline-offset-2">
                        Bro Shop
                    </Link>{" "}
                    has everything you do not need for the exam.
                </p>
            </section>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </article>
    );
}

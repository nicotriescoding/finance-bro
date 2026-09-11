import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SUBJECTS, SUBJECT_MAP } from "@/content/subjects";
import { countForSubject } from "@/content/questions";
import { SUBJECT_INTROS } from "@/content/subject-intros";
import { CAMPUS_NOTES, COURSE_PAGES } from "@/content/course-pages";
import NotAffiliated from "@/components/course/NotAffiliated";
import { CITY_PATH, SITE_URL, SLUG_TO_SUBJECT, SUBJECT_DE, SUBJECT_SLUG, pageMeta } from "@/lib/seo";

/**
 * Static course pages - `/finance`, `/econ-1`, `/econ-2`, `/financial-accounting`,
 * `/cost-accounting`, `/entrepreneurship`, `/marketing` (scenario C, 2026-09-11).
 *
 * Entrance pages for search engines: one real, static URL per course with the
 * intro, the topic list, the live question count, three notes in the site's
 * voice and a campus line, then the CTA into the Career setup. They carry no
 * nav item on purpose - the footer's course line and the sitemap link them.
 * `/quiz?subject=x` stays the trainer itself (own canonical, own content).
 *
 * Unknown slugs 404 (`dynamicParams = false`), so this root-level dynamic
 * segment never shadows a missing page with a rendered one.
 */

export const dynamicParams = false;

export function generateStaticParams() {
    return SUBJECTS.map((s) => ({ subject: SUBJECT_SLUG[s.id] }));
}

type Params = Promise<{ subject: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const id = SLUG_TO_SUBJECT[(await params).subject];
    if (!id) return {};
    const subject = SUBJECT_MAP[id];
    const n = countForSubject(id);
    return pageMeta({
        title: `${subject.label} exam trainer - BWL München`,
        description: `${n > 0 ? `${n} free exam-style calculation questions` : "Free exam-style practice"} for the TUM course ${subject.label} ("${SUBJECT_DE[id]}") - for the BWL bachelor in München and Garching: ${subject.description} Fresh numbers every run, instant grading, worked solutions.`,
        path: `/${SUBJECT_SLUG[id]}`,
    });
}

export default async function CoursePage({ params }: { params: Params }) {
    const slug = (await params).subject;
    const id = SLUG_TO_SUBJECT[slug];
    if (!id) notFound();
    const subject = SUBJECT_MAP[id];
    const copy = COURSE_PAGES[id];
    const count = countForSubject(id);
    // one campus note per course, rotated by position (7 courses, 5 places)
    const campus = CAMPUS_NOTES[SUBJECTS.findIndex((s) => s.id === id) % CAMPUS_NOTES.length];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "LearningResource",
                "@id": `${SITE_URL}/${slug}#resource`,
                name: `${subject.label} - exam-style practice`,
                url: `${SITE_URL}/${slug}`,
                description: SUBJECT_INTROS[id],
                inLanguage: "en",
                isAccessibleForFree: true,
                learningResourceType: "practice questions",
                educationalLevel: "bachelor",
                educationalUse: "exam preparation",
                teaches: subject.topics.map((t) => t.label),
                about: [subject.label, SUBJECT_DE[id]],
                audience: {
                    "@type": "EducationalAudience",
                    educationalRole: "student",
                    audienceType: "business administration bachelor students in München and Garching",
                },
                provider: { "@id": `${SITE_URL}/#org` },
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "FinanceBro", item: SITE_URL },
                    { "@type": "ListItem", position: 2, name: "BWL München", item: `${SITE_URL}${CITY_PATH}` },
                    { "@type": "ListItem", position: 3, name: subject.label, item: `${SITE_URL}/${slug}` },
                ],
            },
        ],
    };

    return (
        <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
            <header>
                <NotAffiliated />
                <p className="caps-label mt-3 text-[10px] text-muted-light">
                    Exam-style practice · {subject.short} · München / Garching
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">
                    {`${subject.emoji} ${subject.label}`}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                    {copy.timetableName !== subject.label
                        ? `Known on the timetable as "${copy.timetableName}". `
                        : ""}
                    {SUBJECT_INTROS[id]}
                </p>
                <p className="mt-3">
                    <Link
                        href={`/career?subject=${id}`}
                        className="inline-flex items-center gap-2 rounded-[9px] border border-brand-border bg-brand-input px-3 py-1.5 text-sm font-extrabold text-brand transition hover:bg-brand-tint"
                    >
                        Start a run →
                    </Link>
                </p>
            </header>

            <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="text-lg font-extrabold tracking-[-0.02em]">What the exam asks</h2>
                {count > 0 ? (
                    <>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                            <strong className="text-ink">{`${count} questions`}</strong> across{" "}
                            {subject.topics.length} topics, every one a calculation with freshly
                            drawn numbers, graded within a small tolerance, with the worked path
                            after you settle it.
                        </p>
                        <ul className="mt-2.5 flex flex-wrap gap-1.5">
                            {subject.topics.map((t) => (
                                <li
                                    key={t.id}
                                    className="caps-label inline-flex items-center rounded-full bg-chip px-2.5 py-1 text-[9px] tracking-[.14em] text-muted"
                                >
                                    {t.label}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        Exam questions coming soon - the bank opens once the course&apos;s past
                        exams are in. {subject.description}
                    </p>
                )}
            </section>

            <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="text-lg font-extrabold tracking-[-0.02em]">Survival notes</h2>
                <ul className="mt-1.5 flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-muted">
                    {copy.notes.map((n) => (
                        <li key={n}>{n}</li>
                    ))}
                </ul>
            </section>

            <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="text-lg font-extrabold tracking-[-0.02em]">Where it is studied</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{copy.whereItLives}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                    <strong className="text-ink">{campus.place}:</strong> {campus.note}
                </p>
                <p className="mt-2 text-sm text-muted">
                    <Link href={CITY_PATH} className="font-bold text-brand underline underline-offset-2">
                        The whole BWL München map →
                    </Link>
                </p>
            </section>

            <section className="text-sm leading-relaxed text-muted">
                <h2 className="text-lg font-extrabold tracking-[-0.02em] text-ink">How the trainer works</h2>
                <p className="mt-1.5">
                    Free, no account. Pick the topics on the{" "}
                    <Link href={`/career?subject=${id}`} className="font-bold text-brand underline underline-offset-2">
                        Career page
                    </Link>
                    , answer postings, earn BroDollars, climb the ladder. The same questions run in{" "}
                    <Link href="/multiplayer" className="font-bold text-brand underline underline-offset-2">
                        multiplayer duels
                    </Link>{" "}
                    and count for the{" "}
                    <Link href="/leaderboard" className="font-bold text-brand underline underline-offset-2">
                        semester leaderboard
                    </Link>
                    . Other courses:{" "}
                    {SUBJECTS.filter((s) => s.id !== id).map((s, i) => (
                        <span key={s.id}>
                            {i > 0 && ", "}
                            <Link href={`/${SUBJECT_SLUG[s.id]}`} className="font-bold text-brand underline underline-offset-2">
                                {s.short}
                            </Link>
                        </span>
                    ))}
                    .
                </p>
            </section>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </article>
    );
}

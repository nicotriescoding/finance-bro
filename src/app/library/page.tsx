import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Library",
    description:
        "The finance-bro bookshelf - the books behind the bravado, with honest one-paragraph reviews.",
};

/**
 * The Library replaced the Language page in the nav (2026-08-21). Curated
 * favourite books; each card will carry a real affiliate link once Nico picks
 * a program (Amazon PartnerNet is the likely candidate - not decided yet).
 * Until then the buttons are decorative placeholders.
 *
 * Two hard rules for this page:
 *   1. NO AdSlot - Nico wants the Library ad-free (and the smoke test asserts
 *      the word "Sponsored" never appears here).
 *   2. Affiliate links must be labelled as advertising (German fair-trading
 *      law, § 5a UWG) - keep the "AD" tags and the transparency card when the
 *      real links land.
 */

type Book = {
    emoji: string;
    title: string;
    author: string;
    blurb: string;
};

const BOOKS: Book[] = [
    {
        emoji: "🌀",
        title: "SPIN Selling",
        author: "Neil Rackham",
        blurb:
            "The rare sales book built on data instead of vibes: 35,000 analysed sales calls, boiled down to four question types - Situation, Problem, Implication, Need-payoff. Explains why the biggest deals go to the person asking the questions, not the one doing the talking.",
    },
    {
        emoji: "🧪",
        title: "The Lean Startup",
        author: "Eric Ries",
        blurb:
            "Build → measure → learn, on repeat. The case for shipping an embarrassingly small MVP and letting real users falsify your business plan before the runway burns. The reason every pitch deck now says “validated learning”.",
    },
];

const ON_ORDER = [
    "Never Split the Difference",
    "Atomic Habits",
    "How to Win Friends and Influence People",
    "What Every BODY Is Saying",
    "The Psychology of Money",
];

export default function LibraryPage() {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
            <header>
                <h1 className="text-2xl font-extrabold tracking-[-0.02em]">📚 The Library</h1>
                <p className="mt-1.5 leading-relaxed text-muted">
                    The books behind the bravado. Everything on this shelf has actually
                    been read - reviews are one paragraph, because you have an exam to
                    study for.
                </p>
            </header>

            {/* Transparency card - required labelling once affiliate links go live */}
            <section className="rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-5">
                <p className="caps-label text-[10px] text-muted-light">
                    Transparency · advertising
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    The book links on this page will become <strong>affiliate links</strong>{" "}
                    - that is advertising: buy a book through one and the site earns a
                    small commission, while your price stays exactly the same. No
                    affiliate program is live yet, so the buttons below are decorative for
                    now. This page carries no other ads.
                </p>
            </section>

            {/* The shelf */}
            <section className="flex flex-col gap-4 rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="border-b border-hairline-soft pb-3 text-xl font-extrabold tracking-[-0.02em]">
                    On the shelf
                </h2>

                {BOOKS.map((book, i) => (
                    <div
                        key={book.title}
                        className={`flex flex-col gap-4 sm:flex-row sm:items-start ${
                            i > 0 ? "border-t border-hairline-soft pt-4" : ""
                        }`}
                    >
                        <div className="flex h-28 w-28 flex-none items-center justify-center rounded-xl bg-chip text-5xl">
                            {book.emoji}
                        </div>
                        <div className="min-w-0">
                            <p className="font-extrabold">{book.title}</p>
                            <p className="caps-label mt-0.5 text-[10px] text-muted-light">
                                {book.author}
                            </p>
                            <p className="mb-2.5 mt-1.5 text-sm leading-relaxed text-muted">
                                {book.blurb}
                            </p>
                            <span
                                aria-disabled
                                title="The affiliate link is not live yet"
                                className="inline-flex cursor-not-allowed items-center gap-2 rounded-[9px] border border-hairline bg-chip px-3 py-1.5 text-sm font-extrabold text-muted"
                            >
                                Get the book →
                                <span className="caps-label text-[9px] tracking-[.16em] text-muted-light">
                                    AD · link coming soon
                                </span>
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            <p className="text-center text-sm italic text-muted-light">
                On order: {ON_ORDER.join(" · ")} - the shelf grows as soon as the
                librarian finishes his own exams.
            </p>
        </div>
    );
}

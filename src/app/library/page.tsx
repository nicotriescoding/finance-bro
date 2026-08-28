import type { Metadata } from "next";
import { amz } from "@/lib/affiliate";

export const metadata: Metadata = {
    title: "Library",
    description:
        "The finance-bro bookshelf - the books behind the bravado, rated by ROI multiplier.",
};

/**
 * The Library replaced the Language page in the nav (2026-08-21). Affiliate
 * links come from src/lib/affiliate.ts (Amazon PartnerNet - rationale and
 * Nico's tag TODO live there). Covers are hotlinked from Open Library's
 * covers API - the standard source for book covers; swap to Amazon PA-API
 * images once PartnerNet is live if we ever want exact editions.
 *
 * Two hard rules for this page:
 *   1. NO AdSlot - Nico wants the Library ad-free (and the smoke test asserts
 *      the word "Sponsored" never appears here).
 *   2. Affiliate links must be labelled as advertising (German fair-trading
 *      law, § 5a UWG) - keep the "AD" tags and the transparency card.
 *
 * Ratings: the ROI multiplier - what a book returned per hour it cost to
 * read. Everything on the shelf was actually read by Nico; `roi` and `review`
 * are HIS numbers and words. null = Nico still owes them (rendered as
 * "pending audit") - fill them in as he delivers, do not invent them.
 */

type Book = {
    title: string;
    author: string;
    cover: string;
    /** Amazon search query for the affiliate link. */
    q: string;
    /** Nico's ROI multiplier, e.g. 7.5 - null until he rates it. */
    roi: number | null;
    /** Nico's personal one-paragraph opinion - null until he writes it. */
    review: string | null;
};

type Section = { name: string; emoji: string; books: Book[] };

const SECTIONS: Section[] = [
    {
        name: "Startup",
        emoji: "🚀",
        books: [
            {
                title: "The Lean Startup",
                author: "Eric Ries",
                cover: "https://covers.openlibrary.org/b/id/7104760-M.jpg",
                q: "the lean startup eric ries",
                roi: null,
                review:
                    "Turns the black box of a startup into a deeper understanding of what is actually going on inside one.",
            },
            {
                title: "SPIN Selling",
                author: "Neil Rackham",
                cover: "https://covers.openlibrary.org/b/id/55114-M.jpg",
                q: "spin selling neil rackham",
                roi: null,
                review:
                    "Understanding B2B sales - and what separates them from B2C.",
            },
        ],
    },
    {
        name: "Personal Investing",
        emoji: "📈",
        books: [
            {
                title: "The Psychology of Money",
                author: "Morgan Housel",
                cover: "https://covers.openlibrary.org/b/id/10389354-M.jpg",
                q: "the psychology of money morgan housel",
                roi: null,
                review: null,
            },
        ],
    },
    {
        name: "Social Understanding & Negotiation",
        emoji: "🤝",
        books: [
            {
                title: "What Every BODY Is Saying",
                author: "Joe Navarro",
                cover: "https://covers.openlibrary.org/b/id/8734461-M.jpg",
                q: "what every body is saying joe navarro",
                roi: null,
                review: null,
            },
            {
                title: "Never Split the Difference",
                author: "Chris Voss",
                cover: "https://covers.openlibrary.org/b/id/8365942-M.jpg",
                q: "never split the difference chris voss",
                roi: null,
                review: null,
            },
            {
                title: "How to Win Friends and Influence People",
                author: "Dale Carnegie",
                cover: "https://covers.openlibrary.org/b/id/13314878-M.jpg",
                q: "how to win friends and influence people dale carnegie",
                roi: null,
                review: null,
            },
        ],
    },
    {
        name: "Psychology",
        emoji: "🧠",
        books: [
            {
                title: "Atomic Habits",
                author: "James Clear",
                cover: "https://covers.openlibrary.org/b/id/12539702-M.jpg",
                q: "atomic habits james clear",
                roi: null,
                review: null,
            },
            {
                title: "The Child in You",
                author: "Stefanie Stahl",
                cover: "https://covers.openlibrary.org/b/id/10555909-M.jpg",
                q: "the child in you stefanie stahl",
                roi: null,
                review: null,
            },
        ],
    },
];

/** Not read yet - listed, not rated. */
const ON_ORDER = [
    { title: "$100M Money Models", author: "Alex Hormozi" },
];

/** ROI chip: Nico's multiplier, or the pending-audit state. */
function RoiChip({ roi }: { roi: number | null }) {
    if (roi === null) {
        return (
            <span className="caps-label inline-flex items-center rounded-full bg-chip px-2 py-0.5 text-[9px] tracking-[.14em] text-muted-light">
                ROI ×?.? · pending audit
            </span>
        );
    }
    return (
        <span className="caps-label inline-flex items-center rounded-full bg-brand-chip px-2 py-0.5 text-[9px] tracking-[.14em] text-brand">
            ROI ×{roi.toLocaleString("en-US", { maximumFractionDigits: 1 })}
        </span>
    );
}

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

            {/* The rating system */}
            <section className="rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-5">
                <p className="caps-label text-[10px] text-muted-light">
                    Rating system · the ROI multiplier
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Books are rated like investments: <strong>ROI ×N</strong> is what a
                    book returned per hour it cost to read. ×1 breaks even with
                    scrolling, ×5 beats most lectures, ×10 should be illegal insider
                    knowledge. Ratings marked <em>pending audit</em> are with the
                    librarian&apos;s back office.
                </p>
            </section>

            {/* Transparency - affiliate links are advertising */}
            <section className="rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-5">
                <p className="caps-label text-[10px] text-muted-light">
                    Transparency · advertising
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    The book buttons are <strong>affiliate links</strong> - that is
                    advertising: buy a book through one and the site earns a small
                    commission, while your price stays exactly the same. As an Amazon
                    partner, this site earns from qualifying purchases. This page
                    carries no other ads. Covers via Open Library.
                </p>
            </section>

            {/* The shelves */}
            {SECTIONS.map((section) => (
                <section
                    key={section.name}
                    className="flex flex-col gap-4 rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]"
                >
                    <h2 className="border-b border-hairline-soft pb-3 text-xl font-extrabold tracking-[-0.02em]">
                        {section.emoji} {section.name}
                    </h2>

                    {section.books.map((book, i) => (
                        <div
                            key={book.title}
                            className={`flex gap-4 ${
                                i > 0 ? "border-t border-hairline-soft pt-4" : ""
                            }`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={book.cover}
                                alt={`Cover of ${book.title}`}
                                loading="lazy"
                                className="h-32 w-[84px] flex-none rounded-[6px] border border-hairline-soft bg-chip object-cover shadow-[0_1px_3px_rgba(15,33,55,.12)]"
                            />
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-extrabold">{book.title}</p>
                                    <RoiChip roi={book.roi} />
                                </div>
                                <p className="caps-label mt-0.5 text-[10px] text-muted-light">
                                    {book.author}
                                </p>
                                <p
                                    className={`mb-2.5 mt-1.5 text-sm leading-relaxed ${
                                        book.review ? "text-muted" : "italic text-muted-light"
                                    }`}
                                >
                                    {book.review ??
                                        "The librarian's review is stuck in the approval workflow. It exists, it is opinionated, and it lands with the next release."}
                                </p>
                                <a
                                    href={amz(book.q)}
                                    target="_blank"
                                    rel="sponsored nofollow noopener"
                                    className="inline-flex items-center gap-2 rounded-[9px] border border-brand-border bg-brand-input px-3 py-1.5 text-sm font-extrabold text-brand transition hover:bg-brand-tint"
                                >
                                    Get the book →
                                    <span className="caps-label text-[9px] tracking-[.16em] text-muted-light">
                                        AD
                                    </span>
                                </a>
                            </div>
                        </div>
                    ))}
                </section>
            ))}

            <p className="text-center text-sm italic text-muted-light">
                On order:{" "}
                {ON_ORDER.map((b) => `${b.title} (${b.author})`).join(" · ")} - unread
                books do not get rated. That would be technical analysis.
            </p>
        </div>
    );
}

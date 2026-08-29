import type { Metadata } from "next";
import AdRail from "@/components/AdRail";
import { amz } from "@/lib/affiliate";

export const metadata: Metadata = {
    title: "Bro Shop",
    description:
        "The FinanceBro shop - three curated bundles: the Starter Pack, the Undercover Broke Student and BWL Marie.",
};

/**
 * The Bro Shop (rebuilt 2026-08-29, images upgraded same day): three joke
 * bundles in a two-column card grid, flanked by the sticky desktop ad rails
 * (AdRail). The Patagonia Vest blurb is original finance-bro canon: do not
 * touch it. (Business School Cigarettes and the Hela Ketchup were removed
 * 2026-08-29 per Nico - do not resurrect without asking him.)
 *
 * Images are Adobe Stock photos, licensed on Nico's Adobe account (all
 * free-tier assets, standard license, no attribution required) and committed
 * as ~900px optimized JPEGs under public/products/. Every image was scouted
 * against 5+ candidates and picked by eye for professional shop quality.
 * If a product image ever changes: license via the Adobe connector first,
 * then commit the file - never hotlink.
 *
 * Affiliate links come from src/lib/affiliate.ts (Amazon PartnerNet; the
 * rationale and Nico's tag TODO live there).
 */

type Product = {
    name: string;
    img: { src: string; alt: string };
    blurb: string;
    /** Amazon search link - absent means the product is not buyable (sold out). */
    href?: string;
    /** Sold-out gag chip instead of a link. */
    soldOut?: string;
    /** Small print under the link. */
    note?: string;
};

type Bundle = {
    name: string;
    emoji: string;
    /** One-line joke under the bundle title. */
    tagline: string;
    /** Caps chips in the bundle header, portfolio-style. */
    chips: string[];
    products: Product[];
};

const BUNDLES: Bundle[] = [
    {
        name: "The FinanceBro Starter Pack",
        emoji: "💼",
        tagline: "Look the part long before you can price the part.",
        chips: ["6 positions", "risk: daddy-backed", "yield: pure image"],
        products: [
            {
                name: "Birkin Bag",
                img: {
                    src: "/products/birkin.jpg",
                    alt: "A pink designer handbag",
                },
                blurb:
                    "Something small for when you forgot her birthday. Again. The waiting list is longer than your DCF model and twice as fictional.",
                soldOut: "SOLD OUT - restock after the next bonus round",
            },
            {
                name: "Patagonia Vest",
                img: {
                    src: "/products/vest.jpg",
                    alt: "A black quilted puffer vest",
                },
                blurb:
                    "For the true business students who don't just study economics but have made the lifestyle their own. Usually comes with an internship arranged by Daddy and a superiority complex.",
                href: amz("ellesse weste herren"),
                note: "Patagonia's affiliate desk has not returned our calls - this link is the ellesse one. Same vest energy, fraction of the Daddy.",
            },
            {
                name: "The Intern's Rolex",
                img: {
                    src: "/products/watch.jpg",
                    alt: "A gold retro digital wristwatch",
                },
                blurb:
                    "Gold Casio, 30 € all in. Tells the time, stores phone numbers from 1987 and holds its value better than your first portfolio. The MD will respect the irony.",
                href: amz("casio vintage gold uhr"),
            },
            {
                name: "AirPods",
                img: {
                    src: "/products/earbuds.jpg",
                    alt: "White wireless earbuds on a white background",
                },
                blurb:
                    "Mandatory equipment for pacing the library stairwell saying 'let's circle back' to nobody. Noise cancellation sold separately from the consequences.",
                href: amz("apple airpods"),
            },
            {
                name: "Protein Shaker",
                img: {
                    src: "/products/shaker.jpg",
                    alt: "A protein shaker bottle filled with shake",
                },
                blurb:
                    "For the 6 AM gym-before-market-open routine you commit to every Sunday evening. Holds 700 ml of whey and an unlimited amount of ambition.",
                href: amz("protein shaker 700 ml"),
            },
            {
                name: "TI-30 Calculator",
                img: {
                    src: "/products/calculator.jpg",
                    alt: "A black scientific calculator on a white background",
                },
                blurb:
                    "The only Bloomberg terminal the exam hall allows. Discounts cash flows, compounds interest, and never once suggests a 0DTE position.",
                href: amz("texas instruments ti-30x plus mathprint"),
            },
        ],
    },
    {
        name: "The Undercover Broke Student",
        emoji: "🥷",
        tagline: "Everything you need to look liquid while being insolvent.",
        chips: ["6 positions", "risk: actual", "burn rate: 4.20 €/day"],
        products: [
            {
                name: "Instant Noodles, Bulk Position",
                img: {
                    src: "/products/ramen.jpg",
                    alt: "An instant noodle block on a white background",
                },
                blurb:
                    "Unit economics no meal-prep influencer can beat: 0.40 € a serving, shelf life longer than your student loan. Buy the dip. Eat the dip.",
                href: amz("instant nudeln vorratspack"),
            },
            {
                name: "Cup Noodles, To Go",
                img: {
                    src: "/products/cup-noodles.jpg",
                    alt: "A fork lifting noodles out of an instant noodle cup",
                },
                blurb:
                    "Same asset class as the position above. That is not diversification - but at 1 € a cup, nobody is auditing you.",
                href: amz("cup nudeln vorteilspack"),
            },
            {
                name: "Espresso Machine (Value Edition)",
                img: {
                    src: "/products/moka.jpg",
                    alt: "A red moka pot on a white background",
                },
                blurb:
                    "Does what the campus coffee subscription does at 0.09 € a shot. The single highest-ROI machine ever admitted to a shared kitchen.",
                href: amz("espressokocher 6 tassen"),
            },
            {
                name: "The 89 € Interview Suit",
                img: {
                    src: "/products/suit.jpg",
                    alt: "A dark suit with white shirt and tie on an invisible mannequin",
                },
                blurb:
                    "Looks like 800 € on Zoom, feels like 89 € in person. Schedule accordingly: first rounds are always remote.",
                href: amz("anzug herren slim fit"),
            },
            {
                name: "Library-Grade Earplugs",
                img: {
                    src: "/products/earplugs.jpg",
                    alt: "Colorful foam earplugs on a white background",
                },
                blurb:
                    "Blocks out the guy who types like he is settling a personal score with his keyboard. 35 dB of pure alpha for 2 €.",
                href: amz("ohropax classic"),
            },
            {
                name: "20,000 mAh Powerbank",
                img: {
                    src: "/products/powerbank.jpg",
                    alt: "A white power bank with cable on a yellow background",
                },
                blurb:
                    "The only outlets in the library are guarded like board seats. This keeps the laptop alive through exam season and the denial phase after.",
                href: amz("powerbank 20000mah"),
            },
        ],
    },
    {
        name: "BWL Marie",
        emoji: "🎀",
        tagline:
            "For the business girlie whose semester runs on matcha, pastel and immaculate vibes.",
        chips: ["7 positions", "risk: aesthetic", "dividend: content"],
        products: [
            {
                name: "The Kånken",
                img: {
                    src: "/products/backpack.jpg",
                    alt: "A pastel blue backpack on a pink background",
                },
                blurb:
                    "One backpack, four colorways, every lecture hall in Munich. Contains one iPad, zero printed readings and a small pharmacy of lip balm.",
                href: amz("fjällräven kanken rucksack"),
            },
            {
                name: "iPad Pencil Setup",
                img: {
                    src: "/products/ipad-pencil.jpg",
                    alt: "A tablet with a stylus pen on a white background",
                },
                blurb:
                    "For lecture notes so beautifully color-coded they never get read twice. The handwriting-to-text feature has seen things.",
                href: amz("stift für ipad"),
            },
            {
                name: "Pastel Highlighter Set",
                img: {
                    src: "/products/highlighters.jpg",
                    alt: "Pastel highlighters in a neat row",
                },
                blurb:
                    "The difference between studying and manifesting a 1.3. Sixty percent of every page highlighted, so nothing important gets missed. Or found.",
                href: amz("stabilo boss pastell set"),
            },
            {
                name: "Claw Clip, Load-Bearing",
                img: {
                    src: "/products/claw-clip.jpg",
                    alt: "A red claw clip on a white background",
                },
                blurb:
                    "Structural engineering for the messy bun. Holds more together than the group project ever did.",
                href: amz("haarklammer groß set"),
            },
            {
                name: "Matcha Starter Set",
                img: {
                    src: "/products/matcha.jpg",
                    alt: "A bowl of matcha with a bamboo whisk",
                },
                blurb:
                    "Front-run the Munich Matcha Alert and whisk it yourself. 9 € a cup on Maximilianstraße, 0.60 € at your desk - an arbitrage even Econ 1 can price.",
                href: amz("matcha set schale besen"),
            },
            {
                name: "Emergency Prosecco",
                img: {
                    src: "/products/prosecco.jpg",
                    alt: "A Prosecco bottle with two filled glasses",
                },
                blurb:
                    "For passed exams, failed exams and Wednesdays. The only position in this bundle that pays a liquid dividend.",
                href: amz("prosecco extra dry"),
            },
            {
                name: "Pilates Princess Mat",
                img: {
                    src: "/products/yoga-mat.jpg",
                    alt: "A pink rolled yoga mat",
                },
                blurb:
                    "Where the 'movement is my meditation' LinkedIn posts are produced. Returns arrive as core strength and content.",
                href: amz("yogamatte rutschfest"),
            },
        ],
    },
];

function ProductCard({ p }: { p: Product }) {
    return (
        <div className="flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-surface shadow-[0_1px_2px_rgba(15,33,55,.05)]">
            <div className="flex h-44 flex-none items-center justify-center border-b border-hairline-soft bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={p.img.src}
                    alt={p.img.alt}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                />
            </div>
            <div className="flex flex-1 flex-col p-4">
                <p className="font-extrabold">{p.name}</p>
                <p className="mb-3 mt-1 flex-1 text-sm leading-relaxed text-muted">
                    {p.blurb}
                </p>
                {p.soldOut ? (
                    <span className="caps-label inline-flex items-center self-start rounded-full bg-warn-tint px-2.5 py-1 text-[10px] font-extrabold tracking-[.14em] text-warn">
                        {p.soldOut}
                    </span>
                ) : (
                    <a
                        href={p.href}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                        className="inline-flex items-center gap-2 self-start rounded-[9px] border border-brand-border bg-brand-input px-3 py-1.5 text-sm font-extrabold text-brand transition hover:bg-brand-tint"
                    >
                        See the offer →
                        <span className="caps-label text-[9px] tracking-[.16em] text-muted-light">
                            AD
                        </span>
                    </a>
                )}
                {p.note && (
                    <p className="mt-2 text-[11px] italic leading-relaxed text-muted-light">
                        {p.note}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <div className="mx-auto flex max-w-[1440px] gap-[18px] px-4 py-8 lg:px-[22px]">
            <AdRail note="Finance Newsletter" />

            <div className="mx-auto flex min-w-0 max-w-4xl flex-1 flex-col gap-6">
                <header>
                    <h1 className="text-2xl font-extrabold tracking-[-0.02em]">
                        📦 The Bro Shop
                    </h1>
                    <p className="mt-1.5 leading-relaxed text-muted">
                        Three curated bundles, zero due diligence. Pick the portfolio
                        that matches the person you are pretending to be this semester.
                    </p>
                    {/* Transparency: affiliate links are advertising (§ 5a UWG) */}
                    <p className="mt-3 text-xs leading-relaxed text-muted-light">
                        <span className="caps-label text-[9px] tracking-[.14em]">
                            Transparency · advertising:
                        </span>{" "}
                        the &quot;See the offer&quot; buttons are (or will become){" "}
                        affiliate links - buy through one and the site earns a small
                        commission while your price stays exactly the same. As an
                        Amazon partner, this site earns from qualifying purchases.
                    </p>
                </header>

                {BUNDLES.map((bundle) => (
                    <section key={bundle.name} className="flex flex-col gap-4">
                        <div className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <h2 className="text-xl font-extrabold tracking-[-0.02em]">
                                    {bundle.emoji} {bundle.name}
                                </h2>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-muted">
                                {bundle.tagline}
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {bundle.chips.map((chip) => (
                                    <span
                                        key={chip}
                                        className="caps-label inline-flex items-center rounded-full bg-chip px-2.5 py-1 text-[9px] tracking-[.14em] text-muted"
                                    >
                                        {chip}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {bundle.products.map((p) => (
                                <ProductCard key={p.name} p={p} />
                            ))}
                        </div>
                    </section>
                ))}

                {/* Photo note - Adobe Stock standard license, no attribution owed */}
                <p className="text-center text-[11px] leading-relaxed text-muted-light">
                    Product photos licensed via Adobe Stock. Pictures are
                    illustrative - the linked offer may look better. Or worse.
                </p>
            </div>

            <AdRail note="Trading Platform" />
        </div>
    );
}

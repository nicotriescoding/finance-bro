import type { Metadata } from "next";
import AdRail from "@/components/AdRail";
import { amz } from "@/lib/affiliate";

export const metadata: Metadata = {
    title: "Bro Shop",
    description:
        "The FinanceBro shop - three curated bundles: the Starter Pack, the Undercover Broke Student and BWL Marie.",
};

/**
 * The Bro Shop (rebuilt 2026-08-29): three joke bundles in a two-column card
 * grid, flanked by the sticky desktop ad rails (AdRail). The Patagonia Vest
 * and Business School Cigarettes blurbs are original finance-bro canon: do
 * not touch them.
 *
 * Affiliate links come from src/lib/affiliate.ts (Amazon PartnerNet; the
 * rationale and Nico's tag TODO live there).
 *
 * Images are hotlinked 500px thumbs from Wikimedia Commons, every one
 * verified by eye (they used to show the wrong crop of the wrong thing).
 * They render with object-contain so nothing zooms; CC-licensed ones are
 * credited in the photo-credits card at the bottom - keep that card, German
 * attribution law is not a joke bundle.
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

const WM = "https://upload.wikimedia.org/wikipedia/commons/thumb";

const BUNDLES: Bundle[] = [
    {
        name: "The FinanceBro Starter Pack",
        emoji: "💼",
        tagline: "Look the part long before you can price the part.",
        chips: ["8 positions", "risk: daddy-backed", "yield: pure image"],
        products: [
            {
                name: "Birkin Bag",
                img: {
                    src: `${WM}/7/7a/Hermes_Birkin-2.jpg/500px-Hermes_Birkin-2.jpg`,
                    alt: "A pink Hermes Birkin bag",
                },
                blurb:
                    "Something small for when you forgot her birthday. Again. The waiting list is longer than your DCF model and twice as fictional.",
                soldOut: "SOLD OUT - restock after the next bonus round",
            },
            {
                name: "Patagonia Vest",
                img: {
                    src: `${WM}/1/12/Zwarte_bodywarmer_van_merk_Spex%2C_objectnr_86987.JPG/500px-Zwarte_bodywarmer_van_merk_Spex%2C_objectnr_86987.JPG`,
                    alt: "A black puffer vest on a mannequin",
                },
                blurb:
                    "For the true business students who don't just study economics but have made the lifestyle their own. Usually comes with an internship arranged by Daddy and a superiority complex.",
                href: amz("ellesse weste herren"),
                note: "Patagonia's affiliate desk has not returned our calls - this link is the ellesse one. Same vest energy, fraction of the Daddy.",
            },
            {
                name: "Business School Cigarettes",
                img: {
                    src: `${WM}/4/4c/Caravellis_Dj%C3%A9bel_Chocolate_Cigarettes_blikje%2C_foto_2.JPG/500px-Caravellis_Dj%C3%A9bel_Chocolate_Cigarettes_blikje%2C_foto_2.JPG`,
                    alt: "An open retro tin of chocolate cigarettes",
                },
                blurb:
                    "Your easy entry into investing - takes the edge off so you can finally blow bubbles.",
                href: amz("seifenblasen zigaretten"),
                note: "Bubble-blowing fake cigarettes. The only bubble on this site you are allowed to enjoy.",
            },
            {
                name: "The Intern's Rolex",
                img: {
                    src: `${WM}/4/44/Casio_Data_Bank_watch_in_gold_%28edited%29.jpg/500px-Casio_Data_Bank_watch_in_gold_%28edited%29.jpg`,
                    alt: "A gold Casio Data Bank digital watch",
                },
                blurb:
                    "Gold Casio, 30 € all in. Tells the time, stores phone numbers from 1987 and holds its value better than your first portfolio. The MD will respect the irony.",
                href: amz("casio vintage gold uhr"),
            },
            {
                name: "AirPods",
                img: {
                    src: `${WM}/8/83/AirPods_%28cropped%29.jpg/500px-AirPods_%28cropped%29.jpg`,
                    alt: "White wireless earbuds next to their charging case",
                },
                blurb:
                    "Mandatory equipment for pacing the library stairwell saying 'let's circle back' to nobody. Noise cancellation sold separately from the consequences.",
                href: amz("apple airpods"),
            },
            {
                name: "Protein Shaker",
                img: {
                    src: `${WM}/1/1b/Osaka_protein_shaker.jpg/500px-Osaka_protein_shaker.jpg`,
                    alt: "A clear protein shaker bottle with a blue lid",
                },
                blurb:
                    "For the 6 AM gym-before-market-open routine you commit to every Sunday evening. Holds 700 ml of whey and an unlimited amount of ambition.",
                href: amz("protein shaker 700 ml"),
            },
            {
                name: "Hela Curry Gewürz Ketchup",
                img: {
                    src: `${WM}/b/bf/Ketchup_Deppenleerzeichen.jpg/500px-Ketchup_Deppenleerzeichen.jpg`,
                    alt: "A bottle of Hela Curry Gewürz Ketchup",
                },
                blurb:
                    "The official closing dinner of German middle management. Pairs with currywurst, canteen trays and quarterly numbers that need a little seasoning.",
                href: amz("hela curry gewürz ketchup delikat"),
            },
            {
                name: "TI-30 Calculator",
                img: {
                    src: `${WM}/7/78/TI-30_Galaxy_calculator.jpg/500px-TI-30_Galaxy_calculator.jpg`,
                    alt: "A vintage Texas Instruments TI-30 calculator",
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
                    src: `${WM}/8/8c/Five_packs_of_shrimp-flavoured_instant_noodles.jpg/500px-Five_packs_of_shrimp-flavoured_instant_noodles.jpg`,
                    alt: "A stack of instant noodle packs",
                },
                blurb:
                    "Unit economics no meal-prep influencer can beat: 0.40 € a serving, shelf life longer than your student loan. Buy the dip. Eat the dip.",
                href: amz("instant nudeln vorratspack"),
            },
            {
                name: "Cup Noodles, To Go",
                img: {
                    src: `${WM}/3/34/Nissin_Cup_Noodle_%28Original%29_-_01.jpg/500px-Nissin_Cup_Noodle_%28Original%29_-_01.jpg`,
                    alt: "An open cup of instant noodles",
                },
                blurb:
                    "Same asset class as the position above. That is not diversification - but at 1 € a cup, nobody is auditing you.",
                href: amz("cup nudeln vorteilspack"),
            },
            {
                name: "Espresso Machine (Value Edition)",
                img: {
                    src: `${WM}/c/ce/Moka_pot_components_assembled.png/500px-Moka_pot_components_assembled.png`,
                    alt: "A classic aluminium moka pot",
                },
                blurb:
                    "Does what the campus coffee subscription does at 0.09 € a shot. The single highest-ROI machine ever admitted to a shared kitchen.",
                href: amz("espressokocher 6 tassen"),
            },
            {
                name: "The 89 € Interview Suit",
                img: {
                    src: `${WM}/a/a3/Shooting_de_Mannequin_%21_%288353507873%29.jpg/500px-Shooting_de_Mannequin_%21_%288353507873%29.jpg`,
                    alt: "A grey suit on a mannequin",
                },
                blurb:
                    "Looks like 800 € on Zoom, feels like 89 € in person. Schedule accordingly: first rounds are always remote.",
                href: amz("anzug herren slim fit"),
            },
            {
                name: "Library-Grade Earplugs",
                img: {
                    src: `${WM}/8/88/A_pair_of_orange_foam_earplugs.jpg/500px-A_pair_of_orange_foam_earplugs.jpg`,
                    alt: "A pair of orange foam earplugs",
                },
                blurb:
                    "Blocks out the guy who types like he is settling a personal score with his keyboard. 35 dB of pure alpha for 2 €.",
                href: amz("ohropax classic"),
            },
            {
                name: "20,000 mAh Powerbank",
                img: {
                    src: `${WM}/7/75/Portable_power_bank.jpg/500px-Portable_power_bank.jpg`,
                    alt: "A white portable power bank with cable",
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
                    src: `${WM}/f/fc/Fj%C3%A4llr%C3%A4ven_K%C3%A5nken_backpacks.jpg/500px-Fj%C3%A4llr%C3%A4ven_K%C3%A5nken_backpacks.jpg`,
                    alt: "A shelf of colorful Kånken backpacks",
                },
                blurb:
                    "One backpack, four colorways, every lecture hall in Munich. Contains one iPad, zero printed readings and a small pharmacy of lip balm.",
                href: amz("fjällräven kanken rucksack"),
            },
            {
                name: "iPad Pencil Setup",
                img: {
                    src: `${WM}/f/f7/Apple_Pencil_-_iPad_Pro_%2840144499833%29.jpg/500px-Apple_Pencil_-_iPad_Pro_%2840144499833%29.jpg`,
                    alt: "An Apple Pencil lying on a desk",
                },
                blurb:
                    "For lecture notes so beautifully color-coded they never get read twice. The handwriting-to-text feature has seen things.",
                href: amz("stift für ipad"),
            },
            {
                name: "Pastel Highlighter Set",
                img: {
                    src: `${WM}/c/ca/STABILO_BOSS_Original1.jpg/500px-STABILO_BOSS_Original1.jpg`,
                    alt: "Highlighters lying on an annotated page",
                },
                blurb:
                    "The difference between studying and manifesting a 1.3. Sixty percent of every page highlighted, so nothing important gets missed. Or found.",
                href: amz("stabilo boss pastell set"),
            },
            {
                name: "Claw Clip, Load-Bearing",
                img: {
                    src: `${WM}/1/1e/3_big_claw_clips_for_thick_long_hair.png/500px-3_big_claw_clips_for_thick_long_hair.png`,
                    alt: "A hand holding three large claw clips",
                },
                blurb:
                    "Structural engineering for the messy bun. Holds more together than the group project ever did.",
                href: amz("haarklammer groß set"),
            },
            {
                name: "Matcha Starter Set",
                img: {
                    src: `${WM}/c/c3/Matcha_%285026245674%29.jpg/500px-Matcha_%285026245674%29.jpg`,
                    alt: "A bowl of whisked matcha tea",
                },
                blurb:
                    "Front-run the Munich Matcha Alert and whisk it yourself. 9 € a cup on Maximilianstraße, 0.60 € at your desk - an arbitrage even Econ 1 can price.",
                href: amz("matcha set schale besen"),
            },
            {
                name: "Emergency Prosecco",
                img: {
                    src: `${WM}/3/32/Prosecco_DOC_Millesimato_Extra_Dry.jpg/500px-Prosecco_DOC_Millesimato_Extra_Dry.jpg`,
                    alt: "A bottle of Prosecco",
                },
                blurb:
                    "For passed exams, failed exams and Wednesdays. The only position in this bundle that pays a liquid dividend.",
                href: amz("prosecco extra dry"),
            },
            {
                name: "Pilates Princess Mat",
                img: {
                    src: `${WM}/5/50/Yoga_mat_and_water_bottle_in_a_living_room.jpg/500px-Yoga_mat_and_water_bottle_in_a_living_room.jpg`,
                    alt: "A yoga mat rolled out in a living room",
                },
                blurb:
                    "Where the 'movement is my meditation' LinkedIn posts are produced. Returns arrive as core strength and content.",
                href: amz("yogamatte rutschfest"),
            },
        ],
    },
];

/** CC-licensed Wikimedia images that legally require attribution. */
const CREDITS: { label: string; file: string; by: string; lic: string }[] = [
    { label: "vest", file: "Zwarte_bodywarmer_van_merk_Spex,_objectnr_86987.JPG", by: "Spex", lic: "CC BY-SA 3.0" },
    { label: "ketchup", file: "Ketchup_Deppenleerzeichen.jpg", by: "H005", lic: "CC BY-SA 3.0" },
    { label: "gold Casio", file: "Casio_Data_Bank_watch_in_gold_(edited).jpg", by: "cisnky", lic: "CC BY 2.0" },
    { label: "AirPods", file: "AirPods_(cropped).jpg", by: "Maurizio Pesce", lic: "CC BY 2.0" },
    { label: "cup noodles", file: "Nissin_Cup_Noodle_(Original)_-_01.jpg", by: "Quercus acuta", lic: "CC BY-SA 4.0" },
    { label: "moka pot", file: "Moka_pot_components_assembled.png", by: "Shisma", lic: "CC BY-SA 4.0" },
    { label: "suit", file: "Shooting_de_Mannequin_!_(8353507873).jpg", by: "Grand Parc Bordeaux", lic: "CC BY 2.0" },
    { label: "earplugs", file: "A_pair_of_orange_foam_earplugs.jpg", by: "Sokolikmawwer0", lic: "CC BY-SA 3.0" },
    { label: "powerbank", file: "Portable_power_bank.jpg", by: "Santeri Viinamäki", lic: "CC BY-SA 4.0" },
    { label: "Kånken", file: "Fjällräven_Kånken_backpacks.jpg", by: "Lisa Risager", lic: "CC BY-SA 2.0" },
    { label: "Apple Pencil", file: "Apple_Pencil_-_iPad_Pro_(40144499833).jpg", by: "Tony Webster", lic: "CC BY-SA 2.0" },
    { label: "highlighters", file: "STABILO_BOSS_Original1.jpg", by: "Schwan-STABILO", lic: "CC BY-SA 3.0" },
    { label: "claw clips", file: "3_big_claw_clips_for_thick_long_hair.png", by: "Hellomarina", lic: "CC BY-SA 4.0" },
    { label: "matcha", file: "Matcha_(5026245674).jpg", by: "rumpleteaser", lic: "CC BY 2.0" },
    { label: "yoga mat", file: "Yoga_mat_and_water_bottle_in_a_living_room.jpg", by: "Femivaco", lic: "CC BY 4.0" },
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

                {/* Photo credits - required for the CC-licensed Wikimedia images */}
                <section className="rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                    <p className="caps-label text-[10px] text-muted-light">Photo credits</p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-light">
                        Product photos via Wikimedia Commons:{" "}
                        {CREDITS.map((c, i) => (
                            <span key={c.file}>
                                <a
                                    className="underline underline-offset-2"
                                    href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(c.file)}`}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    {c.label} by {c.by} ({c.lic})
                                </a>
                                {i < CREDITS.length - 1 ? ", " : ". "}
                            </span>
                        ))}
                        Birkin bag, TI-30, cigarette tin, noodles, shaker and Prosecco
                        are public domain / CC0. Pictures are illustrative - the linked
                        offer may look better. Or worse.
                    </p>
                </section>
            </div>

            <AdRail note="Trading Platform" />
        </div>
    );
}

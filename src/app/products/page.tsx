import type { Metadata } from "next";
import AdRail from "@/components/AdRail";
import { amz } from "@/lib/affiliate";
import AffiliateLabel from "@/components/AffiliateLabel";

export const metadata: Metadata = {
    title: "Bro Shop",
    description:
        "The FinanceBro shop - eight curated bundles: from the Starter Pack and BWL Marie to the After-Exam Party Kit.",
};

/**
 * The Bro Shop (rebuilt 2026-08-29, images upgraded same day, four more
 * bundles 2026-09-05, After-Exam Party Kit 2026-09-06): eight joke bundles
 * in a two-column card grid, flanked by the sticky desktop ad rails
 * (AdRail). Order: Starter Pack, BWL Marie, Undercover Broke Student, then
 * the four 2026-09-05 bundles (Excel Monkey, Doomsday Bunker, LinkedIn
 * Thought Leader, Boring Index Fund - the "would actually buy" bundle, keep
 * it earnest), then the After-Exam Party Kit (Nico's picks: an Aperol tower
 * = beer tower, the mortar-shaped beer opener, plus more drinking gear).
 * The Birkin card shows a gold crocodile-leather clutch since 2026-09-06
 * (Nico: croc leather, and only imagery we hold rights to). The vest blurb is original finance-bro canon: do not touch it (card renamed
 * 2026-09-06 - it links an ellesse vest, so it may not carry the Patagonia mark). (Business School Cigarettes and the Hela Ketchup were removed
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
                    alt: "A gold crocodile-leather clutch bag",
                },
                blurb:
                    "Something small for when you forgot her birthday. Again. The waiting list is longer than your DCF model and twice as fictional.",
                soldOut: "SOLD OUT - restock after the next bonus round",
            },
            {
                name: "The Vest",
                img: {
                    src: "/products/vest.jpg",
                    alt: "A black quilted puffer vest",
                },
                blurb:
                    "For the true business students who don't just study economics but have made the lifestyle their own. Usually comes with an internship arranged by Daddy and a superiority complex.",
                href: amz("ellesse weste herren"),
                note: "The famous outdoor brand's affiliate desk has not returned our calls - this link is an ellesse vest. Same vest energy, fraction of the Daddy.",
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
        name: "The Excel Monkey Survival Kit",
        emoji: "🐒",
        tagline: "Alt+Tab is not a shortcut. It is a personality.",
        chips: ["4 positions", "risk: carpal tunnel", "yield: 0.3 s per VLOOKUP"],
        products: [
            {
                name: "Mechanical Keyboard, Clicky",
                img: {
                    src: "/products/keyboard.jpg",
                    alt: "A mechanical keyboard with blue keycaps and loose key switches",
                },
                blurb:
                    "Every keystroke sounds like a decision. The library will hate you, the model will be done by midnight, and F2 has never felt this important.",
                href: amz("mechanische tastatur"),
            },
            {
                name: "Vertical Mouse, Orthopedic",
                img: {
                    src: "/products/vertical-mouse.jpg",
                    alt: "A black ergonomic vertical computer mouse",
                },
                blurb:
                    "Looks like a small shark, feels like a handshake with yourself. Bought after the first wrist twinge, recommended by everyone who ignored theirs.",
                href: amz("vertikale maus ergonomisch"),
            },
            {
                name: "The Second Monitor",
                img: {
                    src: "/products/monitors.jpg",
                    alt: "Two computer monitors side by side with blank screens",
                },
                blurb:
                    "One screen for the model, one for the lecture you are pretending to watch. Doubles productivity, or at least the number of open tabs.",
                href: amz("monitor 27 zoll"),
            },
            {
                name: "Blue-Light Glasses",
                img: {
                    src: "/products/glasses.jpg",
                    alt: "A pair of black-rimmed glasses",
                },
                blurb:
                    "Non-prescription, purely theatrical. Filters out screen glare and any doubt that you are a serious person now.",
                href: amz("blaulichtfilter brille"),
            },
        ],
    },
    {
        name: "The Exam Week Doomsday Bunker",
        emoji: "🧟",
        tagline: "Fourteen chapters, four days, one plan: none.",
        chips: ["4 positions", "risk: caffeine-adjusted", "maturity: Thursday, 8 AM"],
        products: [
            {
                name: "Energy Drinks, 24-Pack",
                img: {
                    src: "/products/energy-can.jpg",
                    alt: "Cold aluminum drink cans on ice",
                },
                blurb:
                    "Sleep is a fixed cost and you are cutting fixed costs. Twenty-four cans, one exam, roughly the same heart rate as the day the grades come out.",
                href: amz("energy drink 24er pack"),
            },
            {
                name: "Sticky Notes, Industrial Quantity",
                img: {
                    src: "/products/sticky-notes.jpg",
                    alt: "Colorful sticky notes covering a wall",
                },
                blurb:
                    "For the formula wall that turns your room into a crime-scene investigation. Suspect: the lecturer. Motive: § 253 HGB (impairment rules).",
                href: amz("haftnotizen set"),
            },
            {
                name: "Desk Lamp, 3 AM Edition",
                img: {
                    src: "/products/desk-lamp.jpg",
                    alt: "A black articulated desk lamp",
                },
                blurb:
                    "The only light on the whole floor at 3 AM. Bends further than your study plan and, unlike the plan, actually switches on.",
                href: amz("schreibtischlampe led"),
            },
            {
                name: "Post-Exam Coma Mask",
                img: {
                    src: "/products/sleep-mask.jpg",
                    alt: "A gold satin sleep mask",
                },
                blurb:
                    "For the 14-hour recovery position right after the exam. Blocks light, roommates and the question of how part 3b went.",
                href: amz("schlafmaske seide"),
            },
        ],
    },
    {
        name: "The LinkedIn Thought Leader Kit",
        emoji: "🧠",
        tagline: "Agree? Repost. Your network needs to hear this.",
        chips: ["4 positions", "risk: cringe", "engagement: your mom"],
        products: [
            {
                name: "Ring Light, Founder Mode",
                img: {
                    src: "/products/ring-light.jpg",
                    alt: "An LED ring light on a tripod against a blue background",
                },
                blurb:
                    "Turns a dorm room into a studio and a 20-year-old into a 'serial entrepreneur'. The glow you see in every 'I got rejected 47 times' post.",
                href: amz("ringlicht mit stativ"),
            },
            {
                name: "Podcast Microphone",
                img: {
                    src: "/products/microphone.jpg",
                    alt: "A studio condenser microphone with pop filter on a boom arm",
                },
                blurb:
                    "Episode 1: 'Why I left my internship'. Episode 2: never recorded. Sounds expensive enough that nobody asks about the download numbers.",
                href: amz("podcast mikrofon usb"),
            },
            {
                name: "The Ideas Notebook",
                img: {
                    src: "/products/notebook.jpg",
                    alt: "A black leather notebook with a pen",
                },
                blurb:
                    "Contains three startup ideas, two of which are Uber for something. Carried into every lecture, opened in none.",
                href: amz("notizbuch a5 leder"),
            },
            {
                name: "Books You Will Quote, Not Read",
                img: {
                    src: "/products/books.jpg",
                    alt: "A stack of colorful hardcover books",
                },
                blurb:
                    "Habits, Zero to One, something by a Stoic. The summary is on YouTube, the spine goes in the background of every video call.",
                href: amz("bestseller business bücher"),
            },
        ],
    },
    {
        name: "The Boring Index Fund",
        emoji: "📈",
        tagline: "Low fees, no drama. The only bundle here with a real Sharpe ratio.",
        chips: ["4 positions", "risk: none", "expense ratio: 0.07 %"],
        products: [
            {
                name: "Noise-Cancelling Headphones",
                img: {
                    src: "/products/headphones.jpg",
                    alt: "Black over-ear wireless headphones",
                },
                blurb:
                    "Removes the library, the roommate and the guy narrating his own group project. The single best thing money can buy in this shop, no joke attached.",
                href: amz("noise cancelling kopfhörer over ear"),
            },
            {
                name: "E-Reader",
                img: {
                    src: "/products/e-reader.jpg",
                    alt: "An e-reader with a blank screen on a green patterned background",
                },
                blurb:
                    "Battery lasts a semester, weighs less than one textbook, holds all of them. Reading on it feels like paper, buying books on it feels like nothing.",
                href: amz("ebook reader"),
            },
            {
                name: "Insulated Water Bottle",
                img: {
                    src: "/products/water-bottle.jpg",
                    alt: "A blue stainless steel insulated water bottle",
                },
                blurb:
                    "Cold for 24 hours, hot for 12, refilled for free. Pays for itself in about a week of not buying the 3 € library water.",
                href: amz("trinkflasche edelstahl isoliert 1l"),
            },
            {
                name: "A Monstera",
                img: {
                    src: "/products/monstera.jpg",
                    alt: "A Monstera plant in a black pot",
                },
                blurb:
                    "The one position in this shop that compounds. Survives exam season better than you do and makes any room look like someone has their life together.",
                href: amz("monstera pflanze"),
            },
        ],
    },
    {
        name: "The After-Exam Party Kit",
        emoji: "🍾",
        tagline: "Grades are lagging indicators. The party is priced in tonight.",
        chips: ["6 positions", "risk: blackout", "liquidity: 3 liters"],
        products: [
            {
                name: "The Aperol Tower",
                img: {
                    src: "/products/aperol-tower.jpg",
                    alt: "A tall drink dispenser tower filled with an orange drink",
                },
                blurb:
                    "Three liters of Spritz with its own tap, technically a beer tower with an identity crisis. The only tower in this shop with more liquidity than your bank account.",
                href: amz("getränkespender turm 3 liter zapfhahn"),
            },
            {
                name: "Beer Mortar, Heavy Artillery",
                img: {
                    src: "/products/bottle-opener.jpg",
                    alt: "A steel bottle opener next to a bottle cap",
                },
                blurb:
                    "A bottle opener shaped like a mortar that fires the cap across the room. Recoil: none. Casualties: one lampshade per semester. Opens beer, closes exam season.",
                href: amz("bierflaschenöffner mörser"),
                note: "Picture shows the civilian model. The link goes to the actual artillery.",
            },
            {
                name: "Beer Pong, Regulation Set",
                img: {
                    src: "/products/beer-pong.jpg",
                    alt: "Six red plastic cups in a triangle with a white ball above them",
                },
                blurb:
                    "Twenty-two cups, six balls, one table you will owe your flatmate a new one of. The only game where a re-rack is a legitimate risk-management strategy.",
                href: amz("beer pong set becher bälle"),
            },
            {
                name: "Shot Roulette",
                img: {
                    src: "/products/shots.jpg",
                    alt: "Tequila shot glasses with lime and salt on a white background",
                },
                blurb:
                    "Sixteen shot glasses, one wheel, zero expected value. Finally a casino where the house is you and the house always loses. Bring lime and a designated economist.",
                href: amz("shot roulette trinkspiel"),
            },
            {
                name: "Spritz Glasses, Oversized",
                img: {
                    src: "/products/spritz-glass.jpg",
                    alt: "A large wine glass filled with an orange spritz cocktail",
                },
                blurb:
                    "Big enough to make a 4.0 look like a rounding error. Hold one at the right angle and the whole faculty terrace thinks you passed.",
                href: amz("aperol spritz gläser set"),
            },
            {
                name: "Party Speaker, Neighbor-Grade",
                img: {
                    src: "/products/party-speaker.jpg",
                    alt: "A black portable Bluetooth speaker with a carry handle",
                },
                blurb:
                    "Loud enough to get a noise complaint filed before the first tower is empty. Pairs with three phones and one very unfortunate playlist decision at 2 AM.",
                href: amz("bluetooth lautsprecher party"),
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
                    <div className="flex flex-col items-start gap-1.5">
                        {/* § 5a (4) UWG / § 6 DDG: the commercial nature of the link
                            must be recognisable BEFORE the click, per link - a
                            generic sentence in the Impressum is not enough. */}
                        <AffiliateLabel />
                        <a
                            href={p.href}
                            target="_blank"
                            rel="sponsored nofollow noopener"
                            className="inline-flex items-center gap-2 self-start rounded-[9px] border border-brand-border bg-brand-input px-3 py-1.5 text-sm font-extrabold text-brand transition hover:bg-brand-tint"
                        >
                            See the offer on Amazon →
                        </a>
                    </div>
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
                        Eight curated bundles, zero due diligence. Pick the portfolio
                        that matches the person you are pretending to be this semester.
                    </p>
                    {/* Transparency: affiliate links are advertising (§ 5a UWG) */}
                    <p className="mt-3 text-xs leading-relaxed text-muted-light">
                        <span className="caps-label text-[9px] tracking-[.14em]">
                            Transparency · advertising:
                        </span>{" "}
                        every &quot;See the offer on Amazon&quot; button is an affiliate
                        link (Amazon PartnerNet) - buy through one and the site earns a
                        small commission while your price stays exactly the same. As an
                        Amazon Associate, this site earns from qualifying purchases.
                        Product names are jokes, not brand endorsements: the links go
                        to Amazon searches for comparable items.
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

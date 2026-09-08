import type { Metadata } from "next";
import AdRail from "@/components/AdRail";
import { amzProduct } from "@/lib/affiliate";
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
 * = beer tower plus more drinking gear; the mortar-shaped beer opener was
 * dropped 2026-09-08 because no listing earned a rating we would link).
 * The Birkin card shows a real (orange, ostrich) Birkin since 2026-09-07 -
 * the only license-free non-pink Birkin photo around, Wikimedia Commons
 * CC BY-SA 2.0 by Wen-Cheng Liu, cropped; the credit line in the footer is
 * a license condition, keep it. Excel Monkey leads with the glasses and
 * Doomsday with the sleep mask (Nico, 2026-09-07). The vest blurb is original finance-bro canon: do not touch it (card renamed
 * 2026-09-06 - it links an ellesse vest, so it may not carry the Patagonia mark). (Business School Cigarettes and the Hela Ketchup were removed
 * 2026-08-29 per Nico - do not resurrect without asking him.)
 *
 * Images are Adobe Stock photos, licensed on Nico's Adobe account (all
 * free-tier assets, standard license, no attribution required) and committed
 * as ~900px optimized JPEGs under public/products/. Every image was scouted
 * against 5+ candidates and picked by eye for professional shop quality.
 * If a product image ever changes: license via the Adobe connector first,
 * then commit the file - never hotlink. Since 2026-09-07 the order is
 * listing first, photo second: pick the ASIN, then the photo that looks
 * like it, shot on white (see MONEY_PATTERN for why). Photos with a
 * coloured background got their background removed via the Adobe
 * connector (ring light, tower); the sleep mask is the licensed gold
 * photo recoloured to black to match the listing.
 *
 * Three photos are Wikimedia Commons CC BY-SA 4.0 (2026-09-08, Nico wanted
 * the real thing and Stock has no branded cans/speakers/towers): the Red
 * Bull can (Klaas van Buiten, "Red Bull ice.jpg", can cropped out), the
 * JBL PartyBox 710 (TaurusEmerald, background removed) and the beer tower
 * (Pundit, "Beer tower.jpg", background removed, cropped to the column).
 * Their credit lines in the footer are a license condition - keep them, and
 * keep the Birkin one.
 *
 * The calculator is the Casio FX-85MS because that is one of the two
 * models the TUM Chair of Financial Management explicitly names in its
 * calculator policy (non-programmable, no SOLVE/CALC, no graphing):
 * https://www.fa.mgt.tum.de/fm/teaching/calculator-policy/ - the other is
 * the TI-30X IIS.
 *
 * Affiliate links come from src/lib/affiliate.ts (Amazon PartnerNet; the
 * rationale and Nico's tag TODO live there). Since 2026-09-07 each product
 * links one specific amazon.de listing (amzProduct + ASIN), chosen for
 * 4.5+ stars where the category has one, review volume, and the closest
 * look to our photo. Amazon's own product images cannot be used: the
 * Associates policy only allows images served live through the Creators
 * API (no download/re-hosting), and API access needs 10 qualifying sales
 * per 30 days - revisit once the account is there.
 */

type Product = {
    name: string;
    img: { src: string; alt: string };
    blurb: string;
    /** Amazon link (product page, or a search link as fallback) - absent means sold out. */
    href?: string;
    /** Sold-out gag chip instead of a link. */
    soldOut?: string;
    /** Small print under the link. */
    note?: string;
};

type Bundle = {
    name: string;
    emoji: string;
    /** Image-area gradient (from, to) - pastel, one mood per bundle; see MONEY_PATTERN. */
    tint: [string, string];
    /** One-line joke under the bundle title. */
    tagline: string;
    /** Caps chips in the bundle header, portfolio-style. */
    chips: string[];
    products: Product[];
};

const BUNDLES: Bundle[] = [
    {
        name: "The FinanceBro Starter Pack",
        tint: ["#fff3d6", "#e9fbf1"],
        emoji: "💼",
        tagline: "Look the part long before you can price the part.",
        chips: ["6 positions", "risk: daddy-backed", "yield: pure image"],
        products: [
            {
                name: "Birkin Bag",
                img: {
                    src: "/products/birkin.jpg",
                    alt: "An orange ostrich-leather Birkin bag with a silk scarf tied to the handle",
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
                href: amzProduct("B081HJD8VY"),
                note: "The famous outdoor brand's affiliate desk has not returned our calls - this link is an ellesse vest. Same vest energy, fraction of the Daddy.",
            },
            {
                name: "The Intern's Watch",
                img: {
                    src: "/products/watch.jpg",
                    alt: "A gold retro digital wristwatch",
                },
                blurb:
                    "Gold Casio, 30 € all in. Tells the time, stores phone numbers from 1987 and holds its value better than your first portfolio. The MD will respect the irony.",
                href: amzProduct("B002LAS086"),
            },
            {
                name: "AirPods",
                img: {
                    src: "/products/earbuds.jpg",
                    alt: "White wireless earbuds on a white background",
                },
                blurb:
                    "Mandatory equipment for pacing the library stairwell saying 'let's circle back' to nobody. Noise cancellation sold separately from the consequences.",
                href: amzProduct("B0DGHWD7CT"),
            },
            {
                name: "Protein Shaker",
                img: {
                    src: "/products/shaker.jpg",
                    alt: "A protein shaker bottle filled with shake",
                },
                blurb:
                    "For the 6 AM gym-before-market-open routine you commit to every Sunday evening. Holds 800 ml of whey and an unlimited amount of ambition.",
                href: amzProduct("B0CN16Y9S5"),
            },
            {
                name: "The Exam-Legal Calculator",
                img: {
                    src: "/products/calculator.jpg",
                    alt: "A black scientific calculator on a white background",
                },
                blurb:
                    "Casio FX-85MS - one of the two models the TUM finance chair explicitly allows. No SOLVE key, no graphs, no memory of your last attempt. The only Bloomberg terminal the exam hall lets in.",
                href: amzProduct("B000120516"),
                note: "Exam-legal per the chair's calculator policy; check your own course's rules before you rely on it.",
            },
        ],
    },
    {
        name: "BWL Marie",
        tint: ["#ffe4ef", "#f3e8ff"],
        emoji: "🎀",
        tagline:
            "For the business girlie whose semester runs on matcha, pastel and immaculate vibes.",
        chips: ["7 positions", "risk: aesthetic", "dividend: content"],
        products: [
            {
                name: "The Kånken",
                img: {
                    src: "/products/backpack.jpg",
                    alt: "A navy blue backpack with a brown leather bottom",
                },
                blurb:
                    "One backpack, four colorways, every lecture hall in Munich. Contains one iPad, zero printed readings and a small pharmacy of lip balm.",
                href: amzProduct("B002P01O8A"),
            },
            {
                name: "iPad + Pencil Setup",
                img: {
                    src: "/products/ipad-pencil.jpg",
                    alt: "A tablet with a white stylus pen beside it on a white background",
                },
                blurb:
                    "For lecture notes so beautifully color-coded they never get read twice. The handwriting-to-text feature has seen things.",
                href: amzProduct("B0DZ769BMS"),
                note: "Amazon sells no iPad-plus-Pencil bundle, so the link is the iPad; the Pencil sits in 'frequently bought together', right where your budget planned it.",
            },
            {
                name: "Pastel Highlighter Set",
                img: {
                    src: "/products/highlighters.jpg",
                    alt: "Pastel highlighters in a neat row",
                },
                blurb:
                    "The difference between studying and manifesting a 1.3. Sixty percent of every page highlighted, so nothing important gets missed. Or found.",
                href: amzProduct("B081TND2WL"),
            },
            {
                name: "Claw Clip, Load-Bearing",
                img: {
                    src: "/products/claw-clip.jpg",
                    alt: "A large matte black claw clip on a white background",
                },
                blurb:
                    "Structural engineering for the messy bun. Holds more together than the group project ever did.",
                href: amzProduct("B0B7VX7NH3"),
            },
            {
                name: "Matcha Starter Set",
                img: {
                    src: "/products/matcha.jpg",
                    alt: "A bowl of matcha with a bamboo whisk",
                },
                blurb:
                    "Front-run the Munich Matcha Alert and whisk it yourself. 9 € a cup on Maximilianstraße, 0.60 € at your desk - an arbitrage even Econ 1 can price.",
                href: amzProduct("B09681S2X6"),
            },
            {
                name: "Emergency Champagne",
                img: {
                    src: "/products/champagne.jpg",
                    alt: "A dark champagne bottle on a white background",
                },
                blurb:
                    "Dom Pérignon, vintage. For passed exams, failed exams and Wednesdays. The only position in this bundle that pays a liquid dividend - and the only one Daddy audits.",
                href: amzProduct("B0BT7W5T9V"),
            },
            {
                name: "Pilates Princess Mat",
                img: {
                    src: "/products/yoga-mat.jpg",
                    alt: "A black rolled yoga mat",
                },
                blurb:
                    "Black, because pink photographs badly at 6 AM. Where the 'movement is my meditation' LinkedIn posts are produced. Returns arrive as core strength and content.",
                href: amzProduct("B0CJJNSM9V"),
            },
        ],
    },
    {
        name: "The Undercover Broke Student",
        tint: ["#f1f5f9", "#e9fbf1"],
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
                href: amzProduct("B07MVNZJTQ"),
            },
            {
                name: "Cup Noodles, To Go",
                img: {
                    src: "/products/cup-noodles.jpg",
                    alt: "A fork lifting noodles out of an instant noodle cup",
                },
                blurb:
                    "Same asset class as the position above. That is not diversification - but at 1 € a cup, nobody is auditing you.",
                href: amzProduct("B084W7ZJ7N"),
            },
            {
                name: "Espresso Machine (Value Edition)",
                img: {
                    src: "/products/moka.jpg",
                    alt: "A black moka pot on a white background",
                },
                blurb:
                    "Does what the campus coffee subscription does at 0.09 € a shot. The single highest-ROI machine ever admitted to a shared kitchen.",
                href: amzProduct("B06ZYYDGYN"),
            },
            {
                name: "The 89 € Interview Suit",
                img: {
                    src: "/products/suit.jpg",
                    alt: "A dark suit with white shirt and tie on an invisible mannequin",
                },
                blurb:
                    "Looks like 800 € on Zoom, feels like 89 € in person. Schedule accordingly: first rounds are always remote.",
                href: amzProduct("B085SQWGQW"),
            },
            {
                name: "Library-Grade Earplugs",
                img: {
                    src: "/products/earplugs.jpg",
                    alt: "Colorful foam earplugs on a white background",
                },
                blurb:
                    "Blocks out the guy who types like he is settling a personal score with his keyboard. 35 dB of pure alpha for 2 €.",
                href: amzProduct("B0DCNWGPHM"),
            },
            {
                name: "20,000 mAh Powerbank",
                img: {
                    src: "/products/powerbank.jpg",
                    alt: "A black power bank",
                },
                blurb:
                    "The only outlets in the library are guarded like board seats. This keeps the laptop alive through exam season and the denial phase after.",
                href: amzProduct("B0DCYR5VNR"),
            },
        ],
    },
    {
        name: "The Excel Monkey Survival Kit",
        tint: ["#e6f7ee", "#d9f2ff"],
        emoji: "🐒",
        tagline: "Alt+Tab is not a shortcut. It is a personality.",
        chips: ["4 positions", "risk: carpal tunnel", "yield: 0.3 s per VLOOKUP"],
        products: [
            {
                name: "Blue-Light Glasses",
                img: {
                    src: "/products/glasses.jpg",
                    alt: "A pair of black-rimmed glasses",
                },
                blurb:
                    "Non-prescription, purely theatrical. Filters out screen glare and any doubt that you are a serious person now.",
                href: amzProduct("B08M3W12PY"),
            },
            {
                name: "Mechanical Keyboard, Clicky",
                img: {
                    src: "/products/keyboard.jpg",
                    alt: "A black computer keyboard",
                },
                blurb:
                    "Every keystroke sounds like a decision. The library will hate you, the model will be done by midnight, and F2 has never felt this important.",
                href: amzProduct("B07W5JK221"),
            },
            {
                name: "Vertical Mouse, Orthopedic",
                img: {
                    src: "/products/vertical-mouse.jpg",
                    alt: "A black ergonomic vertical computer mouse",
                },
                blurb:
                    "Looks like a small shark, feels like a handshake with yourself. Bought after the first wrist twinge, recommended by everyone who ignored theirs.",
                href: amzProduct("B07W4DGC27"),
            },
            {
                name: "The Second Monitor",
                img: {
                    src: "/products/monitors.jpg",
                    alt: "Two computer monitors side by side with blank screens",
                },
                blurb:
                    "One screen for the model, one for the lecture you are pretending to watch. Doubles productivity, or at least the number of open tabs.",
                href: amzProduct("B0DJTDVCVT"),
            },
        ],
    },
    {
        name: "The Exam Week Doomsday Bunker",
        tint: ["#ffe8d6", "#fff3d6"],
        emoji: "🧟",
        tagline: "Fourteen chapters, four days, one plan: none.",
        chips: ["4 positions", "risk: caffeine-adjusted", "maturity: Thursday, 8 AM"],
        products: [
            {
                name: "Post-Exam Coma Mask",
                img: {
                    src: "/products/sleep-mask.jpg",
                    alt: "A black satin sleep mask",
                },
                blurb:
                    "For the 14-hour recovery position right after the exam. Blocks light, roommates and the question of how part 3b went.",
                href: amzProduct("B07SSX8FTZ"),
            },
            {
                name: "Energy Drinks, 24-Pack",
                img: {
                    src: "/products/energy-can.jpg",
                    alt: "A Red Bull energy drink can",
                },
                blurb:
                    "Sleep is a fixed cost and you are cutting fixed costs. Twenty-four cans, one exam, roughly the same heart rate as the day the grades come out.",
                href: amzProduct("B01G7F3UGC"),
            },
            {
                name: "Sticky Notes, Industrial Quantity",
                img: {
                    src: "/products/sticky-notes.jpg",
                    alt: "Colorful sticky notes scattered on a white surface",
                },
                blurb:
                    "For the formula wall that turns your room into a crime-scene investigation. Suspect: the lecturer. Motive: § 253 HGB (impairment rules).",
                href: amzProduct("B0DL67FF7T"),
            },
            {
                name: "Desk Lamp, 3 AM Edition",
                img: {
                    src: "/products/desk-lamp.jpg",
                    alt: "A black articulated desk lamp",
                },
                blurb:
                    "The only light on the whole floor at 3 AM. Bends further than your study plan and, unlike the plan, actually switches on.",
                href: amzProduct("B0DXZ6HR1C"),
            },
        ],
    },
    {
        name: "The LinkedIn Thought Leader Kit",
        tint: ["#dbeafe", "#eef2ff"],
        emoji: "🧠",
        tagline: "Agree? Repost. Your network needs to hear this.",
        chips: ["4 positions", "risk: cringe", "engagement: your mom"],
        products: [
            {
                name: "Ring Light, Founder Mode",
                img: {
                    src: "/products/ring-light.jpg",
                    alt: "An LED ring light on a tripod",
                },
                blurb:
                    "Turns a dorm room into a studio and a 20-year-old into a 'serial entrepreneur'. The glow you see in every 'I got rejected 47 times' post.",
                href: amzProduct("B01LXDNNBW"),
            },
            {
                name: "Podcast Microphone",
                img: {
                    src: "/products/microphone.jpg",
                    alt: "A studio condenser microphone with pop filter on a boom arm",
                },
                blurb:
                    "Episode 1: 'Why I left my internship'. Episode 2: never recorded. Sounds expensive enough that nobody asks about the download numbers.",
                href: amzProduct("B0CCVBQRFX"),
            },
            {
                name: "The Ideas Notebook",
                img: {
                    src: "/products/notebook.jpg",
                    alt: "A black leather notebook with a pen",
                },
                blurb:
                    "Contains three startup ideas, two of which are Uber for something. Carried into every lecture, opened in none.",
                href: amzProduct("B07J3KHQ9B"),
            },
            {
                name: "Books You Will Quote, Not Read",
                img: {
                    src: "/products/books.jpg",
                    alt: "A stack of colorful hardcover books",
                },
                blurb:
                    "Habits, Zero to One, something by a Stoic. The summary is on YouTube, the spine goes in the background of every video call.",
                href: amzProduct("1847941834"),
            },
        ],
    },
    {
        name: "The Boring Index Fund",
        tint: ["#e9fbf1", "#f0fdf4"],
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
                href: amzProduct("B0BTDX26B2"),
            },
            {
                name: "E-Reader",
                img: {
                    src: "/products/e-reader.jpg",
                    alt: "An e-reader with a blank screen",
                },
                blurb:
                    "Battery lasts a semester, weighs less than one textbook, holds all of them. Reading on it feels like paper, buying books on it feels like nothing.",
                href: amzProduct("B0CP31T5M6"),
            },
            {
                name: "Insulated Water Bottle",
                img: {
                    src: "/products/water-bottle.jpg",
                    alt: "A blue stainless steel insulated water bottle",
                },
                blurb:
                    "Cold for 24 hours, hot for 12, refilled for free. Pays for itself in about a week of not buying the 3 € library water.",
                href: amzProduct("B0DQY4LCPS"),
            },
            {
                name: "A Monstera",
                img: {
                    src: "/products/monstera.jpg",
                    alt: "A Monstera plant in a black pot",
                },
                blurb:
                    "The one position in this shop that compounds. Survives exam season better than you do and makes any room look like someone has their life together.",
                href: amzProduct("B0924W91HF"),
            },
        ],
    },
    {
        name: "The After-Exam Party Kit",
        tint: ["#ffe1d0", "#fff0b8"],
        emoji: "🍾",
        tagline: "Grades are lagging indicators. The party is priced in tonight.",
        chips: ["5 positions", "risk: blackout", "liquidity: 5 liters"],
        products: [
            {
                name: "The Aperol Tower",
                img: {
                    src: "/products/aperol-tower.jpg",
                    alt: "A tall slim beer tower column with a tap, filled with an orange drink",
                },
                blurb:
                    "Five liters of Spritz in one slim column with its own tap - technically a beer tower with an identity crisis. The only tower in this shop with more liquidity than your bank account.",
                href: amzProduct("B0BFBYHYC5"),
            },
            {
                name: "Beer Pong Set",
                img: {
                    src: "/products/beer-pong.jpg",
                    alt: "Two red plastic party cups",
                },
                blurb:
                    "Fifty cups, twelve balls, one table you will owe your flatmate a new one of. The only game where a re-rack is a legitimate risk-management strategy.",
                href: amzProduct("B0CKZ3L9LT"),
            },
            {
                name: "Shot Roulette",
                img: {
                    src: "/products/shots.jpg",
                    alt: "Tequila shot glasses with lime and salt on a white background",
                },
                blurb:
                    "Sixteen shot glasses, one wheel, zero expected value. Finally a casino where the house is you and the house always loses. Bring lime and a designated economist.",
                href: amzProduct("B001JSX7KW"),
            },
            {
                name: "Spritz Glasses, Oversized",
                img: {
                    src: "/products/spritz-glass.jpg",
                    alt: "A large wine glass filled with an orange spritz cocktail",
                },
                blurb:
                    "Big enough to make a 4.0 look like a rounding error. Hold one at the right angle and the whole faculty terrace thinks you passed.",
                href: amzProduct("B0D25SRRHV"),
            },
            {
                name: "Party Speaker, Neighbor-Grade",
                img: {
                    src: "/products/party-speaker.jpg",
                    alt: "A tall black JBL party speaker with glowing orange light rings",
                },
                blurb:
                    "JBL PartyBox: loud enough to get a noise complaint filed before the first tower is empty. Pairs with three phones and one very unfortunate playlist decision at 2 AM.",
                href: amzProduct("B08HBG3M7M"),
            },
        ],
    },
];

/**
 * Image-area background (Nico, 2026-09-07: "the white boxes are boring"). A
 * tiled SVG of faint $ / € / % glyphs plus a 💸 and a 📈, laid over the
 * bundle's pastel gradient. Chosen from five candidates (stripes, studio
 * spotlight, emoji confetti, mint radial, this) by screenshot.
 *
 * Until 2026-09-08 the photo was laid over it with `mix-blend-mode:
 * multiply`, which made the glyphs show through the product itself - not
 * what Nico wanted ("put it in the background"). Now the photo sits in a
 * plain white tile on top of the pattern, so the pattern frames the product
 * instead of tattooing it. Photos should still be shot on white so the tile
 * edge is invisible.
 */
const MONEY_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>" +
        "<g font-family='ui-sans-serif,system-ui' font-weight='800' fill='#1c6b45' fill-opacity='.13'>" +
        "<text x='8' y='30' font-size='22' transform='rotate(-18 8 30)'>$</text>" +
        "<text x='70' y='40' font-size='16' transform='rotate(12 70 40)'>%</text>" +
        "<text x='30' y='90' font-size='18' transform='rotate(8 30 90)'>€</text>" +
        "<text x='84' y='100' font-size='24' transform='rotate(-10 84 100)'>$</text></g>" +
        "<g font-size='14' fill-opacity='.4'><text x='50' y='70'>💸</text><text x='100' y='20'>📈</text></g></svg>"
)}")`;

function ProductCard({ p, tint }: { p: Product; tint: [string, string] }) {
    return (
        <div className="flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-surface shadow-[0_1px_2px_rgba(15,33,55,.05)]">
            <div
                className="flex h-56 flex-none items-center justify-center border-b border-hairline-soft px-4 py-4"
                style={{
                    backgroundColor: tint[0],
                    backgroundImage: `${MONEY_PATTERN}, linear-gradient(135deg, ${tint[0]} 0%, ${tint[1]} 100%)`,
                }}
            >
                <div className="flex h-full w-[68%] items-center justify-center rounded-[12px] bg-white p-3 shadow-[0_2px_8px_rgba(15,33,55,.14)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={p.img.src}
                        alt={p.img.alt}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
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
                        Product names are jokes, not brand endorsements: each link goes
                        to one specific Amazon listing we picked for it.
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
                                <ProductCard key={p.name} p={p} tint={bundle.tint} />
                            ))}
                        </div>
                    </section>
                ))}

                {/* Photo note - Adobe Stock standard license (no attribution owed)
                    plus the four CC BY-SA photos, which need these credit lines. */}
                <p className="text-center text-[11px] leading-relaxed text-muted-light">
                    Product photos licensed via Adobe Stock. Pictures are
                    illustrative - the linked offer may look better. Or worse.
                    Wikimedia Commons photos, all CC BY-SA, cropped or
                    background removed: Birkin by{" "}
                    <a
                        href="https://commons.wikimedia.org/wiki/File:Hermes_Ostrich_Birkin_Bag.jpg"
                        target="_blank"
                        rel="noopener"
                        className="underline"
                    >
                        Wen-Cheng Liu
                    </a>{" "}
                    (2.0), Red Bull can by{" "}
                    <a
                        href="https://commons.wikimedia.org/wiki/File:Red_Bull_ice.jpg"
                        target="_blank"
                        rel="noopener"
                        className="underline"
                    >
                        Klaas van Buiten
                    </a>{" "}
                    (4.0), JBL PartyBox by{" "}
                    <a
                        href="https://commons.wikimedia.org/wiki/File:JBL_PartyBox_710.jpg"
                        target="_blank"
                        rel="noopener"
                        className="underline"
                    >
                        TaurusEmerald
                    </a>{" "}
                    (4.0), beer tower by{" "}
                    <a
                        href="https://commons.wikimedia.org/wiki/File:Beer_tower.jpg"
                        target="_blank"
                        rel="noopener"
                        className="underline"
                    >
                        Pundit
                    </a>{" "}
                    (4.0).
                </p>
            </div>

            <AdRail note="Trading Platform" />
        </div>
    );
}

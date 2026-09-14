import type { Metadata } from "next";
import Link from "next/link";
import { FINANCE_BRO_FAQ, FINANCE_BRO_GLOSSARY, FINANCE_BRO_PATH } from "@/content/finance-bro";
import { SITE_URL, pageMeta } from "@/lib/seo";

/**
 * `/what-is-a-finance-bro` - the definition page (2026-09-14, per Nico:
 * "a funny description of what a Finance Bro is, as a subpage, for SEO").
 * A field guide, not a landing page: one long article with real headings
 * (search engines want the structure, students want the jokes), the two
 * sibling archetypes the shop already sells to (BWL Marie) and argues with
 * (Jura Justus), an FAQ block that doubles as `FAQPage` structured data, and
 * a CTA into the trainer. Linked from the footer and the sitemap only.
 *
 * Photos: both CC0 (public domain), so no attribution is owed - the credit
 * line at the end is courtesy. `finance-bro-on-the-phone.jpg` is a Burst
 * (Shopify) photo via StockSnap - a model-released stock shoot, so the man
 * on the phone agreed to be a stock businessman; `finance-bro-watch.jpg` is
 * a Wikimedia Commons CC0 photo (via rawpixel) with no face in it. We do NOT
 * host a photo of a real creator: a TikTok upload is consent to be on
 * TikTok, not to be our page header (§ 22 KUG). The Swiss Chris is linked as
 * field research instead - a link needs no licence.
 *
 * TUM stays out of this page entirely (metadata and body) - the smoke test
 * asserts the metadata half.
 */

export const metadata: Metadata = pageMeta({
    title: "What is a Finance Bro? The definitive field guide",
    description:
        "Finance bro, defined: the Patagonia vest, the 'let's circle back', the 5 a.m. LinkedIn post, the Excel shortcuts as personality. A field guide to the finance bro, BWL Marie and Jura Justus - with the exam trainer that produces them.",
    path: FINANCE_BRO_PATH,
    ogTitle: "What is a Finance Bro? · FinanceBro",
});

const URL = `${SITE_URL}${FINANCE_BRO_PATH}`;

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Article",
            "@id": `${URL}#article`,
            headline: "What is a Finance Bro? The definitive field guide",
            description:
                "A humorous but complete definition of the finance bro: habitat, uniform, vocabulary, diet, life cycle, and the two neighboring species, BWL Marie and Jura Justus.",
            url: URL,
            inLanguage: "en",
            image: `${SITE_URL}/bro/finance-bro-on-the-phone.jpg`,
            author: { "@id": `${SITE_URL}/#org` },
            publisher: { "@id": `${SITE_URL}/#org` },
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: {
                "@type": "DefinedTerm",
                name: "Finance bro",
                description:
                    "A young man (or aspiring one) in or adjacent to finance whose personality is a mix of Excel shortcuts, gym, protein, LinkedIn and the phrase 'let's circle back'.",
            },
        },
        {
            "@type": "FAQPage",
            "@id": `${URL}#faq`,
            mainEntity: FINANCE_BRO_FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
        },
    ],
};

const card = "rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]";
const h2 = "text-lg font-extrabold tracking-[-0.02em] text-ink";
const body = "mt-2 text-sm leading-relaxed text-muted";
const link = "font-bold text-brand underline underline-offset-2";

export default function FinanceBroPage() {
    return (
        <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
            <header>
                <p className="caps-label text-[10px] text-muted-light">Field guide · Species no. 1 of 3</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">
                    What is a Finance Bro? A field guide to the most confident man in the room
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                    <strong className="text-ink">Finance bro</strong> (noun, <em>Homo economicus vestitus</em>): a
                    young man, or a man who still describes himself as young, who works in finance, wants
                    to work in finance, or has once opened a spreadsheet near someone who works in
                    finance. Recognizable by the quarter-zip, the 5 a.m. alarm he tells you about, and
                    the way he says &quot;let&apos;s circle back&quot; to a question about where to eat
                    lunch. He is not a villain. He is a lifestyle with a LinkedIn account. This page
                    explains him so you can spot one, avoid one, or, using the trainer below, become one.
                </p>
                <figure className="mt-4 overflow-hidden rounded-[14px] border border-hairline bg-surface">
                    <img
                        src="/bro/finance-bro-on-the-phone.jpg"
                        alt="A young man in a navy suit and checked shirt taking a phone call in front of a brick wall"
                        width={960}
                        height={640}
                        className="aspect-[3/2] w-full object-cover"
                    />
                    <figcaption className="px-4 py-2 text-[11px] leading-relaxed text-muted">
                        A finance bro in his natural habitat: outside, on the phone, saying &quot;yeah,
                        no, absolutely&quot; to someone who has not asked a question. Stock photo, model
                        released, CC0.
                    </figcaption>
                </figure>
            </header>

            <section className={card}>
                <h2 className={h2}>The definition, in three sentences</h2>
                <p className={body}>
                    A finance bro is what happens when a business degree, a gym membership and a group
                    chat called &quot;Deal Team&quot; are combined at high pressure. He measures his day
                    in coffees (three), his week in &quot;reps&quot; (both kinds), and his life in the
                    distance between him and a bonus he has never actually received. The defining trait
                    is not the money - most finance bros are students with an overdraft - it is the
                    unshakeable belief that the money is on the way, and that it is on the way
                    <em> because of him</em>.
                </p>
            </section>

            <section className={card}>
                <h2 className={h2}>Habitat</h2>
                <p className={body}>
                    The finance bro is found in three places: the library at 7 a.m. (photographed, posted,
                    then left at 7:40), the gym at 6 a.m. (photographed, posted, actually used) and the
                    &quot;networking event&quot;, which is a bar with name tags. In Munich he migrates
                    along the U6 between the lecture hall and a rooftop bar with a two-item dress code.
                    In London he says he lives &quot;in Canary Wharf&quot; the way other people say they
                    live in a monastery. In Frankfurt he does not live at all; he commutes. In Zurich he
                    calls it &quot;the Swiss model&quot; and refuses to explain further.
                </p>
                <p className={body}>
                    He is territorial about one seat: the aisle seat on the 6:12 train, where his laptop
                    can be seen by the maximum number of strangers. The laptop shows an Excel sheet. The
                    Excel sheet shows a chart. The chart goes up. That is all you are meant to know.
                </p>
            </section>

            <section className={card}>
                <h2 className={h2}>The uniform</h2>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-muted">
                    <li>
                        <strong className="text-ink">The vest.</strong> A fleece gilet, ideally with a
                        small embroidered logo of a company that has already laid him off. Worn indoors
                        because the office is &quot;freezing&quot;, worn outdoors because it is
                        &quot;actually really warm&quot;. Its purpose is to say &quot;I could be wearing a
                        suit, but I am busy.&quot;
                    </li>
                    <li>
                        <strong className="text-ink">The quarter-zip.</strong> The vest for people not
                        yet allowed to have the vest. Navy. Always navy. A grey one means he has been
                        promoted or is in mourning, and he will not tell you which.
                    </li>
                    <li>
                        <strong className="text-ink">The watch.</strong> Bought with the first bonus, or
                        with a loan that is described as a bonus. Its face is larger than his
                        contribution to the group project, and it is checked every time someone else
                        starts talking.
                    </li>
                    <li>
                        <strong className="text-ink">The shoes.</strong> Loafers without socks, which he
                        calls &quot;a look&quot; and his podiatrist calls &quot;a referral&quot;.
                    </li>
                    <li>
                        <strong className="text-ink">The haircut.</strong> Short sides, long faith in
                        himself.
                    </li>
                </ul>
                <figure className="mt-4 overflow-hidden rounded-[14px] border border-hairline">
                    <img
                        src="/bro/finance-bro-watch.jpg"
                        alt="Close-up of a man in a dark suit adjusting a cufflink, with a gold watch on his wrist"
                        width={1024}
                        height={683}
                        loading="lazy"
                        className="aspect-[3/2] w-full object-cover"
                    />
                    <figcaption className="bg-surface px-4 py-2 text-[11px] leading-relaxed text-muted">
                        The watch, the cufflink, the cuff. Three items, one message: &quot;I have read
                        about compound interest.&quot; CC0.
                    </figcaption>
                </figure>
            </section>

            <section className={card}>
                <h2 className={h2}>Vocabulary</h2>
                <p className={body}>
                    A finance bro does not speak, he &quot;aligns&quot;. Below is enough to survive a
                    conversation with one. Note that every phrase means less than it sounds.
                </p>
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm leading-relaxed text-muted sm:grid-cols-2 sm:items-start">
                    {FINANCE_BRO_GLOSSARY.map((g) => (
                        <div key={g.term}>
                            <dt className="font-bold text-ink">&quot;{g.term}&quot;</dt>
                            <dd>{g.meaning}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className={card}>
                <h2 className={h2}>Diet</h2>
                <p className={body}>
                    Protein, in every form that fits in a shaker. Coffee, black, because milk is a
                    &quot;dependency&quot;. A sad desk salad at 14:30 that he describes as &quot;fuel&quot;.
                    And on Friday, once the &quot;week from hell&quot; (four days) is over, an amount of
                    Aperol that would be a line item on anyone else&apos;s budget. He tracks macros and
                    does not track spending. This is the whole personality, expressed as nutrition.
                </p>
            </section>

            <section className={card}>
                <h2 className={h2}>Mating rituals</h2>
                <p className={body}>
                    The finance bro dates the way he invests: a diversified portfolio, a long-term
                    horizon he does not actually have, and a &quot;pre-date call&quot; that is for
                    logistics only. His opening line is a question about your five-year plan. His
                    second line is his. He will pay for dinner and then explain, unprompted, that he
                    is not paying with money, he is paying with &quot;optionality&quot;. The date ends
                    when his phone lights up with a message from &quot;David (Deal)&quot; and he says
                    the four words no partner wants to hear: &quot;the model needs updating.&quot;
                </p>
            </section>

            <section className={card}>
                <h2 className={h2}>Life cycle</h2>
                <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted">
                    <li>
                        <strong className="text-ink">Larva (semester 1-2).</strong> Buys a calculator, a
                        quarter-zip and the belief that microeconomics will be useful. Two of these
                        are returned.
                    </li>
                    <li>
                        <strong className="text-ink">Pupa (semester 3-4).</strong> First internship.
                        Learns Excel shortcuts and the word &quot;deck&quot;. Starts saying &quot;we&quot;
                        about a company that pays him in experience.
                    </li>
                    <li>
                        <strong className="text-ink">Emergence (semester 5-6).</strong> Gets the vest.
                        Posts &quot;humbled to announce&quot;. Is not humbled. Fails Investment and
                        Finance once and calls it &quot;a drawdown&quot;.
                    </li>
                    <li>
                        <strong className="text-ink">Full finance bro (post-graduation).</strong> Works
                        14-hour days, of which four are lunch. Explains the yield curve at a birthday
                        party. Has a Notion page called &quot;Exit strategy&quot;.
                    </li>
                    <li>
                        <strong className="text-ink">Final form.</strong> Either a private-equity
                        partner or a LinkedIn thought leader with a podcast. Nobody, including him,
                        knows which until it happens.
                    </li>
                </ol>
                <p className={body}>
                    The trainer on this site models the same ladder, in 21 ranks from Pupil to
                    FinanceBro, paid in BroDollars (exchange rate: none). It is{" "}
                    <Link href="/career" className={link}>
                        over here
                    </Link>{" "}
                    and it does not judge. Much.
                </p>
            </section>

            <section className={card}>
                <h2 className={h2}>Neighboring species: BWL Marie</h2>
                <p className={body}>
                    <strong className="text-ink">BWL Marie</strong> is the finance bro&apos;s natural
                    counterpart and, in most group projects, the reason it got submitted. Where he
                    has a vest, she has a system: color-coded notes on an iPad, a pink matcha in a
                    reusable cup, a Kånken that has never once been on the floor, and a calendar
                    with the exam dates entered in week one. By the time he suggests a
                    &quot;quick sync&quot;, she has held it, minuted it and sent the follow-ups. Her lecture notes
                    are a commodity traded across three semesters; the exchange rate is one coffee
                    per PDF, and the market is efficient. Her Instagram has &quot;study with
                    me&quot; content and her grades have the receipts. She and the finance bro are
                    frequently in the same seminar, the same friend group and, briefly, the same
                    situationship - a merger that ends when he calls her planning &quot;a lot&quot;
                    and she calls his &quot;hustle&quot; a schedule she made for him. Her survival
                    kit is in the{" "}
                    <Link href="/products" className={link}>
                        Bro Shop
                    </Link>
                    , in pastel.
                </p>
            </section>

            <section className={card}>
                <h2 className={h2}>Neighboring species: Jura Justus</h2>
                <p className={body}>
                    <strong className="text-ink">Jura Justus</strong> is the law student across the
                    hall. He owns a set of statute books thicker than the finance bro&apos;s entire
                    reading list, a pale-blue shirt in every shade of pale blue, and a family opinion
                    on wine. His catchphrase is &quot;that is, with respect, not quite
                    right&quot;, and he is usually right. He and the finance
                    bro are natural allies (both wear loafers, both describe their fathers as
                    &quot;in business&quot;) and natural enemies (one of them will eventually write
                    the other&apos;s contract, and both know which). Justus thinks the finance bro is
                    a spreadsheet with a haircut. The finance bro thinks Justus is a footnote with
                    a signet ring. They are both about 40 percent right, which in Jura counts as a
                    good grade. He is not covered by this trainer. The trainer covers the people who
                    will one day pay his fees.
                </p>
            </section>

            <section className={card}>
                <h2 className={h2}>Field research</h2>
                <p className={body}>
                    For live footage of the species, the creator{" "}
                    <a
                        href="https://www.instagram.com/the.swiss.chris/"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className={link}
                    >
                        The Swiss Chris
                    </a>{" "}
                    (Instagram and TikTok) plays the finance bro so well that this page could have
                    been his bio: Geneva, private equity, a sweater from a brand you have to
                    pronounce carefully, and dating advice structured as portfolio theory. Watch a few,
                    then come back and see if your Excel shortcuts have improved. They have not. That
                    is what the{" "}
                    <Link href="/career" className={link}>
                        trainer
                    </Link>{" "}
                    is for.
                </p>
            </section>

            <section className={card}>
                <h2 className={h2}>Frequently asked questions</h2>
                <dl className="mt-2 flex flex-col gap-3 text-sm leading-relaxed text-muted">
                    {FINANCE_BRO_FAQ.map((f) => (
                        <div key={f.q}>
                            <dt className="font-bold text-ink">{f.q}</dt>
                            <dd className="mt-0.5">{f.a}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="text-sm leading-relaxed text-muted">
                <h2 className={h2}>How to become one (the honest way)</h2>
                <p className="mt-1.5">
                    The vest is available in the{" "}
                    <Link href="/products" className={link}>
                        Bro Shop
                    </Link>
                    ; the confidence is not. The part that survives the first interview is the
                    arithmetic: NPV, WACC, duration, break-even, elasticities, the Solow steady state.
                    The trainer deals those as exam-style questions with fresh numbers every run, no
                    account, no paywall, and pays you BroDollars for every one you settle.
                </p>
                <p className="mt-3">
                    <Link
                        href="/career"
                        className="inline-flex items-center gap-2 rounded-[9px] border border-brand-border bg-brand-input px-3 py-2.5 text-sm font-extrabold text-brand transition hover:bg-brand-tint"
                    >
                        Start the career →
                    </Link>
                </p>
                <p className="mt-4 text-[11px] leading-relaxed text-muted">
                    Photos: Burst via StockSnap (man on the phone) and Wikimedia Commons via rawpixel
                    (watch), both CC0 public domain. Any resemblance to a real finance bro is
                    statistically unavoidable.
                </p>
            </section>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </article>
    );
}

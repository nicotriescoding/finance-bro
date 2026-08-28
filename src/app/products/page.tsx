import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import { amz } from "@/lib/affiliate";

export const metadata: Metadata = {
    title: "Bro Shop",
    description: "The Finance Bro starter pack - curated lifestyle essentials.",
};

/**
 * The Bro Shop keeps its own catalogue layout (deliberately not the quiz's
 * three-column statement view) - only the visual language is 3a. The Patagonia
 * Vest and Business School Cigarettes blurbs are original finance-bro canon:
 * do not touch them.
 *
 * Affiliate links come from src/lib/affiliate.ts (Amazon PartnerNet; the
 * rationale and Nico's tag TODO live there).
 *
 * Images are hotlinked from Wikimedia Commons (public domain / CC - the CC
 * ones are credited in the photo-credits card at the bottom; keep that card
 * when editing).
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

const PRODUCTS: Product[] = [
    {
        name: "Birkin Bag",
        img: {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Hermes_Birkin-2.jpg/500px-Hermes_Birkin-2.jpg",
            alt: "A pink Hermes Birkin bag",
        },
        blurb:
            "Something small for when you forgot her birthday. Again. The waiting list is longer than your DCF model and twice as fictional.",
        soldOut: "SOLD OUT - restock after the next bonus round",
    },
    {
        name: "Patagonia Vest",
        img: {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Adidas_Helionic_Down_vest.jpg/500px-Adidas_Helionic_Down_vest.jpg",
            alt: "A black puffer vest, worn over a white shirt",
        },
        blurb:
            "For the true business students who don't just study economics but have made the lifestyle their own. Usually comes with an internship arranged by Daddy and a superiority complex.",
        href: amz("ellesse weste herren"),
        note: "Patagonia's affiliate desk has not returned our calls - this link is the ellesse one. Same vest energy, fraction of the Daddy.",
    },
    {
        name: "Business School Cigarettes",
        img: {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Candy_cigarette_display_in_shop.jpg/500px-Candy_cigarette_display_in_shop.jpg",
            alt: "A retro shop display of candy cigarettes",
        },
        blurb:
            "Your easy entry into investing - takes the edge off so you can finally blow bubbles.",
        href: amz("seifenblasen zigaretten"),
        note: "Bubble-blowing fake cigarettes. The only bubble on this site you are allowed to enjoy.",
    },
    {
        name: "Hela Curry Gewürz Ketchup",
        img: {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Ketchup_Deppenleerzeichen.jpg/500px-Ketchup_Deppenleerzeichen.jpg",
            alt: "A bottle of Hela Curry Gewürz Ketchup",
        },
        blurb:
            "The official closing dinner of German middle management. Pairs with currywurst, canteen trays and quarterly numbers that need a little seasoning.",
        href: amz("hela curry gewürz ketchup delikat"),
    },
    {
        name: "TI-30 Calculator",
        img: {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/TI-30_Galaxy_calculator.jpg/500px-TI-30_Galaxy_calculator.jpg",
            alt: "A vintage Texas Instruments TI-30 calculator",
        },
        blurb:
            "The only Bloomberg terminal the exam hall allows. Discounts cash flows, compounds interest, and never once suggests a 0DTE position.",
        href: amz("texas instruments ti-30x plus mathprint"),
    },
    {
        name: "Matcha Starter Set",
        img: {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Chasen-side_PNr%C2%B00498.jpg/500px-Chasen-side_PNr%C2%B00498.jpg",
            alt: "A bamboo matcha whisk",
        },
        blurb:
            "Front-run the Munich Matcha Alert and whisk it yourself. 9 € a cup on Maximilianstraße, 0.60 € at your desk - an arbitrage even Econ 1 can price.",
        href: amz("matcha set schale besen"),
    },
];

export default function ProductsPage() {
    return (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-8 md:grid-cols-3">
            {/* Left column: products */}
            <div className="flex flex-col gap-5 md:col-span-2">
                <h1 className="text-2xl font-extrabold tracking-[-0.02em]">📦 Products</h1>

                {/* Transparency: affiliate links are advertising (§ 5a UWG) */}
                <section className="rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-5">
                    <p className="caps-label text-[10px] text-muted-light">
                        Transparency · advertising
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        The &quot;See the offer&quot; buttons are (or will become){" "}
                        <strong>affiliate links</strong> - that is advertising: buy through
                        one and the site earns a small commission while your price stays
                        exactly the same. As an Amazon partner, this site earns from
                        qualifying purchases.
                    </p>
                </section>

                <section className="flex flex-col gap-4 rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                    <h2 className="border-b border-hairline-soft pb-3 text-xl font-extrabold tracking-[-0.02em]">
                        Finance Bro Starter Pack
                    </h2>

                    {PRODUCTS.map((p, i) => (
                        <div
                            key={p.name}
                            className={`flex items-start gap-4 ${
                                i > 0 ? "border-t border-hairline-soft pt-4" : ""
                            }`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={p.img.src}
                                alt={p.img.alt}
                                loading="lazy"
                                className="h-28 w-28 flex-none rounded-xl border border-hairline-soft bg-chip object-cover"
                            />
                            <div className="min-w-0">
                                <p className="font-extrabold">{p.name}</p>
                                <p className="mb-2 mt-0.5 text-sm leading-relaxed text-muted">
                                    {p.blurb}
                                </p>
                                {p.soldOut ? (
                                    <span className="caps-label inline-flex items-center rounded-full bg-warn-tint px-2.5 py-1 text-[10px] font-extrabold tracking-[.14em] text-warn">
                                        {p.soldOut}
                                    </span>
                                ) : (
                                    <a
                                        href={p.href}
                                        target="_blank"
                                        rel="sponsored nofollow noopener"
                                        className="inline-flex items-center gap-2 text-sm font-extrabold text-brand underline underline-offset-4 transition hover:text-[#175a3a]"
                                    >
                                        See the offer →
                                        <span className="caps-label text-[9px] tracking-[.16em] text-muted-light">
                                            AD
                                        </span>
                                    </a>
                                )}
                                {p.note && (
                                    <p className="mt-1.5 text-[11px] italic leading-relaxed text-muted-light">
                                        {p.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </section>

                {/* Photo credits - required for the CC-licensed Wikimedia images */}
                <section className="rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                    <p className="caps-label text-[10px] text-muted-light">Photo credits</p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-light">
                        Product photos via Wikimedia Commons: vest by{" "}
                        <a
                            className="underline underline-offset-2"
                            href="https://commons.wikimedia.org/wiki/File:Adidas_Helionic_Down_vest.jpg"
                            target="_blank"
                            rel="noopener"
                        >
                            Adenosine Triphosphate (CC BY-SA 4.0)
                        </a>
                        , candy cigarettes by{" "}
                        <a
                            className="underline underline-offset-2"
                            href="https://commons.wikimedia.org/wiki/File:Candy_cigarette_display_in_shop.jpg"
                            target="_blank"
                            rel="noopener"
                        >
                            Craig Pennington (CC BY 2.0)
                        </a>
                        , ketchup by{" "}
                        <a
                            className="underline underline-offset-2"
                            href="https://commons.wikimedia.org/wiki/File:Ketchup_Deppenleerzeichen.jpg"
                            target="_blank"
                            rel="noopener"
                        >
                            H005 (CC BY-SA 3.0)
                        </a>
                        , matcha whisk{" "}
                        <a
                            className="underline underline-offset-2"
                            href="https://commons.wikimedia.org/wiki/File:Chasen-side_PNr%C2%B00498.jpg"
                            target="_blank"
                            rel="noopener"
                        >
                            (CC BY-SA 4.0)
                        </a>
                        . Birkin bag and TI-30 are public domain / CC0. Pictures are
                        illustrative - the linked offer may look better. Or worse.
                    </p>
                </section>
            </div>

            {/* Right column: ads */}
            <aside className="flex flex-col gap-3">
                <h2 className="text-lg font-extrabold tracking-[-0.02em]">
                    💸 This thing has to pay for itself somehow
                </h2>
                <AdSlot variant="feed" note="Finance Newsletter" />
                <AdSlot variant="feed" note="Trading Platform" />
            </aside>
        </div>
    );
}

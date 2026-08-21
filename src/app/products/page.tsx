import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
    title: "Bro Shop",
    description: "The Finance Bro starter pack - curated lifestyle essentials.",
};

/**
 * The Bro Shop keeps its own two-column catalogue layout (deliberately not
 * the quiz's three-column statement view) - only the visual language is 3a.
 * The product copy is original finance-bro canon: do not touch it.
 */
export default function ProductsPage() {
    return (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-8 md:grid-cols-3">
            {/* Left column: products */}
            <div className="flex flex-col gap-5 md:col-span-2">
                <h1 className="text-2xl font-extrabold tracking-[-0.02em]">📦 Products</h1>

                {/* Example category */}
                <section className="flex flex-col gap-4 rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                    <h2 className="border-b border-hairline-soft pb-3 text-xl font-extrabold tracking-[-0.02em]">
                        Finance Bro Starter Pack
                    </h2>

                    {/* Product card */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-28 w-28 flex-none items-center justify-center rounded-xl bg-chip text-5xl">
                            🦺
                        </div>
                        <div>
                            <p className="font-extrabold">Patagonia Vest</p>
                            <p className="mb-2 mt-0.5 text-sm leading-relaxed text-muted">
                                For the true business students who don&apos;t just study economics but
                                have made the lifestyle their own. Usually comes with an internship
                                arranged by Daddy and a superiority complex.
                            </p>
                            <a
                                href="https://affiliate-link.de"
                                target="_blank"
                                className="text-sm font-extrabold text-brand underline underline-offset-4 transition hover:text-[#175a3a]"
                            >
                                See the offer →
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border-t border-hairline-soft pt-4">
                        <div className="flex h-28 w-28 flex-none items-center justify-center rounded-xl bg-chip text-5xl">
                            🚬
                        </div>
                        <div>
                            <p className="font-extrabold">Business School Cigarettes</p>
                            <p className="mb-2 mt-0.5 text-sm leading-relaxed text-muted">
                                Your easy entry into investing — takes the edge off so you can finally
                                blow bubbles.
                            </p>
                            <a
                                href="https://affiliate-link.de"
                                target="_blank"
                                className="text-sm font-extrabold text-brand underline underline-offset-4 transition hover:text-[#175a3a]"
                            >
                                See the offer →
                            </a>
                        </div>
                    </div>
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

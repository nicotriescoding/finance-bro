
import AdSlot from "@/components/AdSlot";

export default function ProductsPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
            {/* Left column: products */}
            <div className="md:col-span-2 flex flex-col gap-6">
                <h1 className="text-2xl font-bold mb-4">📦 Products</h1>

                {/* Example category */}
                <section className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">Finance Bro Starter Pack</h2>

                    {/* Product card */}
                    <div className="flex gap-4 items-center mb-4">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Product"
                            className="w-32 h-32 object-cover rounded shadow"
                        />
                        <div>
                            <p className="font-medium">Patagonia Vest</p>
                            <p className="text-gray-600 text-sm mb-2">
                                For the true business students who don&apos;t just study economics but
                                have made the lifestyle their own. Usually comes with an internship
                                arranged by Daddy and a superiority complex.
                            </p>
                            <a
                                href="https://affiliate-link.de"
                                target="_blank"
                                className="text-blue-600 underline"
                            >
                                See the offer →
                            </a>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Product"
                            className="w-32 h-32 object-cover rounded shadow"
                        />
                        <div>
                            <p className="font-medium">Business School Cigarettes</p>
                            <p className="text-gray-600 text-sm mb-2">
                                Your easy entry into investing — takes the edge off so you can finally
                                blow bubbles.
                            </p>
                            <a
                                href="https://affiliate-link.de"
                                target="_blank"
                                className="text-blue-600 underline"
                            >
                                See the offer →
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* Right column: ads */}
            <aside className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">💸 This thing has to pay for itself somehow</h2>
                <AdSlot
                    title="Finance Newsletter"
                    imgUrl="https://via.placeholder.com/200x100.png?text=Newsletter"
                    linkUrl="https://example.com"
                />
                <AdSlot
                    title="Trading Platform"
                    imgUrl="https://via.placeholder.com/200x100.png?text=Trading"
                    linkUrl="https://example.com"
                />
            </aside>
        </div>
    );
}

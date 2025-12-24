
import AdSlot from "@/components/AdSlot";

export default function ProductsPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
            {/* Linke Spalte: Produkte */}
            <div className="md:col-span-2 flex flex-col gap-6">
                <h1 className="text-2xl font-bold mb-4">📦 Produkte</h1>

                {/* Beispiel Kategorie */}
                <section className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">BWL-Justus Starterpaket</h2>

                    {/* Produktkarte */}
                    <div className="flex gap-4 items-center mb-4">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Produkt"
                            className="w-32 h-32 object-cover rounded shadow"
                        />
                        <div>
                            <p className="font-medium">Patagonia Veste</p>
                            <p className="text-gray-600 text-sm mb-2">
                                Perfekt für die wahren Wirtschaftler, die nicht nur wirtschaft studieren, sondern den lifestyle sich zu eigen gemacht haben.
                                Kommt meist in Verbindung mit Praktika von Daddy und superiority complexen.
                            </p>
                            <a
                                href="https://affiliate-link.de"
                                target="_blank"
                                className="text-blue-600 underline"
                            >
                                Zum Angebot →
                            </a>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Produkt"
                            className="w-32 h-32 object-cover rounded shadow"
                        />
                        <div>
                            <p className="font-medium">BWL'er Zigaretten</p>
                            <p className="text-gray-600 text-sm mb-2">
                                Dein leichter Einstieg ins Investieren, damit wird das edge off getaked und du kannst endlich seifen blassen.
                            </p>
                            <a
                                href="https://affiliate-link.de"
                                target="_blank"
                                className="text-blue-600 underline"
                            >
                                Zum Angebot →
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* Rechte Spalte: Werbung */}
            <aside className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">💸 Irgendwie muss sich der Bumms ja finanzieren</h2>
                <AdSlot
                    title="Finanz-Newsletter"
                    imgUrl="https://via.placeholder.com/200x100.png?text=Newsletter"
                    linkUrl="https://example.com"
                />
                <AdSlot
                    title="Trading Plattform"
                    imgUrl="https://via.placeholder.com/200x100.png?text=Trading"
                    linkUrl="https://example.com"
                />
            </aside>
        </div>
    );
}
import type { Subject, SubjectId } from "@/lib/questions/types";

/**
 * Subject + topic taxonomy.
 * Topic ids are stable strings - question banks reference them, and the topic
 * filter in the quiz setup is generated straight from this file. To add a new
 * exam area, add a topic here and tag questions with its id.
 */
export const SUBJECTS: Subject[] = [
    {
        id: "finance",
        label: "Investment & Financial Management",
        short: "Finance",
        emoji: "💸",
        description: "Zinsen, Renten, Anleihen, Bewertung, Kapitalkosten, Portfolio & Optionen.",
        accent: "from-emerald-500 to-teal-600",
        topics: [
            { id: "interest", label: "Zinsrechnung" },
            { id: "annuities", label: "Renten & Annuitäten" },
            { id: "repayment", label: "Tilgungsrechnung" },
            { id: "bonds", label: "Anleihen & Duration" },
            { id: "equity_valuation", label: "Aktienbewertung" },
            { id: "ratios", label: "Kennzahlenanalyse" },
            { id: "investment", label: "Investitionsrechnung" },
            { id: "cost_of_capital", label: "Kapitalkosten & WACC" },
            { id: "portfolio", label: "Portfoliotheorie" },
            { id: "options", label: "Optionen & Derivate" },
            { id: "capital_increase", label: "Kapitalerhöhung" },
        ],
    },
    {
        id: "econ1",
        label: "Economics 1 - Mikroökonomie",
        short: "Econ 1",
        emoji: "📉",
        description: "Angebot & Nachfrage, Elastizitäten, Haushalts- und Produktionstheorie, Marktformen.",
        accent: "from-sky-500 to-blue-600",
        topics: [
            { id: "supply_demand", label: "Angebot & Nachfrage" },
            { id: "elasticity", label: "Elastizitäten" },
            { id: "consumer", label: "Haushaltstheorie" },
            { id: "production_costs", label: "Produktion & Kosten" },
            { id: "market_forms", label: "Marktformen" },
            { id: "welfare", label: "Wohlfahrt & Staatseingriffe" },
        ],
    },
    {
        id: "econ2",
        label: "Economics 2 - Makroökonomie",
        short: "Econ 2",
        emoji: "🏛️",
        description: "VGR, Inflation, Arbeitsmarkt, Geld- und Fiskalpolitik, Außenwirtschaft.",
        accent: "from-indigo-500 to-violet-600",
        topics: [
            { id: "national_accounts", label: "VGR & BIP" },
            { id: "inflation", label: "Inflation & Preisindizes" },
            { id: "labour", label: "Arbeitsmarkt" },
            { id: "monetary", label: "Geldpolitik" },
            { id: "fiscal", label: "Fiskalpolitik & Multiplikator" },
            { id: "open_economy", label: "Außenwirtschaft" },
            { id: "growth", label: "Wachstum" },
        ],
    },
    {
        id: "financial_accounting",
        label: "Financial Accounting",
        short: "Financial Acc.",
        emoji: "📒",
        description: "Bilanz, GuV, Buchungssätze, Abschreibungen, Rückstellungen, Cashflow.",
        accent: "from-amber-500 to-orange-600",
        topics: [
            { id: "balance_sheet", label: "Bilanzaufbau" },
            { id: "income_statement", label: "GuV" },
            { id: "bookings", label: "Buchungssätze" },
            { id: "depreciation", label: "Anlagevermögen & Abschreibungen" },
            { id: "inventory", label: "Vorräte & Umlaufvermögen" },
            { id: "provisions", label: "Rückstellungen & Verbindlichkeiten" },
            { id: "equity", label: "Eigenkapital" },
            { id: "cash_flow", label: "Kapitalflussrechnung" },
            { id: "hgb_ifrs", label: "HGB vs. IFRS" },
        ],
    },
    {
        id: "cost_accounting",
        label: "Cost Accounting",
        short: "Cost Acc.",
        emoji: "🧮",
        description: "Kostenarten, Kostenstellen, BAB, Deckungsbeitrag, Break-Even, Abweichungen.",
        accent: "from-rose-500 to-pink-600",
        topics: [
            { id: "cost_types", label: "Kostenartenrechnung" },
            { id: "cost_centers", label: "Kostenstellenrechnung & BAB" },
            { id: "cost_objects", label: "Kostenträgerrechnung" },
            { id: "full_vs_direct", label: "Voll- vs. Teilkostenrechnung" },
            { id: "contribution_margin", label: "Deckungsbeitrag & Break-Even" },
            { id: "variance", label: "Plankostenrechnung & Abweichungen" },
            { id: "abc", label: "Prozesskostenrechnung" },
        ],
    },
    {
        id: "entrepreneurship",
        label: "Entrepreneurship",
        short: "Entrepreneur.",
        emoji: "🚀",
        description: "Geschäftsmodelle, Lean Startup, Marktgröße, Finanzierung, Cap Table, Bewertung.",
        accent: "from-fuchsia-500 to-purple-600",
        topics: [
            { id: "opportunity", label: "Opportunity & Ideation" },
            { id: "business_model", label: "Business Model Canvas" },
            { id: "lean_startup", label: "Lean Startup & MVP" },
            { id: "market_sizing", label: "Marktgröße (TAM/SAM/SOM)" },
            { id: "funding", label: "Finanzierungsrunden" },
            { id: "cap_table", label: "Cap Table & Verwässerung" },
            { id: "startup_valuation", label: "Startup-Bewertung" },
            { id: "legal_team", label: "Rechtsform & Team" },
        ],
    },
    {
        id: "marketing",
        label: "Marketing",
        short: "Marketing",
        emoji: "📣",
        description: "STP, Marktforschung, 4P, Preisstrategien, Kundenwert und digitale Kennzahlen.",
        accent: "from-cyan-500 to-sky-600",
        topics: [
            { id: "basics_stp", label: "Grundlagen & STP" },
            { id: "research", label: "Marktforschung" },
            { id: "product", label: "Produktpolitik" },
            { id: "pricing", label: "Preispolitik" },
            { id: "distribution", label: "Distributionspolitik" },
            { id: "communication", label: "Kommunikationspolitik" },
            { id: "clv", label: "Kundenwert & CLV" },
            { id: "digital", label: "Digital-Marketing-Kennzahlen" },
        ],
    },
];

export const SUBJECT_MAP: Record<SubjectId, Subject> = Object.fromEntries(
    SUBJECTS.map((s) => [s.id, s])
) as Record<SubjectId, Subject>;

export function getSubject(id: string): Subject | undefined {
    return SUBJECT_MAP[id as SubjectId];
}

export function topicLabel(subjectId: string, topicId: string): string {
    return getSubject(subjectId)?.topics.find((t) => t.id === topicId)?.label ?? topicId;
}

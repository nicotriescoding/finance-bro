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
        description: "Interest, annuities, bonds, valuation, cost of capital, portfolio & options.",
        accent: "from-emerald-500 to-teal-600",
        topics: [
            { id: "interest", label: "Interest & Compounding" },
            { id: "annuities", label: "Annuities & Perpetuities" },
            { id: "repayment", label: "Loan Amortization" },
            { id: "bonds", label: "Bonds & Duration" },
            { id: "equity_valuation", label: "Equity Valuation" },
            { id: "ratios", label: "Ratio Analysis" },
            { id: "investment", label: "Capital Budgeting" },
            { id: "cost_of_capital", label: "Cost of Capital & WACC" },
            { id: "portfolio", label: "Portfolio Theory" },
            { id: "options", label: "Options & Derivatives" },
            { id: "capital_increase", label: "Rights Issues" },
        ],
    },
    {
        id: "econ1",
        label: "Economics 1 - Microeconomics",
        short: "Econ 1",
        emoji: "📉",
        description: "Supply & demand, elasticities, consumer and production theory, market structures.",
        accent: "from-sky-500 to-blue-600",
        topics: [
            { id: "supply_demand", label: "Supply & Demand" },
            { id: "elasticity", label: "Elasticities" },
            { id: "consumer", label: "Consumer Theory" },
            { id: "production_costs", label: "Production & Costs" },
            { id: "market_forms", label: "Market Structures" },
            { id: "welfare", label: "Welfare & Government Intervention" },
        ],
    },
    {
        id: "econ2",
        label: "Economics 2 - Macroeconomics",
        short: "Econ 2",
        emoji: "🏛️",
        description: "National accounts, inflation, labor market, monetary and fiscal policy, open economy.",
        accent: "from-indigo-500 to-violet-600",
        topics: [
            { id: "national_accounts", label: "National Accounts & GDP" },
            { id: "inflation", label: "Inflation & Price Indices" },
            { id: "labor", label: "Labor Market" },
            { id: "monetary", label: "Monetary Policy" },
            { id: "fiscal", label: "Fiscal Policy & Multiplier" },
            { id: "open_economy", label: "Open Economy" },
            { id: "growth", label: "Growth" },
        ],
    },
    {
        id: "financial_accounting",
        label: "Financial Accounting",
        short: "Financial Acc.",
        emoji: "📒",
        description: "Balance sheet, income statement, journal entries, depreciation, provisions, cash flow.",
        accent: "from-amber-500 to-orange-600",
        topics: [
            { id: "balance_sheet", label: "Balance Sheet Structure" },
            { id: "income_statement", label: "Income Statement" },
            { id: "bookings", label: "Journal Entries" },
            { id: "depreciation", label: "Fixed Assets & Depreciation" },
            { id: "inventory", label: "Inventory & Current Assets" },
            { id: "provisions", label: "Provisions & Liabilities" },
            { id: "equity", label: "Equity" },
            { id: "cash_flow", label: "Cash Flow Statement" },
            { id: "hgb_ifrs", label: "HGB vs. IFRS" },
        ],
    },
    {
        id: "cost_accounting",
        label: "Cost Accounting",
        short: "Cost Acc.",
        emoji: "🧮",
        description: "Cost types, cost centers, overhead allocation, contribution margin, break-even, variances.",
        accent: "from-rose-500 to-pink-600",
        topics: [
            { id: "cost_types", label: "Cost Type Accounting" },
            { id: "cost_centers", label: "Cost Center Accounting & Overhead Sheet" },
            { id: "cost_objects", label: "Cost Object Accounting" },
            { id: "full_vs_direct", label: "Absorption vs. Direct Costing" },
            { id: "contribution_margin", label: "Contribution Margin & Break-Even" },
            { id: "variance", label: "Standard Costing & Variances" },
            { id: "abc", label: "Activity-Based Costing" },
        ],
    },
    {
        id: "entrepreneurship",
        label: "Entrepreneurship",
        short: "Entrepreneur.",
        emoji: "🚀",
        description: "Business models, lean startup, market sizing, funding, cap table, valuation.",
        accent: "from-fuchsia-500 to-purple-600",
        topics: [
            { id: "opportunity", label: "Opportunity & Ideation" },
            { id: "business_model", label: "Business Model Canvas" },
            { id: "lean_startup", label: "Lean Startup & MVP" },
            { id: "market_sizing", label: "Market Sizing (TAM/SAM/SOM)" },
            { id: "funding", label: "Funding Rounds" },
            { id: "cap_table", label: "Cap Table & Dilution" },
            { id: "startup_valuation", label: "Startup Valuation" },
            { id: "legal_team", label: "Legal Form & Team" },
        ],
    },
    {
        id: "marketing",
        label: "Marketing",
        short: "Marketing",
        emoji: "📣",
        description: "STP, market research, the 4 Ps, pricing strategy, customer value and digital metrics.",
        accent: "from-cyan-500 to-sky-600",
        topics: [
            { id: "basics_stp", label: "Fundamentals & STP" },
            { id: "research", label: "Market Research" },
            { id: "product", label: "Product Policy" },
            { id: "pricing", label: "Pricing Policy" },
            { id: "distribution", label: "Distribution Policy" },
            { id: "communication", label: "Communication Policy" },
            { id: "clv", label: "Customer Value & CLV" },
            { id: "digital", label: "Digital Marketing Metrics" },
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

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
        // Topics are added together with the questions when the TUM exams for
        // this course are ingested (add-exam-questions skill).
        topics: [],
    },
    {
        id: "econ2",
        label: "Economics 2 - Macroeconomics",
        short: "Econ 2",
        emoji: "🏛️",
        description: "National accounts, inflation, labor market, monetary and fiscal policy, open economy.",
        accent: "from-indigo-500 to-violet-600",
        topics: [],
    },
    {
        id: "financial_accounting",
        label: "Financial Accounting",
        short: "Financial Acc.",
        emoji: "📒",
        description: "Balance sheet, income statement, journal entries, depreciation, provisions, cash flow.",
        accent: "from-amber-500 to-orange-600",
        topics: [],
    },
    {
        id: "cost_accounting",
        label: "Cost Accounting",
        short: "Cost Acc.",
        emoji: "🧮",
        description: "Cost types, cost centers, overhead allocation, contribution margin, break-even, variances.",
        accent: "from-rose-500 to-pink-600",
        topics: [],
    },
    {
        id: "entrepreneurship",
        label: "Entrepreneurship",
        short: "Entrepreneur.",
        emoji: "🚀",
        description: "Business models, lean startup, market sizing, funding, cap table, valuation.",
        accent: "from-fuchsia-500 to-purple-600",
        topics: [],
    },
    {
        id: "marketing",
        label: "Marketing",
        short: "Marketing",
        emoji: "📣",
        description: "STP, market research, the 4 Ps, pricing strategy, customer value and digital metrics.",
        accent: "from-cyan-500 to-sky-600",
        topics: [],
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

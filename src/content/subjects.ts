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
        // Topics derived from the TUM Economics I exercise exam WT22/23 and
        // the W22/23 problem sets 2-13.
        topics: [
            { id: "opportunity_cost", label: "Opportunity Cost & Pareto Efficiency" },
            { id: "comparative_advantage", label: "Comparative Advantage & Trade" },
            { id: "consumer_theory", label: "Consumer Theory" },
            { id: "production_costs", label: "Production & Cost Minimization" },
            { id: "perfect_competition", label: "Perfect Competition" },
            { id: "market_equilibrium", label: "Market Equilibrium, Surplus & Taxes" },
            { id: "monopoly", label: "Monopoly" },
            { id: "externalities", label: "Externalities & Pigouvian Taxes" },
            { id: "game_theory", label: "Game Theory" },
        ],
    },
    {
        id: "econ2",
        label: "Economics 2 - Macroeconomics",
        short: "Econ 2",
        emoji: "🏛️",
        description: "National accounts, inflation, labor market, monetary and fiscal policy, open economy.",
        accent: "from-indigo-500 to-violet-600",
        // Topics derived from the TUM Economics II exams SS2017-SS2019.
        topics: [
            { id: "gdp_accounting", label: "GDP Accounting & Value Added" },
            { id: "growth_rates", label: "Growth Rates & GDP per Capita" },
            { id: "real_nominal", label: "Real vs. Nominal GDP, Deflator & CPI" },
            { id: "inflation_interest", label: "Inflation & Real Interest Rates" },
            { id: "goods_market", label: "Goods Market & Fiscal Policy" },
            { id: "labor_market", label: "Efficiency Wages & Employment Rents" },
            { id: "intertemporal", label: "Intertemporal Choice" },
            { id: "technology_rd", label: "Technology Choice & R&D" },
            { id: "exchange_rates", label: "Exchange Rates" },
            { id: "solow", label: "Solow Growth Model" },
        ],
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
        // Topics derived from the TUM Cost Accounting exams SS2015-WS18/19 + Mock Exam.
        topics: [
            { id: "material_valuation", label: "Material Valuation (FIFO / LIFO / Averages)" },
            { id: "depreciation", label: "Depreciation Methods" },
            { id: "cost_allocation", label: "Cost-Center Allocation" },
            { id: "product_costing", label: "Product Costing & Overhead Rates" },
            { id: "process_costing", label: "Process Costing & Equivalent Units" },
            { id: "activity_based_costing", label: "Activity-Based Costing" },
            { id: "income_statements", label: "Absorption vs. Variable Costing" },
            { id: "cvp", label: "Break-Even & CVP Analysis" },
            { id: "production_program", label: "Production Program & Short-Term Decisions" },
        ],
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

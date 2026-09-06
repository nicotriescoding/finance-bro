import type { SubjectId } from "@/lib/questions/types";

/**
 * Server-rendered intro text for `/quiz?subject=<id>` (2026-09-06).
 *
 * Why it exists: the quiz itself is a client component that needs a stored
 * session, so a crawler or an AdSense reviewer used to see nothing but
 * "Loading...". This copy is real HTML in the first byte - one paragraph on
 * what the course exam asks and how the trainer works. It is hidden by CSS
 * while a run is open (the body carries `data-quiz-run`), so students only
 * see it before a run starts. Keep it factual, English, no exam names, no
 * claims of affiliation - "for the TUM course" is descriptive use.
 */
export const SUBJECT_INTROS: Record<SubjectId, string> = {
    finance:
        "Investment & Financial Management is the TUM bachelor course where the exam is pure calculation: compound interest and effective rates, annuities and perpetuities, loan amortisation schedules, bond prices and duration, share valuation, capital-budgeting decisions with NPV and IRR, the cost of capital and WACC, leverage, two-asset portfolios and simple option positions. Every posting here is an exam-style calculation with freshly drawn numbers each run, graded within a small tolerance, with the worked path shown once you settle it.",
    econ1:
        "Economics 1 covers microeconomics: opportunity cost and comparative advantage, consumer choice with budget lines and Cobb-Douglas or Leontief preferences, production and cost minimisation, perfect competition in the short and long run, market equilibrium with taxes, surplus and deadweight loss, monopoly pricing, externalities and Pigouvian taxes, price controls and public goods. The course exam is multiple choice, but the choices are the results of calculations - so this trainer asks for the number itself, with new parameters every time.",
    econ2:
        "Economics 2 is the macro course: GDP accounting and value added, growth rates, real versus nominal GDP with the deflator and CPI, inflation and real interest rates, the goods market and fiscal multipliers, labour-market statistics and efficiency wages, intertemporal choice, technology choice, exchange rates, money and banking, and the Solow growth model. Each posting is a self-contained calculation in the style of the course exam, with numbers redrawn per run and a formula hint that costs part of the payout.",
    financial_accounting:
        "Financial Accounting questions - balance sheets, journal entries, depreciation, provisions and cash-flow statements in the HGB/IFRS setting of the course - are in the works. Until the first postings land, practise Finance or Cost Accounting instead.",
    cost_accounting:
        "Cost Accounting asks for numbers: material valuation with FIFO, LIFO and averages, depreciation methods, cost-centre allocation including reciprocal service centres, overhead rates and product costing, process costing with equivalent units, activity-based costing, absorption versus variable costing income statements, break-even and CVP analysis, and short-term production-program decisions. The trainer redesigns every exam task with a new scenario and fresh figures, grades within a tolerance and shows the full allocation path afterwards.",
    entrepreneurship:
        "Entrepreneurship questions - business models, market sizing, funding rounds, cap tables and start-up valuation - are in the works. Until the first postings land, practise Finance or Econ 1 instead.",
    marketing:
        "Marketing questions - segmentation, market research statistics, pricing and the marketing mix - are in the works. Until the first postings land, practise one of the live subjects.",
};

/** Generic copy for `/quiz` without a subject. */
export const QUIZ_INTRO =
    "FinanceBro is a free exam trainer for the TUM business-administration bachelor: exam-style calculation questions for Finance, Economics 1 and 2 and Cost Accounting, with numbers redrawn on every run, tolerance grading, a paid formula hint and a worked solution after each posting. Pick a subject on the Career page to start a run.";

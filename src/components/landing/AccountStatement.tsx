"use client";

import Link from "next/link";
import { useCountUp } from "@/hooks/useCountUp";
import { useLevel } from "@/hooks/useLevel";
import { useScore } from "@/hooks/useScore";
import { getRank, ranks } from "@/lib/rankings";
import { formatMoney, MONEY } from "@/lib/money";

/**
 * The landing page as a banking app: account overview on navy (real balance,
 * current position, last payroll) and a statement of the month's spending.
 *
 * The transactions are decorative satire in €; the balance is real BroDollars
 * from localStorage. The exchange-rate footnote settles any confusion.
 */

const EUR_FMT = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const eur = (v: number) => `${EUR_FMT.format(v)} €`;

type Expense = {
    label: string;
    detail: string;
    amount: number;
    status?: "DECLINED" | "UNDER REVIEW";
};

/**
 * The month's spending, staged by rank: two ranks share a tier, and every
 * promotion upgrades the statement - same bad decisions, bigger numbers.
 * The 0DTE SPY calls close every tier; they are always a sure thing.
 */
const EXPENSE_TIERS: Expense[][] = [
    // tier 0 · Unemployed, Low Earner - survival mode
    [
        { label: "Instant noodles ×24, bulk", detail: "Today · meal plan Q3", amount: -13.8 },
        { label: "Oat milk flat white, one, shared", detail: "Today · campus coffee cart", amount: -4.65 },
        { label: "Supermarket own-brand matcha", detail: "Yesterday · almost tastes real", amount: -6.99 },
        { label: "Netflix, with ads", detail: "Yesterday · the password crackdown got Mom too", amount: -4.99 },
        { label: "LinkedIn Premium, free trial", detail: "3 days ago · will forget to cancel", amount: -0.0 },
        {
            label: "Gym membership, unused",
            detail: "3 days ago · month 14 of going 'next week'",
            amount: -9.9,
        },
        {
            label: "Bottle deposit refund, reversed",
            detail: "Last Friday · the machine rejected the crate",
            amount: -3.75,
            status: "UNDER REVIEW",
        },
        {
            label: "0DTE SPY calls",
            detail: "Last Friday · it was a sure thing",
            amount: -12.4,
            status: "DECLINED",
        },
    ],
    // tier 1 · Minimum Wage Grunt, Working Student - first payslip energy
    [
        { label: "Oat milk flat white ×4", detail: "Today · campus coffee cart", amount: -18.6 },
        { label: "Matcha, ceremonial grade", detail: "Today · limited seasonal drop", amount: -9.4 },
        {
            label: "LinkedIn Premium",
            detail: "Yesterday · 'an investment in my network'",
            amount: -39.99,
        },
        {
            label: "Blue-light glasses, no prescription",
            detail: "Yesterday · for the grind aesthetic",
            amount: -34.99,
        },
        { label: "Used textbook, previous owner cried in it", detail: "3 days ago · campus bookstore", amount: -24.9 },
        { label: "Aperol Spritz ×3, 'networking'", detail: "Last Friday · nobody networked", amount: -25.2 },
        {
            label: "Patagonia vest, outlet version",
            detail: "Last Friday · the uniform, entry level",
            amount: -49.9,
        },
        {
            label: "0DTE SPY calls",
            detail: "Last Friday · it was a sure thing",
            amount: -240.69,
            status: "DECLINED",
        },
    ],
    // tier 2 · Junior Consultant, Consultant - expensed, hopefully
    [
        { label: "Patagonia vest", detail: "Today · the uniform", amount: -149 },
        { label: "Rimowa carry-on, polished nightly", detail: "Today · consultant starter pack", amount: -680 },
        {
            label: "Hotel minibar, all of it",
            detail: "Yesterday · 'client engagement expense'",
            amount: -64.2,
            status: "UNDER REVIEW",
        },
        { label: "14 productivity apps, one used", detail: "Yesterday · the stack", amount: -87.32 },
        {
            label: "Rolex Submariner, financing",
            detail: "3 days ago · month 1 of 96",
            amount: -312.5,
            status: "DECLINED",
        },
        {
            label: "Bottle service, table by the DJ",
            detail: "Last Friday · P1 Munich",
            amount: -840,
            status: "DECLINED",
        },
        {
            label: "Powder, white",
            detail: "Last Friday · 'for the protein shakes'",
            amount: -90,
            status: "UNDER REVIEW",
        },
        {
            label: "0DTE SPY calls",
            detail: "Last Friday · it was a sure thing",
            amount: -2406.9,
            status: "DECLINED",
        },
    ],
    // tier 3 · Investmentbanker, VC Guy - the money is other people's
    [
        { label: "Rolex Submariner, paid in full", detail: "Today · the financing was beneath me", amount: -9150 },
        { label: "Personal trainer, 05:30 slot", detail: "Today · before the desk, after the cot", amount: -220 },
        {
            label: "Omakase, 'business development'",
            detail: "Yesterday · no business was developed",
            amount: -780,
            status: "UNDER REVIEW",
        },
        { label: "Maximilianstraße apartment, rent", detail: "Yesterday · 41 m² of location", amount: -4850 },
        {
            label: "Champagne tower, table by the DJ",
            detail: "Last Friday · P1 Munich, both floors",
            amount: -3200,
        },
        {
            label: "Angel check, vibes-based due diligence",
            detail: "Last Friday · 'the founder has great energy'",
            amount: -25000,
            status: "UNDER REVIEW",
        },
        {
            label: "0DTE SPY calls",
            detail: "Last Friday · it was a sure thing",
            amount: -48000,
            status: "DECLINED",
        },
    ],
    // tier 4 · Managing Director, Unicorn Founder - lifestyle as balance sheet
    [
        { label: "G-Wagon lease ×2", detail: "Today · one for each mood", amount: -4380 },
        { label: "Leadership retreat, desert, barefoot", detail: "Today · found himself, lost the Q3 numbers", amount: -27900 },
        {
            label: "Contemporary art, uninspected",
            detail: "Yesterday · 'for the office' · never shipped",
            amount: -95000,
            status: "UNDER REVIEW",
        },
        { label: "Boarding school fees, twins", detail: "Yesterday · they email him quarterly", amount: -18400 },
        { label: "Yacht, fractional, back half", detail: "3 days ago · 1/8th of the part that doesn't steer", amount: -62500 },
        {
            label: "Divorce lawyer, retainer",
            detail: "Last Friday · she found the second G-Wagon",
            amount: -50000,
        },
        {
            label: "0DTE SPY calls",
            detail: "Last Friday · it was a sure thing",
            amount: -850000,
            status: "DECLINED",
        },
    ],
    // tier 5 · Jeff Bezzo's, FinanceBro - the statement of a small nation
    [
        { label: "Rocket fuel, top-up", detail: "Today · Tuesday joyride", amount: -2400000 },
        { label: "Doomsday bunker, New Zealand", detail: "Today · 'a hedge, basically'", amount: -12500000 },
        {
            label: "Mona Lisa, replica, told everyone it's real",
            detail: "Yesterday · the Louvre wouldn't pick up",
            amount: -450000,
        },
        { label: "Senate hearing prep, consultants", detail: "Yesterday · 'I'll just be myself' · overruled", amount: -1200000 },
        { label: "Small coastal island, impulse", detail: "3 days ago · it was next to the other one", amount: -380000000 },
        {
            label: "Social media platform, impulse",
            detail: "Last Friday · renamed it by Monday",
            amount: -44000000000,
            status: "UNDER REVIEW",
        },
        {
            label: "0DTE SPY calls",
            detail: "Last Friday · it was a sure thing",
            amount: -2147483647,
            status: "DECLINED",
        },
    ],
];

/** Two ranks share a tier, capped at the last tier. */
function expensesForRank(rankIndex: number): Expense[] {
    const tier = Math.min(
        EXPENSE_TIERS.length - 1,
        Math.floor(Math.max(0, rankIndex) / 2)
    );
    return EXPENSE_TIERS[tier];
}

export default function AccountStatement() {
    const { score } = useScore();
    const { level } = useLevel(score);
    const rank = getRank(level);
    const display = useCountUp(score);
    const expenses = expensesForRank(ranks.indexOf(rank));

    return (
        <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 text-left md:max-w-3xl">
            {/* account overview - the navy card */}
            <div className="flex flex-col gap-4 rounded-[14px] bg-ink p-5 text-[#e8eef5] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                    <span className="caps-label text-[10px] tracking-[.16em] text-muted-light">
                        FinanceBro Private Banking
                    </span>
                    <span className="caps-label text-[10px] text-muted-light">Checking</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="caps-label text-[10px] tracking-[.16em] text-muted-light">
                        Available balance
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[44px] font-extrabold leading-none tabular-nums">
                            {formatMoney(display)}
                        </span>
                        <span className="text-xl">{MONEY}</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-ink-line pt-3 text-[13px]">
                    <span className="font-bold">
                        {rank.emoji} {rank.title}
                    </span>
                    <span className="tabular-nums text-[#b7c8d9]">
                        Last payroll: +{eur(rank.salary)}
                    </span>
                </div>
                <span className="caps-label text-[9px] tracking-[.14em] text-muted-light">
                    IBAN DE00 BROK 0000 0000 0097 · BIC BROKEAF
                </span>
                <Link
                    href="/career"
                    className="rounded-[12px] bg-brand px-9 py-4 text-center text-lg font-extrabold text-white shadow-[0_2px_8px_rgba(15,33,55,.18)] transition hover:bg-[#175a3a]"
                >
                    Make some money 🤑
                </Link>
                <p className="text-center text-[12px] text-muted-light">
                    Pick a career, tick your topics, start earning. Quitting is allowed,
                    unlike at your future employer.
                </p>
            </div>

            {/* the statement - satire in €, sadly relatable */}
            <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface">
                <div className="flex items-center justify-between gap-3 border-b border-hairline-soft px-3.5 py-2.5">
                    <span className="caps-label text-[10px] text-muted">Recent transactions</span>
                    <span className="caps-label text-[9px] text-muted-light">This month</span>
                </div>

                {/* the one credit: last payroll of the current position */}
                <div className="flex items-center justify-between gap-3 border-b border-[#f4f7fa] px-3.5 py-2.5">
                    <div className="flex min-w-0 flex-col">
                        <span className="text-[13px] font-bold leading-snug text-ledger sm:truncate">
                            Salary · {rank.title}
                        </span>
                        <span className="caps-label text-[9px] leading-snug text-ledger-mute sm:truncate">
                            Today · SEPA credit
                        </span>
                    </div>
                    <span
                        className={`shrink-0 text-[13px] font-extrabold tabular-nums ${
                            rank.salary > 0 ? "text-brand" : "text-ledger-mute"
                        }`}
                    >
                        +{eur(rank.salary)}
                    </span>
                </div>

                {expenses.map((e) => (
                    <div
                        key={e.label}
                        className="flex items-center justify-between gap-3 border-b border-[#f4f7fa] px-3.5 py-2.5"
                    >
                        <div className="flex min-w-0 flex-col">
                            <span
                                className={`text-[13px] leading-snug text-ledger [text-wrap:pretty] sm:truncate ${
                                    e.status ? "opacity-60" : ""
                                }`}
                            >
                                {e.label}
                            </span>
                            <span className="caps-label text-[9px] leading-snug text-ledger-mute sm:truncate">
                                {e.detail}
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {e.status && (
                                <span
                                    className={`caps-label rounded-full px-2 py-0.5 text-[8px] ${
                                        e.status === "DECLINED"
                                            ? "bg-warn-tint text-warn"
                                            : "bg-chip text-muted"
                                    }`}
                                >
                                    {e.status}
                                </span>
                            )}
                            <span
                                className={`text-[13px] font-extrabold tabular-nums ${
                                    e.status ? "text-ledger-mute line-through" : "text-ink"
                                }`}
                            >
                                −{eur(Math.abs(e.amount))}
                            </span>
                        </div>
                    </div>
                ))}

                <div className="flex items-center justify-between gap-3 border-b border-[#f4f7fa] px-3.5 py-2.5 text-[13px]">
                    <span className="text-ledger-mute">Monthly account fee</span>
                    <span className="shrink-0 font-extrabold text-ledger-mute">0.00 € · we sell ads</span>
                </div>
                <div className="px-3.5 py-2.5">
                    <span className="caps-label text-[9px] text-ledger-mute">
                        {MONEY}/€ exchange rate: 0.0000 · your BroDollars are safe from all of this
                    </span>
                </div>
            </div>
        </div>
    );
}

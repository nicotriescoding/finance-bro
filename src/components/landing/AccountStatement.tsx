"use client";

import Link from "next/link";
import { useCountUp } from "@/hooks/useCountUp";
import { useLevel } from "@/hooks/useLevel";
import { useScore } from "@/hooks/useScore";
import { getRank } from "@/lib/rankings";
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

const EXPENSES: Expense[] = [
    { label: "Oat milk flat white ×4", detail: "Today · campus coffee cart", amount: -18.6 },
    { label: "Matcha, ceremonial grade", detail: "Today · limited seasonal drop", amount: -9.4 },
    {
        label: "LinkedIn Premium",
        detail: "Yesterday · 'an investment in my network'",
        amount: -39.99,
    },
    { label: "Patagonia vest", detail: "Yesterday · the uniform", amount: -149 },
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
];

export default function AccountStatement() {
    const { score } = useScore();
    const { level } = useLevel(score);
    const rank = getRank(level);
    const display = useCountUp(score);

    return (
        <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 text-left">
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
                        <span className="truncate text-[13px] font-bold text-ledger">
                            Salary · {rank.title}
                        </span>
                        <span className="caps-label truncate text-[9px] text-ledger-mute">
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

                {EXPENSES.map((e) => (
                    <div
                        key={e.label}
                        className="flex items-center justify-between gap-3 border-b border-[#f4f7fa] px-3.5 py-2.5"
                    >
                        <div className="flex min-w-0 flex-col">
                            <span
                                className={`truncate text-[13px] text-ledger ${
                                    e.status ? "opacity-60" : ""
                                }`}
                            >
                                {e.label}
                            </span>
                            <span className="caps-label truncate text-[9px] text-ledger-mute">
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

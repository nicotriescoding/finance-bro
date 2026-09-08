"use client";

import Link from "next/link";
import { useCountUp } from "@/hooks/useCountUp";
import { useRank } from "@/hooks/useRank";
import { useScore } from "@/hooks/useScore";
import { formatMoney, MONEY } from "@/lib/money";
import { statementFor } from "@/content/statements";

/**
 * The landing page as a banking app: account overview on navy (real balance,
 * current position, last payroll) and a statement of the month's spending.
 *
 * The transactions are decorative satire in €, one list per rung of the
 * ladder (`src/content/statements.ts`); the balance is real BroDollars from
 * localStorage. The exchange-rate footnote settles any confusion.
 */

const EUR_FMT = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
/**
 * € with cents up to six digits; millions and billions compact ("2.4 m €",
 * "44.0 bn €") so the upper statements stay in one line on a phone.
 */
const eur = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1e9) return `${(v / 1e9).toFixed(1)} bn €`;
    if (abs >= 1e6) return `${(v / 1e6).toFixed(1)} m €`;
    return `${EUR_FMT.format(v)} €`;
};

export default function AccountStatement() {
    const { score } = useScore();
    const { rank, ladderIndex } = useRank(score);
    const display = useCountUp(score);
    const expenses = statementFor(ladderIndex);

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
